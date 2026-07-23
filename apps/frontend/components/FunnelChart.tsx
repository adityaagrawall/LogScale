'use client';

import React from 'react';
import { FunnelStepResult } from '@telemetryx/shared';
import { Users, TrendingDown, RefreshCw } from 'lucide-react';

interface FunnelChartProps {
  data: FunnelStepResult[];
  loading: boolean;
  onRefresh: () => void;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data, loading, onRefresh }) => {
  const maxUsers = data.length > 0 ? data[0].userCount : 1;

  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Conversion Funnel Drop-off Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Computed via SQL Window Functions & Conditional Step Aggregation
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-medium">
          Computing funnel step conversions...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No event data recorded for selected funnel steps.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((step, idx) => {
            const widthPercentage = Math.max(10, Math.round((step.userCount / maxUsers) * 100));

            return (
              <div key={step.stepName} className="relative">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">{step.stepName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{step.userCount.toLocaleString()} users</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {step.conversionPercentage}% overall
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100 rounded-xl h-9 p-1 border border-slate-200 flex items-center relative overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 flex items-center justify-end px-3 text-xs font-bold text-white shadow-sm"
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {widthPercentage > 20 && `${step.userCount} users`}
                  </div>
                </div>

                {/* Dropoff Indicator between steps */}
                {idx < data.length - 1 && (
                  <div className="my-2 ml-6 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1 w-fit font-medium">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>Drop-off:</span>
                    <span className="font-bold">{data[idx + 1].dropoffCount.toLocaleString()} users</span>
                    <span className="font-semibold">({data[idx + 1].dropoffPercentage}% loss)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
