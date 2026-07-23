import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IngestPayloadSchema, IngestPayload, IngestionResponse } from '../../shared';
import { Subject } from 'rxjs';

export interface StreamEvent {
  orgId: string;
  type: 'raw_event' | 'telemetry_log';
  data: any;
}

@Injectable()
export class IngestionService {
  // Shared RxJS Subject for Server-Sent Events (SSE) live stream
  public static readonly stream$ = new Subject<StreamEvent>();

  constructor(
    @InjectQueue('telemetry-ingestion-queue') private readonly queue: Queue,
  ) {}

  async enqueuePayload(orgId: string, rawPayload: unknown): Promise<IngestionResponse> {
    const startTime = Date.now();

    // 1. Strict validation using Zod
    const validationResult = IngestPayloadSchema.safeParse(rawPayload);
    if (!validationResult.success) {
      throw new BadRequestException({
        message: 'Invalid ingestion payload format',
        errors: validationResult.error.flatten(),
      });
    }

    const payload: IngestPayload = validationResult.data;
    const eventsCount = payload.events?.length || 0;
    const telemetryCount = payload.telemetry?.length || 0;

    // 2. Non-blocking async push to Redis queue via BullMQ
    const job = await this.queue.add('ingest-batch', {
      orgId,
      events: payload.events,
      telemetry: payload.telemetry,
      enqueuedAt: new Date().toISOString(),
    }, {
      removeOnComplete: true,
      removeOnFail: 100,
    });

    // 3. Emit events to live SSE stream for real-time dashboard updates
    if (payload.events) {
      payload.events.forEach((ev) => {
        IngestionService.stream$.next({ orgId, type: 'raw_event', data: ev });
      });
    }
    if (payload.telemetry) {
      payload.telemetry.forEach((tel) => {
        IngestionService.stream$.next({ orgId, type: 'telemetry_log', data: tel });
      });
    }

    const duration = Date.now() - startTime;

    return {
      status: 'accepted',
      statusCode: 202,
      message: `Payload successfully enqueued in ${duration}ms`,
      jobId: job.id || 'job-queued',
      processedAt: new Date().toISOString(),
      queuedItems: {
        eventsCount,
        telemetryCount,
      },
    };
  }
}
