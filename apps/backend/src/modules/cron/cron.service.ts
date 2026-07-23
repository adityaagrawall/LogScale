import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run every night at midnight to roll up previous day's metrics into DailyAggregates
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRollup() {
    this.logger.log('Starting daily metrics aggregation cron job...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    const targetDate = new Date(dateStr);

    const orgs = await this.prisma.organization.findMany({ select: { id: true } });

    for (const org of orgs) {
      try {
        // Roll up daily event counts per event_name
        const eventCounts: any[] = await this.prisma.$queryRaw`
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

        // Roll up telemetry latency stats
        const telemetryStats: any[] = await this.prisma.$queryRaw`
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
      } catch (err) {
        this.logger.error(`Failed daily rollup for Org ${org.id}: ${err.message}`);
      }
    }
  }
}
