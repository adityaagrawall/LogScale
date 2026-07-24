import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter, sanitizeCredentials } from './common/filters/all-exceptions.filter';

// Process-level emergency crash handlers to prevent leaking passwords in Node.js logs
process.on('uncaughtException', (err) => {
  console.error('Fatal Uncaught Exception (Sanitized):', sanitizeCredentials(err?.stack || err?.message || String(err)));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection (Sanitized):', sanitizeCredentials(reason));
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Redact & Sanitize All Error Responses (Guarantees Passwords & DB strings never leak)
  app.useGlobalFilters(new AllExceptionsFilter());

  // 2. HTTP Security Headers with Helmet (protects against XSS, Clickjacking, MIME sniffing, HSTS)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 3. Strict Payload Body Size Limit (prevents Heap Overflow / Memory exhaustion attacks)
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // 4. CORS Policy Configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://loggscale.vercel.app', 'http://localhost:3000']
      : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 5. Global Validation Pipe (Sanitizes & Strips Malicious/Unrecognized Payload Fields)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 LogScale Backend running with Helmet, Throttler & Redaction Protection on port ${port}`);
}
bootstrap();
