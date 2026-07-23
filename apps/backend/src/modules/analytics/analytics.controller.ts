import { Controller, Get, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('api/v1/analytics')
@UseGuards(ApiKeyGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('funnel')
  async getFunnel(
    @Req() req: any,
    @Query('steps') stepsParam: string,
    @Query('days') daysParam: string = '30',
  ) {
    if (!stepsParam) {
      throw new BadRequestException('Query parameter "steps" is required (comma-separated event names)');
    }

    const steps = stepsParam.split(',').map((s) => s.trim()).filter(Boolean);
    const days = parseInt(daysParam, 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.analyticsService.getFunnelAnalysis(req.orgId, steps, startDate);
  }

  @Get('cohorts')
  async getCohorts(
    @Req() req: any,
    @Query('weeks') weeksParam: string = '8',
  ) {
    const weeks = parseInt(weeksParam, 10) || 8;
    return this.analyticsService.getCohortRetention(req.orgId, weeks);
  }

  @Get('telemetry/latency')
  async getLatency(
    @Req() req: any,
    @Query('minutes') minutesParam: string = '60',
  ) {
    const minutes = parseInt(minutesParam, 10) || 60;
    return this.analyticsService.getSystemTelemetryLatency(req.orgId, minutes);
  }

  @Get('telemetry/timeseries')
  async getTimeSeries(
    @Req() req: any,
    @Query('hours') hoursParam: string = '24',
  ) {
    const hours = parseInt(hoursParam, 10) || 24;
    return this.analyticsService.getLatencyTimeSeries(req.orgId, hours);
  }
}
