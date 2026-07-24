import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Helper utility to redact passwords, connection strings, and keys from any string or object
export function sanitizeCredentials(input: any): any {
  if (typeof input === 'string') {
    return input
      // Redact Postgres connection strings with passwords
      .replace(/postgres(?:ql)?:\/\/[^:]+:[^@]+@/gi, 'postgresql://***:***@')
      // Redact Redis URLs with passwords
      .replace(/rediss?:\/\/[^:]+:[^@]+@/gi, 'rediss://***:***@')
      // Redact Redis password param
      .replace(/password=[^&\s]+/gi, 'password=***')
      // Redact API keys
      .replace(/lx_[a-zA-Z0-9_-]{10,}/g, 'lx_***');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeCredentials);
  }

  if (input !== null && typeof input === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('database_url') ||
        lowerKey.includes('redis_url')
      ) {
        sanitizedObj[key] = '***REDACTED***';
      } else {
        sanitizedObj[key] = sanitizeCredentials(input[key]);
      }
    }
    return sanitizedObj;
  }

  return input;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'object' ? (res as any).message || res : res;
    }

    // Sanitize any potential sensitive text in the message
    const safeMessage = sanitizeCredentials(message);

    // Safely log error internally without revealing credentials in stdout/stderr
    const rawErrorText = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(`HTTP Status ${status}: ${sanitizeCredentials(rawErrorText)}`);

    // Return clean, safe response to the public client (never exposes stack traces or DB strings)
    response.status(status).json({
      statusCode: status,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'An unexpected error occurred. Please try again.' : safeMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
