import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare function sanitizeCredentials(input: any): any;
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
