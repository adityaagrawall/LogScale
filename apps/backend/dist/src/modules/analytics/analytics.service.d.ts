import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getFunnelAnalysis(orgId: string, steps: string[], startDate: Date, endDate?: Date): Promise<{
        stepIndex: number;
        stepName: string;
        userCount: number;
        conversionPercentage: number;
        dropoffCount: number;
        dropoffPercentage: number;
    }[]>;
    getCohortRetention(orgId: string, weeks?: number): Promise<{
        cohortWeek: string;
        totalUsers: number;
        retention: Record<number, {
            users: number;
            percentage: number;
        }>;
    }[]>;
    getSystemTelemetryLatency(orgId: string, timeframeMinutes?: number): Promise<unknown>;
    getLatencyTimeSeries(orgId: string, hours?: number): Promise<unknown>;
}
