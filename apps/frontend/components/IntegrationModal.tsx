'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Globe, 
  Server, 
  Copy, 
  Check, 
  X, 
  Play, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  backendUrl: string;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  backendUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'curl' | 'sandbox'>('frontend');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Live Sandbox state
  const [customEventName, setCustomEventName] = useState('button_click');
  const [customUserId, setCustomUserId] = useState('live_user_42');
  const [customProps, setCustomProps] = useState('{\n  "plan": "enterprise",\n  "page": "/pricing"\n}');
  const [sandboxStatus, setSandboxStatus] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const jsSnippet = `// Send Telemetry Event from any Website (React, Vue, HTML, etc.)
async function trackLogScaleEvent(eventName, userId, properties = {}) {
  await fetch('${backendUrl}/api/v1/telemetry/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}'
    },
    body: JSON.stringify({
      events: [
        {
          eventName: eventName,
          userId: userId,
          properties: {
            url: window.location.href,
            ...properties
          }
        }
      ]
    })
  });
}

// Example usage on your site:
trackLogScaleEvent('user_signed_up', 'user_101', { tier: 'pro' });`;

  const nodeSnippet = `// Send Server Telemetry & API Latency Logs from any Node/Express/Next Backend
async function sendTelemetryLog(serviceName, endpoint, statusCode, durationMs) {
  await fetch('${backendUrl}/api/v1/telemetry/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}'
    },
    body: JSON.stringify({
      telemetry: [
        {
          serviceName: serviceName,
          endpoint: endpoint,
          statusCode: statusCode,
          durationMs: durationMs,
          meta: { env: 'production', host: 'cloud-cluster-1' }
        }
      ]
    })
  });
}

// Example usage:
sendTelemetryLog('payment-service', '/api/v1/charge', 200, 48.2);`;

  const curlSnippet = `curl -X POST ${backendUrl}/api/v1/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "events": [
      {
        "eventName": "checkout_completed",
        "userId": "user_777",
        "properties": { "amount": 499 }
      }
    ]
  }'`;

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSandboxSubmit = async () => {
    setSandboxLoading(true);
    setSandboxStatus('Dispatching live request to LogScale cloud API...');

    let parsedProperties = {};
    try {
      parsedProperties = JSON.parse(customProps);
    } catch (e) {
      setSandboxStatus('❌ Invalid JSON in properties field');
      setSandboxLoading(false);
      return;
    }

    try {
      const startTime = performance.now();
      const res = await fetch(`${backendUrl}/api/v1/telemetry/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          events: [
            {
              eventName: customEventName,
              userId: customUserId,
              properties: parsedProperties,
            },
          ],
        }),
      });

      const responseMs = Math.round(performance.now() - startTime);

      if (res.status === 202) {
        const json = await res.json();
        setSandboxStatus(`⚡ HTTP 202 Accepted in ${responseMs}ms! Job ID: ${json.jobId}`);
      } else {
        setSandboxStatus(`❌ Ingestion Error: HTTP ${res.status}`);
      }
    } catch (err: any) {
      setSandboxStatus(`❌ Network Error: ${err.message}`);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Developer Integration Hub
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight font-heading">
                Connect LogScale to Your Website & Apps
              </h2>
              <p className="text-xs text-blue-100 mt-1 max-w-xl">
                Integrate non-blocking real-time product analytics & telemetry into any website or backend in under 2 minutes.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center bg-slate-100/80 p-2 gap-1.5 border-b border-slate-200 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab('frontend')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'frontend'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-500" />
                Website (Frontend JS)
              </button>

              <button
                onClick={() => setActiveTab('backend')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'backend'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Server className="w-4 h-4 text-purple-500" />
                Backend API / Node
              </button>

              <button
                onClick={() => setActiveTab('curl')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'curl'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-4 h-4 text-emerald-500" />
                Terminal cURL
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'sandbox'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Live Interactive Sandbox
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === 'frontend' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-700">
                      Copy & paste this snippet into any website or React component:
                    </p>
                    <button
                      onClick={() => handleCopy(jsSnippet, 'frontend')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-colors"
                    >
                      {copiedTab === 'frontend' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === 'frontend' ? 'Copied!' : 'Copy JS Snippet'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                    {jsSnippet}
                  </pre>
                </div>
              )}

              {activeTab === 'backend' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-700">
                      Send API telemetry & response times from Node.js, Express, or Next.js API routes:
                    </p>
                    <button
                      onClick={() => handleCopy(nodeSnippet, 'backend')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 transition-colors"
                    >
                      {copiedTab === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === 'backend' ? 'Copied!' : 'Copy Node Snippet'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-purple-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                    {nodeSnippet}
                  </pre>
                </div>
              )}

              {activeTab === 'curl' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-700">
                      Execute this cURL command directly from your bash or zsh terminal:
                    </p>
                    <button
                      onClick={() => handleCopy(curlSnippet, 'curl')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors"
                    >
                      {copiedTab === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTab === 'curl' ? 'Copied!' : 'Copy cURL'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-blue-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                    {curlSnippet}
                  </pre>
                </div>
              )}

              {activeTab === 'sandbox' && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-600">
                    Test sending a real event right now. It will hit the live cloud ingestion API and stream directly to the dashboard!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">Event Name:</label>
                      <input
                        type="text"
                        value={customEventName}
                        onChange={(e) => setCustomEventName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. signup_clicked"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">User ID:</label>
                      <input
                        type="text"
                        value={customUserId}
                        onChange={(e) => setCustomUserId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. user_999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block text-xs">Custom JSON Properties:</label>
                    <textarea
                      value={customProps}
                      onChange={(e) => setCustomProps(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none border border-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleSandboxSubmit}
                      disabled={sandboxLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {sandboxLoading ? 'Firing Event...' : 'Fire Live Event Payload'}
                    </button>

                    {sandboxStatus && (
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                        {sandboxStatus}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
