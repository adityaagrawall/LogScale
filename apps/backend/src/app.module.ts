import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { WorkerModule } from './modules/worker/worker.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CronModule } from './modules/cron/cron.module';
import { StreamModule } from './modules/stream/stream.module';

function getRedisConnection() {
  if (process.env.REDIS_URL) {
    const url = process.env.REDIS_URL;
    const isTls = url.startsWith('rediss://');
    return {
      ...(isTls ? { url } : { url }),
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      tls: isTls ? { rejectUnauthorized: false } : undefined,
    } as any;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const isTls =
    host.includes('upstash.io') || process.env.REDIS_TLS === 'true';

  return {
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    tls: isTls ? { rejectUnauthorized: false } : undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate Limiting Security: Max 120 requests per minute per IP to prevent DDoS / spam
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120,
    }]),
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    AuthModule,
    IngestionModule,
    WorkerModule,
    AnalyticsModule,
    CronModule,
    StreamModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
