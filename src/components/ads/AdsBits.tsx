import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info, AlertTriangle, AlertCircle, TrendingUp, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Verdict, FatigueStatus } from '../../utils/adsAnalytics';

/** Status chips always carry an icon and a label: colour never stands alone. */

const chipBase = 'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap';

export const VerdictChip: React.FC<{ verdict: Verdict }> = ({ verdict }) => {
  switch (verdict) {
    case 'Scale':
      return <span className={`${chipBase} bg-emerald-50 text-emerald-800 border-emerald-200`}><ArrowUpRight className="w-3 h-3" />Scale</span>;
    case 'Fix':
      return <span className={`${chipBase} bg-rose-50 text-rose-800 border-rose-200`}><ArrowDownRight className="w-3 h-3" />Fix</span>;
    case 'Judge on IC cost':
      return <span className={`${chipBase} bg-amber-50 text-amber-900 border-amber-200`}><Info className="w-3 h-3" />Judge on IC cost</span>;
    default:
      return <span className={`${chipBase} bg-slate-100 text-slate-700 border-slate-300`}><Minus className="w-3 h-3" />Hold</span>;
  }
};

export const FatigueChip: React.FC<{ status: FatigueStatus }> = ({ status }) => {
  switch (status) {
    case 'High fatigue':
      return <span className={`${chipBase} bg-rose-50 text-rose-800 border-rose-200`}><AlertTriangle className="w-3 h-3" />High fatigue</span>;
    case 'Moderate fatigue':
      return <span className={`${chipBase} bg-amber-50 text-amber-900 border-amber-200`}><AlertCircle className="w-3 h-3" />Moderate</span>;
    case 'Winning':
      return <span className={`${chipBase} bg-emerald-50 text-emerald-800 border-emerald-200`}><TrendingUp className="w-3 h-3" />Winning</span>;
    default:
      return <span className={`${chipBase} bg-slate-100 text-slate-700 border-slate-300`}><CheckCircle2 className="w-3 h-3" />No fatigue</span>;
  }
};

/** Signed delta with an arrow. `goodWhenUp` says whether an increase is good news. */
export const Delta: React.FC<{ value: number; suffix?: string; digits?: number; goodWhenUp?: boolean }> = ({
  value,
  suffix = '',
  digits = 2,
  goodWhenUp = true
}) => {
  const flat = Math.abs(value) < Math.pow(10, -digits) / 2;
  const good = value > 0 === goodWhenUp;
  const color = flat ? 'text-slate-500' : good ? 'text-emerald-700' : 'text-rose-700';
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono ${color}`}>
      {flat ? <Minus className="w-3 h-3" /> : value > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {value > 0 ? '+' : ''}
      {value.toFixed(digits)}
      {suffix}
    </span>
  );
};
