"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    hashApiKey(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }
    async generateApiKey(orgId, name) {
        const rawKey = `lx_live_${crypto.randomBytes(24).toString('hex')}`;
        const keyPrefix = rawKey.substring(0, 12);
        const keyHash = this.hashApiKey(rawKey);
        const apiKeyRecord = await this.prisma.apiKey.create({
            data: {
                orgId,
                name,
                keyPrefix,
                keyHash,
            },
        });
        return {
            id: apiKeyRecord.id,
            name: apiKeyRecord.name,
            apiKey: rawKey,
            keyPrefix: apiKeyRecord.keyPrefix,
            createdAt: apiKeyRecord.createdAt,
        };
    }
    async validateApiKey(apiKey) {
        if (!apiKey) {
            throw new common_1.UnauthorizedException('Missing X-API-Key header');
        }
        const keyHash = this.hashApiKey(apiKey);
        const record = await this.prisma.apiKey.findUnique({
            where: { keyHash },
            include: { organization: true },
        });
        if (!record || record.revoked) {
            throw new common_1.UnauthorizedException('Invalid or revoked API key');
        }
        this.prisma.apiKey.update({
            where: { id: record.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => { });
        return { orgId: record.orgId, apiKeyId: record.id };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map