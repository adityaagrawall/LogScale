"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = require("crypto");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database with initial organization and sample telemetry data...');
    const org = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corporation',
            slug: 'acme-corp',
        },
    });
    const demoApiKey = 'lx_live_demo1234567890abcdef1234567890';
    const keyHash = crypto.createHash('sha256').update(demoApiKey).digest('hex');
    await prisma.apiKey.upsert({
        where: { keyHash },
        update: {},
        create: {
            orgId: org.id,
            name: 'Demo API Key',
            keyPrefix: 'lx_live_demo',
            keyHash,
        },
    });
    console.log(`✅ Default Organization ID: ${org.id}`);
    console.log(`🔑 Demo API Key: ${demoApiKey}`);
    const users = Array.from({ length: 150 }, (_, i) => `user_${1000 + i}`);
    const eventTypes = ['page_view', 'add_to_cart', 'checkout_started', 'payment_completed'];
    const rawEvents = [];
    const telemetryLogs = [];
    const now = Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    for (const userId of users) {
        const userCreatedMs = now - Math.floor(Math.random() * fourteenDaysMs);
        const userCreatedDate = new Date(userCreatedMs);
        rawEvents.push({
            orgId: org.id,
            eventName: 'page_view',
            userId,
            properties: { path: '/home', browser: 'Chrome', os: 'macOS' },
            timestamp: userCreatedDate,
        });
        if (Math.random() < 0.7) {
            const step1Date = new Date(userCreatedMs + 5 * 60 * 1000);
            rawEvents.push({
                orgId: org.id,
                eventName: 'add_to_cart',
                userId,
                properties: { sku: 'PRO-100', price: 99.99 },
                timestamp: step1Date,
            });
            if (Math.random() < 0.65) {
                const step2Date = new Date(userCreatedMs + 12 * 60 * 1000);
                rawEvents.push({
                    orgId: org.id,
                    eventName: 'checkout_started',
                    userId,
                    properties: { cartValue: 99.99 },
                    timestamp: step2Date,
                });
                if (Math.random() < 0.7) {
                    const step3Date = new Date(userCreatedMs + 15 * 60 * 1000);
                    rawEvents.push({
                        orgId: org.id,
                        eventName: 'payment_completed',
                        userId,
                        properties: { transactionId: `tx_${Math.random().toString(36).substring(7)}`, amount: 99.99 },
                        timestamp: step3Date,
                    });
                }
            }
        }
    }
    const services = [
        { name: 'auth-service', endpoint: '/api/v1/auth/login', baseLatency: 45 },
        { name: 'checkout-service', endpoint: '/api/v1/cart/checkout', baseLatency: 180 },
        { name: 'payment-gateway', endpoint: '/api/v1/payments/charge', baseLatency: 350 },
    ];
    for (let i = 0; i < 600; i++) {
        const service = services[Math.floor(Math.random() * services.length)];
        const isError = Math.random() < 0.05;
        const statusCode = isError ? 500 : 200;
        const randomMultiplier = 0.5 + Math.pow(Math.random(), 3) * 6;
        const durationMs = Math.round(service.baseLatency * randomMultiplier);
        const logTimestamp = new Date(now - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
        telemetryLogs.push({
            orgId: org.id,
            serviceName: service.name,
            endpoint: service.endpoint,
            statusCode,
            durationMs,
            meta: { region: 'us-east-1', instance: 'i-098234a' },
            timestamp: logTimestamp,
        });
    }
    console.log(`Inserting ${rawEvents.length} raw events...`);
    await prisma.rawEvent.createMany({ data: rawEvents });
    console.log(`Inserting ${telemetryLogs.length} telemetry logs...`);
    await prisma.telemetryLog.createMany({ data: telemetryLogs });
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map