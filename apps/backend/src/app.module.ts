import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { WorkerModule } from './modules/worker/worker.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CronModule } from './modules/cron/cron.module';
import { StreamModule } from './modules/stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: (process.env.REDIS_HOST && process.env.REDIS_HOST.includes('upstash.io')) || process.env.REDIS_TLS === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
      },
    }),
    AuthModule,
    IngestionModule,
    WorkerModule,
    AnalyticsModule,
    CronModule,
    StreamModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
