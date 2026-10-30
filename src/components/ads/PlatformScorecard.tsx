import React from 'react';
import type { PlatformRow } from '../../utils/adsAnalytics';
import { formatINR, formatPercent } from '../../utils/formatters';
import { PLATFORM_COLOR, CHROME } from './adTheme';

/** One row per platform: where the money goes and what each rupee returns, with the basis stated. */
export const PlatformScorecard: React.FC<{ rows: PlatformRow[]; periodLabel: string }> = ({ rows, periodLabel }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
        <tr>
          <th className="py-2.5 px-3">Platform</th>
          <th className="py-2.5 px-3 text-right">Spend ({periodLabel})</th>
          <th className="py-2.5 px-3 w-44">Share of spend</th>
          <th className="py-2.5 px-3 text-right">Return per ₹1</th>
          <th className="py-2.5 px-3 text-right">Cost per result</th>
          <th className="py-2.5 px-3">Basis</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
        {rows.map(r => (
          <tr key={r.key} className="hover:bg-slate-50 transition-colors">
            <td className="py-2.5 px-3 font-semibold text-slate-900">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PLATFORM_COLOR[r.key] }} />
                {r.label}
              </span>
            </td>
            <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">{formatINR(r.spend)}</td>
            <td className="py-2.5 px-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: CHROME.grid }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.spendShare)}%`, background: PLATFORM_COLOR[r.key] }} />
                </div>
                <span className="font-mono text-slate-700 w-12 text-right">{formatPercent(r.spendShare)}</span>
              </div>
            </td>
            <td className="py-2.5 px-3 text-right font-mono">
              <span className="font-bold text-slate-900">{r.efficiency.toFixed(2)}x</span>
              <div className="text-[10px] text-slate-500 font-sans font-normal">{r.efficiencyLabel}</div>
            </td>
            <td className="py-2.5 px-3 text-right font-mono">
              <span className="font-bold text-slate-900">{formatINR(r.costPerResult)}</span>
              <div className="text-[10px] text-slate-500 font-sans font-normal">{r.costLabel}</div>
            </td>
            <td className="py-2.5 px-3">
              <span
                className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border mb-0.5 ${
                  r.basisTone === 'attributed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                {r.basisTone === 'attributed' ? 'Attributed' : 'Estimate'}
              </span>
              <div className="text-[11px] text-slate-500 font-normal max-w-[260px]">{r.basis}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
