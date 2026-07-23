import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogScale | Enterprise Telemetry & Analytics Platform',
  description: 'Production-grade product analytics, conversion funnels, cohort retention heatmaps, and p95/p99 latency performance metrics.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232563eb"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
