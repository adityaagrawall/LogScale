import { z } from 'zod';

export const RawEventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required'),
  userId: z.string().min(1, 'User ID is required'),
  properties: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional()
});

export type RawEventPayload = z.infer<typeof RawEventSchema>;

export const TelemetryLogSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  statusCode: z.number().int(),
  durationMs: z.number().positive(),
  meta: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional()
});

export type TelemetryLogPayload = z.infer<typeof TelemetryLogSchema>;

export const IngestPayloadSchema = z.object({
  events: z.array(RawEventSchema).optional().default([]),
  telemetry: z.array(TelemetryLogSchema).optional().default([])
}).refine(
  (data) => data.events.length > 0 || data.telemetry.length > 0,
  { message: 'Ingestion payload must contain at least one raw event or telemetry log' }
);

export type IngestPayload = z.infer<typeof IngestPayloadSchema>;

export interface IngestionResponse {
  status: 'accepted';
  statusCode: 202;
  message: string;
  jobId: string;
  processedAt: string;
  queuedItems: {
    eventsCount: number;
    telemetryCount: number;
  };
}

export interface FunnelStepResult {
  stepIndex: number;
  stepName: string;
  userCount: number;
  conversionPercentage: number;
  dropoffCount: number;
  dropoffPercentage: number;
}

export interface CohortMatrixCell {
  cohortDate: string;
  totalUsers: number;
  retentionByOffset: Record<number, { users: number; percentage: number }>;
}

export interface SystemLatencyPercentiles {
  serviceName: string;
  endpoint: string;
  totalRequests: number;
  errorRatePercentage: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
}
