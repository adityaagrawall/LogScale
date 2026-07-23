import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    createOrganization(body: {
        name: string;
        slug: string;
    }): Promise<{
        organization: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        apiKey: string;
        keyDetails: {
            id: string;
            name: string;
            apiKey: string;
            keyPrefix: string;
            createdAt: Date;
        };
    }>;
    createApiKey(body: {
        orgId: string;
        name: string;
    }): Promise<{
        id: string;
        name: string;
        apiKey: string;
        keyPrefix: string;
        createdAt: Date;
    }>;
    listOrganizations(): Promise<({
        _count: {
            apiKeys: number;
            rawEvents: number;
            telemetryLogs: number;
        };
    } & {
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
