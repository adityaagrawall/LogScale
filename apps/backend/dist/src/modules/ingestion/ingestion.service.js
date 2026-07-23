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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const shared_1 = require("../../shared");
const rxjs_1 = require("rxjs");
let IngestionService = IngestionService_1 = class IngestionService {
    constructor(queue) {
        this.queue = queue;
    }
    async enqueuePayload(orgId, rawPayload) {
        const startTime = Date.now();
        const validationResult = shared_1.IngestPayloadSchema.safeParse(rawPayload);
        if (!validationResult.success) {
            throw new common_1.BadRequestException({
                message: 'Invalid ingestion payload format',
                errors: validationResult.error.flatten(),
            });
        }
        const payload = validationResult.data;
        const eventsCount = payload.events?.length || 0;
        const telemetryCount = payload.telemetry?.length || 0;
        const job = await this.queue.add('ingest-batch', {
            orgId,
            events: payload.events,
            telemetry: payload.telemetry,
            enqueuedAt: new Date().toISOString(),
        }, {
            removeOnComplete: true,
            removeOnFail: 100,
        });
        if (payload.events) {
            payload.events.forEach((ev) => {
                IngestionService_1.stream$.next({ orgId, type: 'raw_event', data: ev });
            });
        }
        if (payload.telemetry) {
            payload.telemetry.forEach((tel) => {
                IngestionService_1.stream$.next({ orgId, type: 'telemetry_log', data: tel });
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
};
exports.IngestionService = IngestionService;
IngestionService.stream$ = new rxjs_1.Subject();
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('telemetry-ingestion-queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map