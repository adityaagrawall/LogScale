"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const express_1 = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, express_1.json)({ limit: '2mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '2mb' }));
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://loggscale.vercel.app', 'http://localhost:3000']
            : '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 LogScale Backend running with Helmet & Throttler Protection on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map