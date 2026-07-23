'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FunnelStepResult } from '../types';
import { Users, TrendingDown, RefreshCw, Layers } from 'lucide-react';

interface FunnelChartProps {
  data: FunnelStepResult[];
  loading: boolean;
  onRefresh: () => void;
}

const STEP_COLORS = [
  'from-blue-600 to-indigo-600',
  'from-indigo-600 to-purple-600',
  'from-purple-600 to-pink-600',
  'from-pink-600 to-rose-600',
];

export const FunnelChart: React.FC<FunnelChartProps> = ({ data, loading, onRefresh }) => {
  const maxUsers = data.length > 0 ? data[0].userCount : 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Conversion Funnel Drop-off Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Computed via SQL Window Functions & Conditional Step Aggregation
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-500" />
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
            const gradient = STEP_COLORS[idx % STEP_COLORS.length];

            return (
              <motion.div 
                key={step.stepName} 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{step.stepName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 font-mono">{step.userCount.toLocaleString()} users</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                      {step.conversionPercentage}% overall
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100/80 rounded-xl h-10 p-1 border border-slate-200 flex items-center relative overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                    className={`h-full rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-end px-3 text-xs font-bold text-white shadow-xs relative overflow-hidden`}
                  >
                    <span className="relative z-10">{widthPercentage > 20 && `${step.userCount} users`}</span>
                  </motion.div>
                </div>

                {/* Dropoff Indicator between steps */}
                {idx < data.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="my-2.5 ml-6 flex items-center gap-2 text-xs text-rose-700 bg-rose-50/90 border border-rose-200/80 rounded-lg px-3 py-1 w-fit font-semibold shadow-2xs"
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>Drop-off:</span>
                    <span className="font-bold">{data[idx + 1].dropoffCount.toLocaleString()} users</span>
                    <span className="text-rose-600">({data[idx + 1].dropoffPercentage}% loss)</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
