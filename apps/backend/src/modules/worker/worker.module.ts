import { Module } from '@nestjs/common';
import { WorkerProcessor } from './worker.processor';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [WorkerProcessor, PrismaService],
})
export class WorkerModule {}
