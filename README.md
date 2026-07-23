# LogScale (TelemetryX) - High-Throughput Analytics & System Telemetry Engine

LogScale is a high-throughput, production-grade product analytics and system telemetry engine built with **NestJS**, **Next.js 15**, **PostgreSQL**, **Prisma ORM**, and **Redis BullMQ**.

It is engineered to fulfill both **Software Engineering (SDE)** standards (queue buffering, dynamic batch inserts, microservice separation, Dockerization) and **Data Engineering** standards (SQL window functions, cohort retention matrices, funnel drop-off models, p95/p99 latency percentiles).

---

## 🚀 Key Architecture & Performance Highlights

```
┌─────────────────────────┐
│ Ingestion Client / SDK  │
└────────────┬────────────┘
             │  POST /api/v1/telemetry/ingest (X-API-Key)
             ▼
┌─────────────────────────┐
│ NestJS Ingestion API    │ ───► Fast Zod / DTO Validation
└────────────┬────────────┘
             │  Enqueue Payload (<20ms response time, return 202 Accepted)
             ▼
┌─────────────────────────┐
│ Redis BullMQ Queue      │
└────────────┬────────────┘
             │  Dynamic Batch Drain (200–500 items/batch)
             ▼
┌─────────────────────────┐
│ BullMQ Batch Consumer   │ ───► Bulk Insert (`createMany` / COPY)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ PostgreSQL DB           │ ───► Time-Series Indexing (org_id, event_name, timestamp)
└────────────┬────────────┘
             │  Window Functions, Cohort Date Truncation, PERCENTILE_CONT
             ▼
┌─────────────────────────┐
│ Next.js 15 Dashboard    │ ───► Real-time SSE Live Event Stream + Visual Widgets
└─────────────────────────┘
```

1. **Non-Blocking Ingestion (<20ms)**: The ingestion endpoint `POST /api/v1/telemetry/ingest` validates incoming payloads and pushes them directly into a Redis BullMQ queue, instantly returning `202 Accepted` without blocking on PostgreSQL writes.
2. **Dynamic Worker Batching**: Background BullMQ workers drain queue items in dynamic batches (200–500 items/batch) and perform chunked bulk inserts into PostgreSQL to prevent database connection starvation.
3. **Analytical SQL Queries**:
   - **Conversion Funnels**: Computed using SQL window functions (`LEAD()`, `ROW_NUMBER()`) and step timestamp constraints.
   - **Cohort Retention Matrix**: Calculated via date truncation (`DATE_TRUNC('week', ...)`) and relative week offset computations.
   - **System Telemetry Latency**: Real-time aggregation of p50, p95, and p99 latencies using PostgreSQL `PERCENTILE_CONT()`.
4. **Daily Aggregates Cron Rollup**: BullMQ / NestJS scheduled jobs pre-aggregate daily counts and latency statistics into `daily_aggregates` for instant dashboard loading.

---

## 🛠 Tech Stack

- **Backend**: NestJS, TypeScript, BullMQ, Redis, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 15 (App Router, React 18/19), Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Infrastructure**: Docker & Docker Compose

---

## 📂 Project Structure

```
TelemetryX/
├── docker-compose.yml              # Docker environment for Postgres & Redis
├── README.md                       # Architecture & setup documentation
├── apps/
│   ├── backend/                    # NestJS Backend Application
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Time-series indexed database schema
│   │   │   └── seed.ts             # Demo data generator script
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/           # API Key hashing & Org management
│   │       │   ├── ingestion/      # Non-blocking 202 Accepted ingestion controller
│   │       │   ├── worker/         # BullMQ queue consumer (batch inserts)
│   │       │   ├── analytics/      # Funnels, Cohorts, and Latency SQL services
│   │       │   ├── cron/           # Nightly rollups into DailyAggregates
│   │       │   └── stream/         # Server-Sent Events (SSE) live event stream
│   └── frontend/                   # Next.js 15 Web Dashboard
│       ├── app/                    # App Router pages and CSS
│       └── components/             # Funnel, Cohort Heatmap, Latency, and LiveStream UI
└── packages/
    └── shared/                     # Shared Zod schemas & TypeScript types
```

---

## ⚙️ Quick Start Guide

### 1. Start Infrastructure via Docker Compose

```bash
docker-compose up -d
```

### 2. Install Dependencies & Build Shared Package

```bash
npm install
npm run build --workspace=packages/shared
```

### 3. Initialize Database & Seed Demo Data

```bash
npm run db:push --workspace=apps/backend
npm run db:seed --workspace=apps/backend
```

### 4. Run Development Servers

```bash
# Terminal 1: Run Backend
npm run dev:backend

# Terminal 2: Run Frontend
npm run dev:frontend
```

Access the **LogScale Dashboard** at `http://localhost:3000`.

---

## 🧪 Testing & Verification

### Ingesting Event Payloads (`POST /api/v1/telemetry/ingest`)

```bash
curl -X POST http://localhost:3001/api/v1/telemetry/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: lx_live_demo1234567890abcdef1234567890" \
  -d '{
    "events": [
      {
        "eventName": "page_view",
        "userId": "user_1001",
        "properties": { "path": "/dashboard" }
      }
    ],
    "telemetry": [
      {
        "serviceName": "auth-service",
        "endpoint": "/api/v1/auth/login",
        "statusCode": 200,
        "durationMs": 52.4
      }
    ]
  }'
```

Returns `202 Accepted` in `<20ms`:

```json
{
  "status": "accepted",
  "statusCode": 202,
  "message": "Payload successfully enqueued in 4ms",
  "jobId": "12",
  "queuedItems": {
    "eventsCount": 1,
    "telemetryCount": 1
  }
}
```
