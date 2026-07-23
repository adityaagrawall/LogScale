'use client';

import React from 'react';
import { CohortMatrixCell } from '@telemetryx/shared';
import { Grid, Calendar } from 'lucide-react';

interface CohortHeatmapProps {
  data: CohortMatrixCell[];
  loading: boolean;
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ data, loading }) => {
  const weekOffsets = Array.from({ length: 8 }, (_, i) => i);

  const getHeatmapColor = (pct: number | undefined) => {
    if (pct === undefined) return 'bg-slate-100 text-slate-400';
    if (pct >= 80) return 'bg-emerald-600 text-white font-bold shadow-sm';
    if (pct >= 50) return 'bg-emerald-500/85 text-white font-bold';
    if (pct >= 30) return 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300';
    if (pct >= 15) return 'bg-blue-50 text-blue-900 font-semibold border border-blue-200';
    if (pct > 0) return 'bg-slate-100 text-slate-700 font-medium';
    return 'bg-slate-50 text-slate-400';
  };

  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Cohort Retention Matrix (N-Week Analysis)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 min-w-[120px]">Cohort Week</th>
                <th className="py-2.5 px-3">Size</th>
                {weekOffsets.map((w) => (
                  <th key={w} className="py-2.5 px-2 text-center min-w-[60px]">
                    W{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.cohortDate} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {row.cohortDate}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700">
                    {row.totalUsers.toLocaleString()}
                  </td>
                  {weekOffsets.map((w) => {
                    const ret = row.retentionByOffset?.[w];
                    const pct = ret?.percentage;
                    return (
                      <td key={w} className="py-1 px-1 text-center">
                        <div
                          className={`rounded-lg py-1.5 px-1 font-mono transition-all ${getHeatmapColor(
                            pct
                          )}`}
                        >
                          {pct !== undefined ? `${pct}%` : '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
