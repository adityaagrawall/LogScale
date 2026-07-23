import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  async generateApiKey(orgId: string, name: string) {
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

  async validateApiKey(apiKey: string): Promise<{ orgId: string; apiKeyId: string }> {
    if (!apiKey) {
      throw new UnauthorizedException('Missing X-API-Key header');
    }

    const keyHash = this.hashApiKey(apiKey);
    const record = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { organization: true },
    });

    if (!record || record.revoked) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    // Fire and forget updating lastUsedAt to avoid blocking ingestion path
    this.prisma.apiKey.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    return { orgId: record.orgId, apiKeyId: record.id };
  }
}
