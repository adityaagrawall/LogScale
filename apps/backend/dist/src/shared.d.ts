import { z } from 'zod';
export declare const RawEventSchema: z.ZodObject<{
    eventName: z.ZodString;
    userId: z.ZodString;
    properties: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventName?: string;
    userId?: string;
    properties?: Record<string, any>;
    timestamp?: string;
}, {
    eventName?: string;
    userId?: string;
    properties?: Record<string, any>;
    timestamp?: string;
}>;
export type RawEventPayload = z.infer<typeof RawEventSchema>;
export declare const TelemetryLogSchema: z.ZodObject<{
    serviceName: z.ZodString;
    endpoint: z.ZodString;
    statusCode: z.ZodNumber;
    durationMs: z.ZodNumber;
    meta: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string;
    serviceName?: string;
    endpoint?: string;
    statusCode?: number;
    durationMs?: number;
    meta?: Record<string, any>;
}, {
    timestamp?: string;
    serviceName?: string;
    endpoint?: string;
    statusCode?: number;
    durationMs?: number;
    meta?: Record<string, any>;
}>;
export type TelemetryLogPayload = z.infer<typeof TelemetryLogSchema>;
export declare const IngestPayloadSchema: z.ZodEffects<z.ZodObject<{
    events: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        eventName: z.ZodString;
        userId: z.ZodString;
        properties: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }, {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }>, "many">>>;
    telemetry: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        serviceName: z.ZodString;
        endpoint: z.ZodString;
        statusCode: z.ZodNumber;
        durationMs: z.ZodNumber;
        meta: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }, {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    telemetry?: {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }[];
    events?: {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }[];
}, {
    telemetry?: {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }[];
    events?: {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }[];
}>, {
    telemetry?: {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }[];
    events?: {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }[];
}, {
    telemetry?: {
        timestamp?: string;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
        durationMs?: number;
        meta?: Record<string, any>;
    }[];
    events?: {
        eventName?: string;
        userId?: string;
        properties?: Record<string, any>;
        timestamp?: string;
    }[];
}>;
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
    retentionByOffset: Record<number, {
        users: number;
        percentage: number;
    }>;
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
