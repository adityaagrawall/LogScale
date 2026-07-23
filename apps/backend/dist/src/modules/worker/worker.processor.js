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
var WorkerProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkerProcessor = WorkerProcessor_1 = class WorkerProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(WorkerProcessor_1.name);
    }
    async process(job) {
        const { orgId, events = [], telemetry = [] } = job.data;
        const startTime = Date.now();
        try {
            if (events.length > 0) {
                const rawEventRecords = events.map((ev) => ({
                    orgId,
                    eventName: ev.eventName,
                    userId: ev.userId,
                    properties: ev.properties || {},
                    timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
                }));
                const chunkSize = 250;
                for (let i = 0; i < rawEventRecords.length; i += chunkSize) {
                    const chunk = rawEventRecords.slice(i, i + chunkSize);
                    await this.prisma.rawEvent.createMany({
                        data: chunk,
                    });
                }
            }
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
            this.logger.log(`Job ${job.id} processed: ${events.length} events, ${telemetry.length} telemetry logs in ${duration}ms (Org: ${orgId})`);
            return { insertedEvents: events.length, insertedTelemetry: telemetry.length, durationMs: duration };
        }
        catch (error) {
            this.logger.error(`Failed to process batch job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.WorkerProcessor = WorkerProcessor;
exports.WorkerProcessor = WorkerProcessor = WorkerProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('telemetry-ingestion-queue', { concurrency: 5 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerProcessor);
//# sourceMappingURL=worker.processor.js.map