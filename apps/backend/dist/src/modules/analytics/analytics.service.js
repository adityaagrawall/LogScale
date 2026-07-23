"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFunnelAnalysis(orgId, steps, startDate, endDate = new Date()) {
        if (!steps || steps.length === 0) {
            return [];
        }
        let cteChain = `
      WITH step_0 AS (
        SELECT DISTINCT user_id, MIN(timestamp) as step_time
        FROM raw_events
        WHERE org_id = $1 AND event_name = $2 AND timestamp BETWEEN $3 AND $4
        GROUP BY user_id
      )
    `;
        const selectColumns = [`(SELECT COUNT(*) FROM step_0) as step_0_count`];
        const params = [orgId, steps[0], startDate, endDate];
        for (let i = 1; i < steps.length; i++) {
            params.push(steps[i]);
            const stepParamIdx = params.length;
            cteChain += `,
      step_${i} AS (
        SELECT DISTINCT e.user_id, MIN(e.timestamp) as step_time
        FROM raw_events e
        INNER JOIN step_${i - 1} prev ON e.user_id = prev.user_id AND e.timestamp >= prev.step_time
        WHERE e.org_id = $1 AND e.event_name = $${stepParamIdx} AND e.timestamp BETWEEN $3 AND $4
        GROUP BY e.user_id
      )`;
            selectColumns.push(`(SELECT COUNT(*) FROM step_${i}) as step_${i}_count`);
        }
        const query = `${cteChain} SELECT ${selectColumns.join(', ')}`;
        const rawResult = await this.prisma.$queryRawUnsafe(query, ...params);
        const row = rawResult[0] || {};
        const firstStepUsers = Number(row[`step_0_count`] || 0);
        const funnelResults = steps.map((stepName, idx) => {
            const currentUsers = Number(row[`step_${idx}_count`] || 0);
            const prevUsers = idx === 0 ? currentUsers : Number(row[`step_${idx - 1}_count`] || 0);
            const conversionPercentage = firstStepUsers > 0
                ? Math.round((currentUsers / firstStepUsers) * 1000) / 10
                : 0;
            const dropoffCount = prevUsers - currentUsers;
            const dropoffPercentage = prevUsers > 0
                ? Math.round((dropoffCount / prevUsers) * 1000) / 10
                : 0;
            return {
                stepIndex: idx,
                stepName,
                userCount: currentUsers,
                conversionPercentage,
                dropoffCount,
                dropoffPercentage,
            };
        });
        return funnelResults;
    }
    async getCohortRetention(orgId, weeks = 8) {
        const query = `
      WITH user_cohorts AS (
        SELECT 
          user_id,
          DATE_TRUNC('week', MIN(timestamp))::date AS cohort_week
        FROM raw_events
        WHERE org_id = $1
        GROUP BY user_id
      ),
      user_activity AS (
        SELECT DISTINCT
          c.user_id,
          c.cohort_week,
          FLOOR(EXTRACT(EPOCH FROM (DATE_TRUNC('week', e.timestamp) - c.cohort_week)) / (7 * 86400))::int AS week_offset
        FROM user_cohorts c
        INNER JOIN raw_events e ON c.user_id = e.user_id AND e.org_id = $1
      ),
      cohort_sizes AS (
        SELECT 
          cohort_week,
          COUNT(DISTINCT user_id)::int AS total_users
        FROM user_cohorts
        GROUP BY cohort_week
      )
      SELECT 
        a.cohort_week::text AS "cohortWeek",
        s.total_users AS "totalUsers",
        a.week_offset AS "weekOffset",
        COUNT(DISTINCT a.user_id)::int AS "activeUsers"
      FROM user_activity a
      INNER JOIN cohort_sizes s ON a.cohort_week = s.cohort_week
      WHERE a.week_offset >= 0 AND a.week_offset <= $2
      GROUP BY a.cohort_week, s.total_users, a.week_offset
      ORDER BY a.cohort_week DESC, a.week_offset ASC
    `;
        const rawRows = await this.prisma.$queryRawUnsafe(query, orgId, weeks);
        const matrixMap = {};
        for (const r of rawRows) {
            const weekStr = r.cohortWeek.split('T')[0];
            if (!matrixMap[weekStr]) {
                matrixMap[weekStr] = {
                    cohortWeek: weekStr,
                    totalUsers: r.totalUsers,
                    retention: {},
                };
            }
            const pct = r.totalUsers > 0 ? Math.round((r.activeUsers / r.totalUsers) * 1000) / 10 : 0;
            matrixMap[weekStr].retention[r.weekOffset] = {
                users: r.activeUsers,
                percentage: pct,
            };
        }
        return Object.values(matrixMap);
    }
    async getSystemTelemetryLatency(orgId, timeframeMinutes = 60) {
        const cutoff = new Date(Date.now() - timeframeMinutes * 60 * 1000);
        const query = `
      SELECT 
        service_name AS "serviceName",
        endpoint,
        COUNT(*)::int AS "totalRequests",
        ROUND((COUNT(*) FILTER (WHERE status_code >= 400)::numeric / GREATEST(COUNT(*), 1)::numeric) * 100, 2)::float AS "errorRatePercentage",
        ROUND(COALESCE(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p50Ms",
        ROUND(COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p95Ms",
        ROUND(COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p99Ms",
        ROUND(COALESCE(MIN(duration_ms), 0)::numeric, 2)::float AS "minMs",
        ROUND(COALESCE(MAX(duration_ms), 0)::numeric, 2)::float AS "maxMs"
      FROM telemetry_logs
      WHERE org_id = $1 AND timestamp >= $2
      GROUP BY service_name, endpoint
      ORDER BY "totalRequests" DESC
    `;
        return this.prisma.$queryRawUnsafe(query, orgId, cutoff);
    }
    async getLatencyTimeSeries(orgId, hours = 24) {
        const query = `
      SELECT 
        DATE_TRUNC('hour', timestamp) AS "timeBucket",
        service_name AS "serviceName",
        ROUND(COALESCE(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p50Ms",
        ROUND(COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p95Ms",
        ROUND(COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 0)::numeric, 2)::float AS "p99Ms",
        COUNT(*)::int AS "requestCount"
      FROM telemetry_logs
      WHERE org_id = $1 AND timestamp >= NOW() - ($2 || ' hours')::interval
      GROUP BY DATE_TRUNC('hour', timestamp), service_name
      ORDER BY "timeBucket" ASC
    `;
        return this.prisma.$queryRawUnsafe(query, orgId, hours.toString());
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map