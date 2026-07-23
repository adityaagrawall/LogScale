'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SystemLatencyPercentiles } from '../types';
import { Activity, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LatencyWidgetProps {
  data: SystemLatencyPercentiles[];
  loading: boolean;
}

export const LatencyWidget: React.FC<LatencyWidgetProps> = ({ data, loading }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              System Telemetry & Latency Percentiles (p50 / p95 / p99)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Real-time Aggregation via Postgres <code className="font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/80">PERCENTILE_CONT</code>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">
          Computing latency percentiles...
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No telemetry log data found in selected time window.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, idx) => {
            const hasHighError = item.errorRatePercentage > 3.0;
            const hasHighLatency = item.p95Ms > 500;

            return (
              <motion.div
                key={`${item.serviceName}-${item.endpoint}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl p-4 space-y-3 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-slate-900">{item.serviceName}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 font-semibold truncate max-w-[180px]">
                      {item.endpoint}
                    </p>
                  </div>

                  {hasHighError || hasHighLatency ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Degradation
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Healthy
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/80 text-center bg-white rounded-xl shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400">p50</span>
                    <p className="font-mono text-sm font-extrabold text-slate-900">{item.p50Ms}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-500">p95</span>
                    <p className="font-mono text-sm font-extrabold text-amber-600">{item.p95Ms}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-rose-500">p99</span>
                    <p className="font-mono text-sm font-extrabold text-rose-600">{item.p99Ms}ms</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Reqs: <strong className="text-slate-900 font-mono font-extrabold">{item.totalRequests.toLocaleString()}</strong></span>
                  <span>
                    Error Rate:{' '}
                    <strong className={hasHighError ? 'text-rose-600 font-bold font-mono' : 'text-emerald-700 font-bold font-mono'}>
                      {item.errorRatePercentage}%
                    </strong>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
