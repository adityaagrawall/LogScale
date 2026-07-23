'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, ChevronRight, ChevronDown, Clock, Code2 } from 'lucide-react';

interface LogEntry {
  id: string;
  serviceName: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  meta: any;
}

export const LogExplorerWidget: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '2XX' | '4XX' | '5XX'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const mockLogs: LogEntry[] = [
    {
      id: 'log-101',
      serviceName: 'checkout-service',
      endpoint: '/api/v1/cart/checkout',
      statusCode: 200,
      durationMs: 184.2,
      timestamp: new Date().toLocaleTimeString(),
      meta: { region: 'us-east-1', instance: 'i-09812a', dbQueryMs: 42.1 },
    },
    {
      id: 'log-102',
      serviceName: 'payment-gateway',
      endpoint: '/api/v1/payments/charge',
      statusCode: 500,
      durationMs: 842.0,
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      meta: { region: 'us-east-1', error: 'Payment gateway timeout', gatewayCode: 'GW_504' },
    },
    {
      id: 'log-103',
      serviceName: 'auth-service',
      endpoint: '/api/v1/auth/login',
      statusCode: 200,
      durationMs: 38.5,
      timestamp: new Date(Date.now() - 32000).toLocaleTimeString(),
      meta: { region: 'us-west-2', authMethod: 'jwt_bearer' },
    },
    {
      id: 'log-104',
      serviceName: 'checkout-service',
      endpoint: '/api/v1/cart/apply-coupon',
      statusCode: 400,
      durationMs: 65.0,
      timestamp: new Date(Date.now() - 48000).toLocaleTimeString(),
      meta: { region: 'us-east-1', couponCode: 'EXPIRED_2026', reason: 'Invalid coupon' },
    },
    {
      id: 'log-105',
      serviceName: 'payment-gateway',
      endpoint: '/api/v1/payments/refund',
      statusCode: 200,
      durationMs: 312.4,
      timestamp: new Date(Date.now() - 65000).toLocaleTimeString(),
      meta: { region: 'us-east-1', refundAmount: 99.99 },
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === '2XX') return matchesSearch && log.statusCode >= 200 && log.statusCode < 300;
    if (statusFilter === '4XX') return matchesSearch && log.statusCode >= 400 && log.statusCode < 500;
    if (statusFilter === '5XX') return matchesSearch && log.statusCode >= 500;
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Advanced Telemetry Log Explorer & Metadata Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Search, filter by status code, and inspect JSON trace metadata
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service or endpoint..."
              className="pl-9 pr-3 py-2 bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-56 font-semibold shadow-2xs transition-all"
            />
          </div>

          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-bold shadow-2xs">
            {(['ALL', '2XX', '4XX', '5XX'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all text-[11px] ${
                  statusFilter === st
                    ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl bg-white overflow-hidden text-xs shadow-2xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">
            No logs matched search filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
            const isServerError = log.statusCode >= 500;

            return (
              <div key={log.id} className="transition-colors hover:bg-slate-50/80">
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </motion.div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-extrabold shadow-2xs ${
                        isSuccess
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isServerError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {log.statusCode}
                    </span>

                    <span className="font-extrabold text-slate-900 font-mono">{log.serviceName}</span>
                    <span className="text-slate-500 font-mono truncate">{log.endpoint}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {log.durationMs}ms
                    </span>
                    <span className="text-slate-400">{log.timestamp}</span>
                  </div>
                </div>

                {/* Expanded Metadata View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-10 py-3.5 bg-slate-950 text-slate-200 border-t border-slate-800 font-mono text-[11px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <Code2 className="w-3.5 h-3.5" /> Log Trace JSON Metadata
                        </span>
                        <span>ID: {log.id}</span>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-900/90 text-emerald-400 overflow-x-auto text-xs leading-relaxed border border-slate-800 shadow-inner">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
