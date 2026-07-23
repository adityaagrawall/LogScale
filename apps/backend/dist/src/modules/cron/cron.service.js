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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
let CronService = CronService_1 = class CronService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CronService_1.name);
    }
    async handleDailyRollup() {
        this.logger.log('Starting daily metrics aggregation cron job...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        const targetDate = new Date(dateStr);
        const orgs = await this.prisma.organization.findMany({ select: { id: true } });
        for (const org of orgs) {
            try {
                const eventCounts = await this.prisma.$queryRaw `
          SELECT 
            event_name AS "eventName",
            COUNT(*)::int AS "count",
            COUNT(DISTINCT user_id)::int AS "uniqueUsers"
          FROM raw_events
          WHERE org_id = ${org.id} 
            AND timestamp >= ${targetDate} 
            AND timestamp < ${new Date(targetDate.getTime() + 86400000)}
          GROUP BY event_name
        `;
                for (const ec of eventCounts) {
                    await this.prisma.dailyAggregate.upsert({
                        where: {
                            orgId_date_metricType_dimensionKey: {
                                orgId: org.id,
                                date: targetDate,
                                metricType: 'event_count',
                                dimensionKey: ec.eventName,
                            },
                        },
                        create: {
                            orgId: org.id,
                            date: targetDate,
                            metricType: 'event_count',
                            dimensionKey: ec.eventName,
                            metrics: { count: ec.count, uniqueUsers: ec.uniqueUsers },
                        },
                        update: {
                            metrics: { count: ec.count, uniqueUsers: ec.uniqueUsers },
                        },
                    });
                }
                const telemetryStats = await this.prisma.$queryRaw `
          SELECT 
            service_name AS "serviceName",
            endpoint,
            COUNT(*)::int AS "totalRequests",
            ROUND((COUNT(*) FILTER (WHERE status_code >= 400)::numeric / GREATEST(COUNT(*), 1)::numeric) * 100, 2)::float AS "errorRatePercentage",
            ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_ms)::numeric, 2)::float AS "p50Ms",
            ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::numeric, 2)::float AS "p95Ms",
            ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms)::numeric, 2)::float AS "p99Ms"
          FROM telemetry_logs
          WHERE org_id = ${org.id} 
            AND timestamp >= ${targetDate} 
            AND timestamp < ${new Date(targetDate.getTime() + 86400000)}
          GROUP BY service_name, endpoint
        `;
                for (const stat of telemetryStats) {
                    const dimensionKey = `${stat.serviceName}:${stat.endpoint}`;
                    await this.prisma.dailyAggregate.upsert({
                        where: {
                            orgId_date_metricType_dimensionKey: {
                                orgId: org.id,
                                date: targetDate,
                                metricType: 'telemetry_latency',
                                dimensionKey,
                            },
                        },
                        create: {
                            orgId: org.id,
                            date: targetDate,
                            metricType: 'telemetry_latency',
                            dimensionKey,
                            metrics: stat,
                        },
                        update: {
                            metrics: stat,
                        },
                    });
                }
                this.logger.log(`Completed daily rollup for Org ${org.id}`);
            }
            catch (err) {
                this.logger.error(`Failed daily rollup for Org ${org.id}: ${err.message}`);
            }
        }
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleDailyRollup", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CronService);
//# sourceMappingURL=cron.service.js.map