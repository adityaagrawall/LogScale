import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('api/v1/telemetry')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('ingest')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async ingest(@Req() req: any, @Body() payload: any) {
    const orgId = req.orgId;
    return this.ingestionService.enqueuePayload(orgId, payload);
  }
}
