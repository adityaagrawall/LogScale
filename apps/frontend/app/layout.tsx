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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/40 text-slate-900 selection:bg-blue-600 selection:text-white font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
