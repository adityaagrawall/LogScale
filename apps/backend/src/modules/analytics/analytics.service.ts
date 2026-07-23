import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Funnel Analysis using CTEs and timestamp window constraints
   */
  async getFunnelAnalysis(orgId: string, steps: string[], startDate: Date, endDate: Date = new Date()) {
    if (!steps || steps.length === 0) {
      return [];
    }

    // Build dynamic SQL query for multi-step funnel drop-offs
    let cteChain = `
      WITH step_0 AS (
        SELECT DISTINCT user_id, MIN(timestamp) as step_time
        FROM raw_events
        WHERE org_id = $1 AND event_name = $2 AND timestamp BETWEEN $3 AND $4
        GROUP BY user_id
      )
    `;

    const selectColumns = [`(SELECT COUNT(*) FROM step_0) as step_0_count`];
    const params: any[] = [orgId, steps[0], startDate, endDate];

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
    const rawResult: any[] = await this.prisma.$queryRawUnsafe(query, ...params);
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

  /**
   * 2. Cohort Retention Matrix (N-Week user retention)
   */
  async getCohortRetention(orgId: string, weeks: number = 8) {
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

    const rawRows: any[] = await this.prisma.$queryRawUnsafe(query, orgId, weeks);

    // Pivot raw SQL rows into cohort matrix object format
    const matrixMap: Record<string, { cohortWeek: string; totalUsers: number; retention: Record<number, { users: number; percentage: number }> }> = {};

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

  /**
   * 3. System Telemetry Performance (p50, p95, p99 latencies and error rate %)
   */
  async getSystemTelemetryLatency(orgId: string, timeframeMinutes: number = 60) {
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

  /**
   * 4. Telemetry Latency Time-Series Over Time (for dashboard charts)
   */
  async getLatencyTimeSeries(orgId: string, hours: number = 24) {
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
}
