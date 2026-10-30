import React from 'react';
import { AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import type { Insight } from '../../utils/adsAnalytics';
import { STATUS, CHROME } from './adTheme';

const TONE = {
  risk: { label: 'Risk', Icon: AlertTriangle, color: STATUS.critical },
  opportunity: { label: 'Opportunity', Icon: TrendingUp, color: STATUS.good },
  info: { label: 'Insight', Icon: Lightbulb, color: CHROME.inkSecondary }
} as const;

/**
 * Findings computed from the data on screen. Each card pairs an icon with a label, and the
 * numbers in the text come straight from the same series the charts draw.
 */
export const InsightsPanel: React.FC<{ insights: Insight[] }> = ({ insights }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {insights.map(i => {
      const tone = TONE[i.tone];
      return (
        <div
          key={i.id}
          className="bg-white rounded-xl border border-slate-200 border-l-4 p-4 shadow-2xs flex flex-col gap-2"
          style={{ borderLeftColor: tone.color }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <tone.Icon className="w-3.5 h-3.5" style={{ color: tone.color }} />
              {tone.label}
            </span>
            {i.tag && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-900 border-amber-200">
                {i.tag}
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{i.stat}</div>
            <div className="text-[11px] text-slate-500">{i.statLabel}</div>
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">{i.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{i.body}</p>
        </div>
      );
    })}
  </div>
);
