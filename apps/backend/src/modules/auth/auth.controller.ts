import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('orgs')
  async createOrganization(@Body() body: { name: string; slug: string }) {
    const org = await this.prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
      },
    });

    const apiKey = await this.authService.generateApiKey(org.id, 'Default API Key');
    return {
      organization: org,
      apiKey: apiKey.apiKey,
      keyDetails: apiKey,
    };
  }

  @Post('api-keys')
  async createApiKey(@Body() body: { orgId: string; name: string }) {
    return this.authService.generateApiKey(body.orgId, body.name);
  }

  @Get('orgs')
  async listOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: { rawEvents: true, telemetryLogs: true, apiKeys: true },
        },
      },
    });
  }
}
