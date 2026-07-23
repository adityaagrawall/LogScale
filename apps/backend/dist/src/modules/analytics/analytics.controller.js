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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const api_key_guard_1 = require("../../common/guards/api-key.guard");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getFunnel(req, stepsParam, daysParam = '30') {
        if (!stepsParam) {
            throw new common_1.BadRequestException('Query parameter "steps" is required (comma-separated event names)');
        }
        const steps = stepsParam.split(',').map((s) => s.trim()).filter(Boolean);
        const days = parseInt(daysParam, 10) || 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.analyticsService.getFunnelAnalysis(req.orgId, steps, startDate);
    }
    async getCohorts(req, weeksParam = '8') {
        const weeks = parseInt(weeksParam, 10) || 8;
        return this.analyticsService.getCohortRetention(req.orgId, weeks);
    }
    async getLatency(req, minutesParam = '60') {
        const minutes = parseInt(minutesParam, 10) || 60;
        return this.analyticsService.getSystemTelemetryLatency(req.orgId, minutes);
    }
    async getTimeSeries(req, hoursParam = '24') {
        const hours = parseInt(hoursParam, 10) || 24;
        return this.analyticsService.getLatencyTimeSeries(req.orgId, hours);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('funnel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('steps')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFunnel", null);
__decorate([
    (0, common_1.Get)('cohorts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('weeks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCohorts", null);
__decorate([
    (0, common_1.Get)('telemetry/latency'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('minutes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getLatency", null);
__decorate([
    (0, common_1.Get)('telemetry/timeseries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTimeSeries", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('api/v1/analytics'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map