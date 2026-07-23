'use client';

import React from 'react';
import { Zap, ShieldCheck, Activity, Layers } from 'lucide-react';

interface NavbarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ apiKey, setApiKey }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                LogScale
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                v1.0 Production
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Enterprise Telemetry & Analytics Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 font-medium">X-API-Key:</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-transparent text-slate-900 font-mono focus:outline-none w-44 text-xs font-semibold"
              placeholder="lx_live_..."
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ingestion Pipeline Active
          </div>
        </div>
      </div>
    </header>
  );
};
