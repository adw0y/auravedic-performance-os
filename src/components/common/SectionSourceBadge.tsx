import React from 'react';
import { Database, Clock } from 'lucide-react';

interface SectionSourceBadgeProps {
  source: string;
  pipeline?: string;
  syncCadence?: string;
  latency?: string;
  className?: string;
}

export const SectionSourceBadge: React.FC<SectionSourceBadgeProps> = ({
  source,
  pipeline,
  syncCadence,
  latency,
  className = ''
}) => {
  // Derive intelligent latency default if not explicitly passed
  const resolvedLatency = latency || (() => {
    const s = `${source} ${pipeline || ''}`.toLowerCase();
    if (s.includes('amazon ads') || s.includes('sp-api') || s.includes('seller central')) return '24-48h attribution lag';
    if (s.includes('meta') || s.includes('facebook') || s.includes('instagram')) return '2-4h (T-1 finalized)';
    if (s.includes('google ads')) return '3-6h (T-1 finalized)';
    if (s.includes('shopify')) return '< 15m (near real-time)';
    if (s.includes('flipkart') || s.includes('nykaa') || s.includes('myntra')) return '24-72h settlement lag';
    if (s.includes('stock desk') || s.includes('warehouse') || s.includes('delhi')) return 'Weekly batch (Friday)';
    if (s.includes('windsor')) return 'Daily automated ETL';
    return 'T-1 day (Daily midnight)';
  })();

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/90 text-[11px] text-slate-600 font-sans shadow-2xs ${className}`}>
      <span className="flex items-center gap-1 font-semibold text-slate-700">
        <Database className="w-3 h-3 text-amber-600 shrink-0" />
        Data Source:
      </span>
      <span className="text-slate-800 font-medium">{source}</span>
      {pipeline && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono text-[10px]">{pipeline}</span>
        </>
      )}
      {syncCadence && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
            {syncCadence}
          </span>
        </>
      )}
      {resolvedLatency && (
        <>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium text-[10px] bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200">
            <Clock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span>Latency: <strong className="text-slate-700 font-mono">{resolvedLatency}</strong></span>
          </span>
        </>
      )}
    </div>
  );
};
