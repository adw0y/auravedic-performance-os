import React from 'react';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

export const CoverageBadge: React.FC = () => {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 font-semibold text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
          Golden Rules Active
        </span>
        <span className="text-amber-800 font-medium">
          Ad Spend counted: <strong className="text-amber-950">Meta (5 accounts) + Google Ads</strong>
        </span>
        <span className="text-amber-400">|</span>
        <span className="text-amber-800 font-medium">
          Amazon Ads: <strong className="text-amber-950">Tracked via Settlements & Reports</strong>
        </span>
        <span className="text-amber-400">|</span>
        <span className="text-amber-800 font-medium">
          Flipkart: <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">ESTIMATE</span>
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-amber-700">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Zero PII Stored</span>
        </span>
        <span className="text-amber-300">•</span>
        <span>Read-Only Direct Integrations</span>
      </div>
    </div>
  );
};
