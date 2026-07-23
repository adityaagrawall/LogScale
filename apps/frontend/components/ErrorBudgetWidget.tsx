'use client';

import React from 'react';
import { ShieldAlert, Zap, Activity, Clock, PieChart } from 'lucide-react';

export const ErrorBudgetWidget: React.FC = () => {
  const slaTarget = 99.9;
  const currentAvailability = 99.94;
  const errorBudgetRemaining = 82; // 82% error budget left

  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Service Level Availability & Error Budget Tracker
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production Reliability SLA (99.9% Target) vs Error Budget Consumption
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: SLA Availability */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>SLA Target: <strong>{slaTarget}%</strong></span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SLA Passing
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{currentAvailability}%</span>
            <span className="text-xs font-bold text-emerald-600">+0.04% above SLA</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.94%' }} />
          </div>
        </div>

        {/* Card 2: Error Budget Remaining */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Monthly Error Budget</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {errorBudgetRemaining}% Budget Left
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">18% Consumed</span>
            <span className="text-xs text-slate-500">82% safe buffer</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* Card 3: Throughput & MTTR */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Throughput & MTTR</span>
            <span className="text-slate-700 font-bold bg-slate-200/80 px-2 py-0.5 rounded">
              System Stable
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Peak RPS</span>
              <p className="font-mono text-base font-bold text-slate-900">4,250 req/s</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Mean Recovery</span>
              <p className="font-mono text-base font-bold text-slate-900">&lt; 1.2 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
