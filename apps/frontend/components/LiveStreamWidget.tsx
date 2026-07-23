'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Pause, Play, Terminal, Sparkles } from 'lucide-react';

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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card-light rounded-2xl p-6 shadow-sm border border-slate-200/80 relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Real-time Event Pipe & Redis Stream (SSE)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Live non-blocking event stream pushed from Redis BullMQ queue
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border shadow-xs transition-all ${
            isLive
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isLive ? 'Pause Live Pipe' : 'Resume Live Pipe'}
        </motion.button>
      </div>

      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-xs h-64 overflow-y-auto space-y-2 text-slate-200 shadow-inner relative">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>live-sse-stream.socket</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            CONNECTED
          </span>
        </div>

        {events.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 italic gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400/50 animate-bounce" />
            <p>Waiting for live telemetry stream events...</p>
            <p className="text-[11px] not-italic text-slate-600">Click &quot;Simulate Live Event Ingestion&quot; above to trigger stream</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:bg-slate-800/80 transition-colors"
              >
                <span className="text-slate-500 text-[11px] font-mono shrink-0">{ev.timestamp}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                    ev.type === 'raw_event'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {ev.type}
                </span>
                <span className="truncate flex-1 text-slate-200 text-xs">
                  {ev.type === 'raw_event'
                    ? `[Event: ${ev.payload.eventName}] User: ${ev.payload.userId}`
                    : `[Service: ${ev.payload.serviceName}] ${ev.payload.endpoint} - ${ev.payload.statusCode} (${ev.payload.durationMs}ms)`}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
