"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma/prisma.service");
const auth_module_1 = require("./modules/auth/auth.module");
const ingestion_module_1 = require("./modules/ingestion/ingestion.module");
const worker_module_1 = require("./modules/worker/worker.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const cron_module_1 = require("./modules/cron/cron.module");
const stream_module_1 = require("./modules/stream/stream.module");
function getRedisConnection() {
    if (process.env.REDIS_URL) {
        const url = process.env.REDIS_URL;
        const isTls = url.startsWith('rediss://');
        return {
            ...(isTls ? { url } : { url }),
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 3)
                    return null;
                return Math.min(times * 200, 2000);
            },
            tls: isTls ? { rejectUnauthorized: false } : undefined,
        };
    }
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;
    const isTls = host.includes('upstash.io') || process.env.REDIS_TLS === 'true';
    return {
        host,
        port,
        password,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: (times) => {
            if (times > 3)
                return null;
            return Math.min(times * 200, 2000);
        },
        tls: isTls ? { rejectUnauthorized: false } : undefined,
    };
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 120,
                }]),
            bullmq_1.BullModule.forRoot({
                connection: getRedisConnection(),
            }),
            auth_module_1.AuthModule,
            ingestion_module_1.IngestionModule,
            worker_module_1.WorkerModule,
            analytics_module_1.AnalyticsModule,
            cron_module_1.CronModule,
            stream_module_1.StreamModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map