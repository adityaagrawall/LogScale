import { PrismaService } from '../../prisma/prisma.service';
export declare class CronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleDailyRollup(): Promise<void>;
}
