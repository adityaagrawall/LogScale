"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
exports.sanitizeCredentials = sanitizeCredentials;
const common_1 = require("@nestjs/common");
function sanitizeCredentials(input) {
    if (typeof input === 'string') {
        return input
            .replace(/postgres(?:ql)?:\/\/[^:]+:[^@]+@/gi, 'postgresql://***:***@')
            .replace(/rediss?:\/\/[^:]+:[^@]+@/gi, 'rediss://***:***@')
            .replace(/password=[^&\s]+/gi, 'password=***')
            .replace(/lx_[a-zA-Z0-9_-]{10,}/g, 'lx_***');
    }
    if (Array.isArray(input)) {
        return input.map(sanitizeCredentials);
    }
    if (input !== null && typeof input === 'object') {
        const sanitizedObj = {};
        for (const key of Object.keys(input)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('password') ||
                lowerKey.includes('secret') ||
                lowerKey.includes('token') ||
                lowerKey.includes('database_url') ||
                lowerKey.includes('redis_url')) {
                sanitizedObj[key] = '***REDACTED***';
            }
            else {
                sanitizedObj[key] = sanitizeCredentials(input[key]);
            }
        }
        return sanitizedObj;
    }
    return input;
}
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            message = typeof res === 'object' ? res.message || res : res;
        }
        const safeMessage = sanitizeCredentials(message);
        const rawErrorText = exception instanceof Error ? exception.message : String(exception);
        this.logger.error(`HTTP Status ${status}: ${sanitizeCredentials(rawErrorText)}`);
        response.status(status).json({
            statusCode: status,
            message: status === common_1.HttpStatus.INTERNAL_SERVER_ERROR ? 'An unexpected error occurred. Please try again.' : safeMessage,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map