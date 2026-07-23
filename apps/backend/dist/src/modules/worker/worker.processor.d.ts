import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
interface IngestJobData {
    orgId: string;
    events?: Array<{
        eventName: string;
        userId: string;
        properties?: any;
        timestamp?: string;
    }>;
    telemetry?: Array<{
        serviceName: string;
        endpoint: string;
        statusCode: number;
        durationMs: number;
        meta?: any;
        timestamp?: string;
    }>;
}
export declare class WorkerProcessor extends WorkerHost {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<IngestJobData, any, string>): Promise<any>;
}
export {};
