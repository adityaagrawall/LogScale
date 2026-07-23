'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { FunnelChart } from '../components/FunnelChart';
import { CohortHeatmap } from '../components/CohortHeatmap';
import { LatencyWidget } from '../components/LatencyWidget';
import { LiveStreamWidget } from '../components/LiveStreamWidget';
import { LogExplorerWidget } from '../components/LogExplorerWidget';
import { ErrorBudgetWidget } from '../components/ErrorBudgetWidget';
import { IntegrationModal } from '../components/IntegrationModal';
import { FunnelStepResult, CohortMatrixCell, SystemLatencyPercentiles } from '../types';
import { Send, Zap, Activity, RefreshCw, Sparkles, Code2, HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState('lx_live_demo1234567890abcdef1234567890');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);

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
  }, []);

  // High-Throughput Event Ingestion Simulator
  const handleSimulateIngest = async () => {
    setSimulating(true);
    setSimulationStatus('Enqueueing full user conversion funnel journeys into Redis BullMQ queue...');

    const simulatedEvents: any[] = [];
    const baseTime = Date.now();

    for (let i = 0; i < 10; i++) {
      const userId = `user_funnel_${Math.floor(Math.random() * 9000 + 1000)}`;
      const userTime = new Date(baseTime + i * 100).toISOString();

      simulatedEvents.push({
        eventName: 'page_view',
        userId,
        properties: { path: '/pricing', source: 'dashboard_simulator' },
        timestamp: userTime,
      });

      if (Math.random() < 0.75) {
        const step1Time = new Date(baseTime + i * 100 + 1000).toISOString();
        simulatedEvents.push({
          eventName: 'add_to_cart',
          userId,
          properties: { item: 'Enterprise Tier', price: 499 },
          timestamp: step1Time,
        });

        if (Math.random() < 0.70) {
          const step2Time = new Date(baseTime + i * 100 + 2000).toISOString();
          simulatedEvents.push({
            eventName: 'checkout_started',
            userId,
            properties: { plan: 'annual' },
            timestamp: step2Time,
          });

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative overflow-hidden">
      {/* Decorative Ambient Soft Lights */}
      <div className="ambient-glow-blue top-[-100px] left-[10%]" />
      <div className="ambient-glow-purple top-[400px] right-[5%]" />
      <div className="ambient-glow-emerald bottom-[200px] left-[5%]" />

      <Navbar 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        onOpenIntegration={() => setIsIntegrationOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-6 relative z-10">
        {/* Top Control Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel-light rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-white/80"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
                LogScale Engine Control Center
              </h2>
            </div>
            <p className="text-sm text-slate-600 font-medium pl-1">
              High-Throughput Non-Blocking Ingestion • BullMQ Queue • Real-Time SQL Analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsIntegrationOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-sm transition-all"
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              Integration Guide
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulateIngest}
              disabled={simulating}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {simulating ? 'Enqueueing Events...' : 'Simulate Live Event Ingestion (<20ms)'}
            </motion.button>
          </div>
        </motion.div>

        {/* Live Simulation Toast Notification */}
        <AnimatePresence>
          {simulationStatus && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 text-xs font-mono font-bold text-indigo-900 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>{simulationStatus}</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200">
                SSE Sync Active
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Floating Action Button (FAB) for Instant Developer Integration Guide */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsIntegrationOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 border border-white/20 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Code2 className="w-4 h-4 fill-current relative z-10" />
          <span className="relative z-10">Connect Your Website</span>
          <span className="relative z-10 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </motion.button>
      </motion.div>

      {/* Integration Guide Modal */}
      <IntegrationModal
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
        apiKey={apiKey}
        backendUrl={backendUrl}
      />
    </div>
  );
}
