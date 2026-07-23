import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    hashApiKey(apiKey: string): string;
    generateApiKey(orgId: string, name: string): Promise<{
        id: string;
        name: string;
        apiKey: string;
        keyPrefix: string;
        createdAt: Date;
    }>;
    validateApiKey(apiKey: string): Promise<{
        orgId: string;
        apiKeyId: string;
    }>;
}
