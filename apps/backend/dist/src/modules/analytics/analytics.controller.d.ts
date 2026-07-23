import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getFunnel(req: any, stepsParam: string, daysParam?: string): Promise<{
        stepIndex: number;
        stepName: string;
        userCount: number;
        conversionPercentage: number;
        dropoffCount: number;
        dropoffPercentage: number;
    }[]>;
    getCohorts(req: any, weeksParam?: string): Promise<{
        cohortWeek: string;
        totalUsers: number;
        retention: Record<number, {
            users: number;
            percentage: number;
        }>;
    }[]>;
    getLatency(req: any, minutesParam?: string): Promise<unknown>;
    getTimeSeries(req: any, hoursParam?: string): Promise<unknown>;
}
