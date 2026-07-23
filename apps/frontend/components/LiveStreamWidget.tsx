'use client';

import React, { useEffect, useState } from 'react';
import { Radio, Pause, Play } from 'lucide-react';

interface StreamItem {
  id: string;
  type: 'raw_event' | 'telemetry_log';
  timestamp: string;
  payload: any;
}

interface LiveStreamWidgetProps {
  apiKey: string;
}

export const LiveStreamWidget: React.FC<LiveStreamWidgetProps> = ({ apiKey }) => {
  const [events, setEvents] = useState<StreamItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive || !apiKey) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://logscale-backend.onrender.com';
    const eventSource = new EventSource(
      `${backendUrl}/api/v1/stream/live?apiKey=${encodeURIComponent(apiKey)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const newItem: StreamItem = {
          id: Math.random().toString(36).substring(7),
          type: parsed.type,
          timestamp: new Date().toLocaleTimeString(),
          payload: parsed.data,
        };

        setEvents((prev) => [newItem, ...prev.slice(0, 49)]);
      } catch (err) {
        console.error('SSE JSON parse error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isLive, apiKey]);

  return (
    <div className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">
              Real-time Event Pipe & Redis Stream (SSE)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live non-blocking event stream pushed from Redis BullMQ queue
          </p>
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isLive
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isLive ? 'Pause Live Pipe' : 'Resume Live Pipe'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs h-60 overflow-y-auto space-y-2 text-slate-200 shadow-inner">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            Waiting for live telemetry stream events... Send events to POST /api/v1/telemetry/ingest
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-3 py-1 px-2 rounded hover:bg-slate-800/80 transition-colors"
            >
              <span className="text-slate-500 text-[11px] font-mono">{ev.timestamp}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  ev.type === 'raw_event'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {ev.type}
              </span>
              <span className="truncate flex-1 text-slate-200">
                {ev.type === 'raw_event'
                  ? `[Event: ${ev.payload.eventName}] User: ${ev.payload.userId}`
                  : `[Service: ${ev.payload.serviceName}] ${ev.payload.endpoint} - ${ev.payload.statusCode} (${ev.payload.durationMs}ms)`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
