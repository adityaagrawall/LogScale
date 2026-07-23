'use client';

import React from 'react';
import { SystemLatencyPercentiles } from '@telemetryx/shared';
import { Activity, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LatencyWidgetProps {
  data: SystemLatencyPercentiles[];
  loading: boolean;
}

export const LatencyWidget: React.FC<LatencyWidgetProps> = ({ data, loading }) => {
  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              System Telemetry & Latency Percentiles (p50 / p95 / p99)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Aggregation via Postgres <code className="font-mono text-emerald-700 font-bold">PERCENTILE_CONT</code>
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
          {data.map((item) => {
            const hasHighError = item.errorRatePercentage > 3.0;
            const hasHighLatency = item.p95Ms > 500;

            return (
              <div
                key={`${item.serviceName}-${item.endpoint}`}
                className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-slate-900">{item.serviceName}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 font-medium truncate max-w-[200px]">
                      {item.endpoint}
                    </p>
                  </div>

                  {hasHighError || hasHighLatency ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Degradation
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Healthy
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 text-center bg-white rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">p50</span>
                    <p className="font-mono text-sm font-bold text-slate-900">{item.p50Ms}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600">p95</span>
                    <p className="font-mono text-sm font-bold text-amber-700">{item.p95Ms}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-600">p99</span>
                    <p className="font-mono text-sm font-bold text-rose-700">{item.p99Ms}ms</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Reqs: <strong className="text-slate-900 font-bold">{item.totalRequests.toLocaleString()}</strong></span>
                  <span>
                    Error Rate:{' '}
                    <strong className={hasHighError ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {item.errorRatePercentage}%
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
