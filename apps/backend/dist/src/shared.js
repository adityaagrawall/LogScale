"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestPayloadSchema = exports.TelemetryLogSchema = exports.RawEventSchema = void 0;
const zod_1 = require("zod");
exports.RawEventSchema = zod_1.z.object({
    eventName: zod_1.z.string().min(1, 'Event name is required'),
    userId: zod_1.z.string().min(1, 'User ID is required'),
    properties: zod_1.z.record(zod_1.z.any()).optional().default({}),
    timestamp: zod_1.z.string().datetime().optional()
});
exports.TelemetryLogSchema = zod_1.z.object({
    serviceName: zod_1.z.string().min(1, 'Service name is required'),
    endpoint: zod_1.z.string().min(1, 'Endpoint is required'),
    statusCode: zod_1.z.number().int(),
    durationMs: zod_1.z.number().positive(),
    meta: zod_1.z.record(zod_1.z.any()).optional().default({}),
    timestamp: zod_1.z.string().datetime().optional()
});
exports.IngestPayloadSchema = zod_1.z.object({
    events: zod_1.z.array(exports.RawEventSchema).optional().default([]),
    telemetry: zod_1.z.array(exports.TelemetryLogSchema).optional().default([])
}).refine((data) => data.events.length > 0 || data.telemetry.length > 0, { message: 'Ingestion payload must contain at least one raw event or telemetry log' });
//# sourceMappingURL=shared.js.map