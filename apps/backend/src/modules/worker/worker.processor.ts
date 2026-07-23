import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

interface IngestJobData {
  orgId: string;
  events?: Array<{
    eventName: string;
    userId: string;
    properties?: any;
    timestamp?: string;
  }>;
  telemetry?: Array<{
    serviceName: string;
    endpoint: string;
    statusCode: number;
    durationMs: number;
    meta?: any;
    timestamp?: string;
  }>;
}

@Processor('telemetry-ingestion-queue', { concurrency: 5 })
export class WorkerProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkerProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<IngestJobData, any, string>): Promise<any> {
    const { orgId, events = [], telemetry = [] } = job.data;
    const startTime = Date.now();

    try {
      // 1. Bulk insert raw events using createMany in optimized batch size
      if (events.length > 0) {
        const rawEventRecords = events.map((ev) => ({
          orgId,
          eventName: ev.eventName,
          userId: ev.userId,
          properties: ev.properties || {},
          timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
        }));

        // Dynamic chunking into batches of 250 to avoid max parameters query limits
        const chunkSize = 250;
        for (let i = 0; i < rawEventRecords.length; i += chunkSize) {
          const chunk = rawEventRecords.slice(i, i + chunkSize);
          await this.prisma.rawEvent.createMany({
            data: chunk,
          });
        }
      }

      // 2. Bulk insert telemetry logs
      if (telemetry.length > 0) {
        const telemetryRecords = telemetry.map((tel) => ({
          orgId,
          serviceName: tel.serviceName,
          endpoint: tel.endpoint,
          statusCode: tel.statusCode,
          durationMs: tel.durationMs,
          meta: tel.meta || {},
          timestamp: tel.timestamp ? new Date(tel.timestamp) : new Date(),
        }));

        const chunkSize = 250;
        for (let i = 0; i < telemetryRecords.length; i += chunkSize) {
          const chunk = telemetryRecords.slice(i, i + chunkSize);
          await this.prisma.telemetryLog.createMany({
            data: chunk,
          });
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Job ${job.id} processed: ${events.length} events, ${telemetry.length} telemetry logs in ${duration}ms (Org: ${orgId})`
      );

      return { insertedEvents: events.length, insertedTelemetry: telemetry.length, durationMs: duration };
    } catch (error) {
      this.logger.error(`Failed to process batch job ${job.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
