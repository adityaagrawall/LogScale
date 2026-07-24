import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HTTP Security Headers with Helmet (protects against XSS, Clickjacking, MIME sniffing, HSTS)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline styles & SSE streams
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Strict Payload Body Size Limit (prevents Heap Overflow / Memory exhaustion attacks)
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  // 3. CORS Policy Configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://loggscale.vercel.app', 'http://localhost:3000']
      : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Global Validation Pipe (Sanitizes & Strips Malicious/Unrecognized Payload Fields)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Strips non-whitelisted fields automatically
      forbidNonWhitelisted: true, // Rejects malicious unexpected parameters
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 LogScale Backend running with Helmet & Throttler Protection on port ${port}`);
}
bootstrap();
