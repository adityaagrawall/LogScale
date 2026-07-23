'use client';

import React, { useState } from 'react';
import { Search, Filter, Terminal, ChevronRight, ChevronDown, CheckCircle2, AlertOctagon, Clock } from 'lucide-react';

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

  // Sample production telemetry logs for interactive exploration
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
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Advanced Telemetry Log Explorer & Metadata Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter by status code, and inspect JSON trace metadata
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service or endpoint..."
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 w-56 font-medium"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            {(['ALL', '2XX', '4XX', '5XX'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
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
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isSuccess
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isServerError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {log.statusCode}
                    </span>

                    <span className="font-bold text-slate-900 font-mono">{log.serviceName}</span>
                    <span className="text-slate-500 font-mono truncate">{log.endpoint}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {log.durationMs}ms
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                {/* Expanded Metadata View */}
                {isExpanded && (
                  <div className="px-10 py-3 bg-slate-50 border-t border-slate-100 font-mono text-[11px] text-slate-800 space-y-1">
                    <p className="font-bold text-slate-500 uppercase text-[10px]">Log Trace JSON Metadata:</p>
                    <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto text-xs leading-relaxed">
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
