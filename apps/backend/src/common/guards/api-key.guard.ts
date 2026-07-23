import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query.apiKey;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('Missing X-API-Key header or query parameter');
    }

    const { orgId, apiKeyId } = await this.authService.validateApiKey(apiKey);
    request.orgId = orgId;
    request.apiKeyId = apiKeyId;
    return true;
  }
}
