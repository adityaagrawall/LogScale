'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CohortMatrixCell } from '../types';
import { Grid, Calendar } from 'lucide-react';

interface CohortHeatmapProps {
  data: CohortMatrixCell[];
  loading: boolean;
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ data, loading }) => {
  const weekOffsets = Array.from({ length: 8 }, (_, i) => i);

  const getHeatmapColor = (pct: number | undefined) => {
    if (pct === undefined) return 'bg-slate-100/70 text-slate-300';
    if (pct >= 80) return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-xs';
    if (pct >= 50) return 'bg-emerald-500 text-white font-bold shadow-2xs';
    if (pct >= 30) return 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300/80';
    if (pct >= 15) return 'bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200/80';
    if (pct > 0) return 'bg-slate-100 text-slate-700 font-semibold';
    return 'bg-slate-50 text-slate-400';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 shadow-xs">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cohort Retention Matrix (N-Week Analysis)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Date-Truncated SQL Cohorts with Relative Week Offsets
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-medium">
          Calculating cohort retention matrices...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No cohort data available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 min-w-[120px]">Cohort Week</th>
                <th className="py-3 px-3">Size</th>
                {weekOffsets.map((w) => (
                  <th key={w} className="py-3 px-2 text-center min-w-[60px]">
                    W{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, rIdx) => (
                <motion.tr 
                  key={row.cohortDate}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rIdx * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {row.cohortDate}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-800 font-mono">
                    {row.totalUsers.toLocaleString()}
                  </td>
                  {weekOffsets.map((w) => {
                    const ret = row.retentionByOffset?.[w];
                    const pct = ret?.percentage;
                    return (
                      <td key={w} className="py-1 px-1 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`rounded-xl py-1.5 px-1 font-mono text-xs transition-all cursor-default ${getHeatmapColor(
                            pct
                          )}`}
                        >
                          {pct !== undefined ? `${pct}%` : '-'}
                        </motion.div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
