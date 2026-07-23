'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { FunnelChart } from '../components/FunnelChart';
import { CohortHeatmap } from '../components/CohortHeatmap';
import { LatencyWidget } from '../components/LatencyWidget';
import { LiveStreamWidget } from '../components/LiveStreamWidget';
import { LogExplorerWidget } from '../components/LogExplorerWidget';
import { ErrorBudgetWidget } from '../components/ErrorBudgetWidget';
import { FunnelStepResult, CohortMatrixCell, SystemLatencyPercentiles } from '../types';
import { Send, Zap, Activity, RefreshCw, Loader2, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState('lx_live_demo1234567890abcdef1234567890');
  const [initialLoading, setInitialLoading] = useState(true);

  const [funnelData, setFunnelData] = useState<FunnelStepResult[]>([]);
  const [cohortData, setCohortData] = useState<CohortMatrixCell[]>([]);
  const [latencyData, setLatencyData] = useState<SystemLatencyPercentiles[]>([]);
  
  const [loadingFunnel, setLoadingFunnel] = useState(false);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [loadingLatency, setLoadingLatency] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://logscale-backend.onrender.com';

  // Fetch Funnel Data
  const fetchFunnel = useCallback(async () => {
    setLoadingFunnel(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/v1/analytics/funnel?steps=page_view,add_to_cart,checkout_started,payment_completed`,
        { headers: { 'x-api-key': apiKey } }
      );
      if (res.ok) {
        const json = await res.json();
        setFunnelData(json);
      }
    } catch (e) {
      console.error('Failed to fetch funnel analytics', e);
    } finally {
      setLoadingFunnel(false);
    }
  }, [apiKey, backendUrl]);

  // Fetch Cohorts
  const fetchCohorts = useCallback(async () => {
    setLoadingCohorts(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/analytics/cohorts?weeks=8`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        const json = await res.json();
        setCohortData(json);
      }
    } catch (e) {
      console.error('Failed to fetch cohorts', e);
    } finally {
      setLoadingCohorts(false);
    }
  }, [apiKey, backendUrl]);

  // Fetch System Latency
  const fetchLatency = useCallback(async () => {
    setLoadingLatency(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/analytics/telemetry/latency?minutes=1440`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        const json = await res.json();
        setLatencyData(json);
      }
    } catch (e) {
      console.error('Failed to fetch telemetry latency', e);
    } finally {
      setLoadingLatency(false);
    }
  }, [apiKey, backendUrl]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchFunnel(), fetchCohorts(), fetchLatency()]);
  }, [fetchFunnel, fetchCohorts, fetchLatency]);

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  // High-Throughput Event Ingestion Simulator
  const handleSimulateIngest = async () => {
    setSimulating(true);
    setSimulationStatus('Enqueueing full user conversion funnel journeys into Redis BullMQ queue...');

    // Generate correlated user journeys through the 4 funnel steps
    const simulatedEvents: any[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < 10; i++) {
      const userId = `user_funnel_${Math.floor(Math.random() * 9000 + 1000)}`;
      const userTime = new Date(baseTime + i * 100).toISOString();

      // Step 0: page_view (100% of users)
      simulatedEvents.push({
        eventName: 'page_view',
        userId,
        properties: { path: '/pricing', source: 'dashboard_simulator' },
        timestamp: userTime,
      });

      // Step 1: add_to_cart (75% conversion rate)
      if (Math.random() < 0.75) {
        const step1Time = new Date(baseTime + i * 100 + 1000).toISOString();
        simulatedEvents.push({
          eventName: 'add_to_cart',
          userId,
          properties: { item: 'Enterprise Tier', price: 499 },
          timestamp: step1Time,
        });

        // Step 2: checkout_started (55% conversion rate)
        if (Math.random() < 0.70) {
          const step2Time = new Date(baseTime + i * 100 + 2000).toISOString();
          simulatedEvents.push({
            eventName: 'checkout_started',
            userId,
            properties: { plan: 'annual' },
            timestamp: step2Time,
          });

          // Step 3: payment_completed (40% conversion rate)
          if (Math.random() < 0.70) {
            const step3Time = new Date(baseTime + i * 100 + 3000).toISOString();
            simulatedEvents.push({
              eventName: 'payment_completed',
              userId,
              properties: { transactionId: `tx_${Math.random().toString(36).substring(7)}`, amount: 499 },
              timestamp: step3Time,
            });
          }
        }
      }
    }

    const samplePayload = {
      events: simulatedEvents,
      telemetry: [
        {
          serviceName: 'checkout-service',
          endpoint: '/api/v1/cart/checkout',
          statusCode: Math.random() < 0.1 ? 500 : 200,
          durationMs: Math.floor(Math.random() * 350 + 40),
          meta: { env: 'production' },
        },
        {
          serviceName: 'payment-gateway',
          endpoint: '/api/v1/payments/charge',
          statusCode: 200,
          durationMs: Math.floor(Math.random() * 600 + 150),
          meta: { env: 'production' },
        },
      ],
    };

    try {
      const startTime = performance.now();
      const res = await fetch(`${backendUrl}/api/v1/telemetry/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(samplePayload),
      });

      const responseTime = Math.round(performance.now() - startTime);

      if (res.status === 202) {
        const json = await res.json();
        setSimulationStatus(
          `⚡ 202 Accepted in ${responseTime}ms! Job ID: ${json.jobId}`
        );
        setTimeout(refreshAll, 1200);
      } else {
        setSimulationStatus(`❌ Error ${res.status}: Ingestion failed`);
      }
    } catch (err: any) {
      setSimulationStatus(`❌ Connection Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar apiKey={apiKey} setApiKey={setApiKey} />

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Top Control Banner (Bright Light Theme) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                LogScale Engine Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Non-Blocking Ingestion API • Redis BullMQ Queue • PostgreSQL Time-Series Analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleSimulateIngest}
              disabled={simulating}
              className="flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {simulating ? 'Enqueueing...' : 'Simulate Live Event Ingestion (<20ms)'}
            </button>

            <button
              onClick={refreshAll}
              className="flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Analytics
            </button>
          </div>
        </div>

        {simulationStatus && (
          <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-800 flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4 text-blue-600 animate-spin" />
            {simulationStatus}
          </div>
        )}

        {/* SLA & Error Budget Tracker */}
        <ErrorBudgetWidget />

        {/* Real-time SSE Live Pipe Stream */}
        <LiveStreamWidget apiKey={apiKey} />

        {/* Conversion Funnel & Cohort Retention Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart data={funnelData} loading={loadingFunnel} onRefresh={fetchFunnel} />
          <CohortHeatmap data={cohortData} loading={loadingCohorts} />
        </div>

        {/* System Telemetry Latency Percentiles */}
        <LatencyWidget data={latencyData} loading={loadingLatency} />

        {/* Advanced Log Explorer & JSON Inspector */}
        <LogExplorerWidget />
      </main>
    </div>
  );
}
