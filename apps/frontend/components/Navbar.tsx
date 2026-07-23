'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ apiKey, setApiKey }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3.5">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Zap className="w-5 h-5 fill-current relative z-10" />
          </motion.div>
          
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-2xl tracking-tight gradient-text-primary">
                LogScale
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-spin-slow" />
                v1.0 Cloud Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Enterprise Product Analytics & High-Throughput Ingestion
            </p>
          </div>
        </div>

        {/* Status Indicators & Security */}
        <div className="flex items-center gap-3.5">
          {/* Security Key Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50/90 hover:bg-white border border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all rounded-xl px-3.5 py-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Key:</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-transparent text-slate-800 font-mono focus:outline-none w-36 text-xs font-semibold tracking-wider"
              placeholder="lx_live_..."
            />
          </div>

          {/* Real-time Status Badge */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-xs"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="hidden md:inline">Ingestion Pipeline</span>
            <span className="text-emerald-600 font-extrabold uppercase text-[10px] tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
