'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Activity, CheckCircle2, TrendingUp } from 'lucide-react';

export const ErrorBudgetWidget: React.FC = () => {
  const slaTarget = 99.9;
  const currentAvailability = 99.94;
  const errorBudgetRemaining = 82;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Service Level Availability & Error Budget Tracker
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Production Reliability SLA (99.9% Target) vs Error Budget Consumption
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          SLA Healthy
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: SLA Availability */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-gradient-to-b from-slate-50 to-emerald-50/20 border border-slate-200/90 rounded-xl p-4 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>SLA Target: <strong className="text-slate-700">{slaTarget}%</strong></span>
            <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
              Passing
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{currentAvailability}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.04%
            </span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '99.94%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full shadow-xs" 
            />
          </div>
        </motion.div>

        {/* Card 2: Error Budget Remaining */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-gradient-to-b from-slate-50 to-blue-50/20 border border-slate-200/90 rounded-xl p-4 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Monthly Error Budget</span>
            <span className="text-blue-700 font-bold bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
              {errorBudgetRemaining}% Left
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">18%</span>
            <span className="text-xs font-semibold text-slate-500">Consumed (82% safe buffer)</span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '82%' }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-xs" 
            />
          </div>
        </motion.div>

        {/* Card 3: Throughput & MTTR */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-gradient-to-b from-slate-50 to-indigo-50/20 border border-slate-200/90 rounded-xl p-4 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Throughput & Recovery</span>
            <span className="text-indigo-700 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
              Optimal
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Peak RPS</span>
              <p className="font-mono text-xl font-extrabold text-slate-900">4,250 <span className="text-xs text-slate-500 font-normal">req/s</span></p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Mean Recovery</span>
              <p className="font-mono text-xl font-extrabold text-slate-900">&lt; 1.2 <span className="text-xs text-slate-500 font-normal">min</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
