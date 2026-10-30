import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

export interface TableSpec {
  columns: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  table: TableSpec;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Card wrapper for a chart with a table twin: every value on the chart is also readable as a
 * table, so nothing depends on colour or on hovering a tooltip.
 */
export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, right, table, footer, children }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200" role="group" aria-label="Chart or table view">
            <button
              type="button"
              aria-pressed={view === 'chart'}
              onClick={() => setView('chart')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                view === 'chart' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3 h-3" /> Chart
            </button>
            <button
              type="button"
              aria-pressed={view === 'table'}
              onClick={() => setView('table')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                view === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table2 className="w-3 h-3" /> Table
            </button>
          </div>
        </div>
      </div>

      {view === 'chart' ? (
        children
      ) : (
        <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                {table.columns.map((c, i) => (
                  <th key={c} className={`py-2 px-3 ${i === 0 ? '' : 'text-right'}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) => (
                    <td key={i} className={`py-1.5 px-3 ${i === 0 ? 'font-medium text-slate-900' : 'text-right font-mono'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {footer}
    </div>
  );
};

/** Dark hover tooltip shared by the ad charts. */
export const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string | number;
  format?: (value: number, name: string) => string;
  showTotal?: boolean;
}> = ({ active, payload, label, format = v => String(v), showTotal }) => {
  if (!active || !payload || payload.length === 0) return null;
  const total = showTotal ? payload.reduce((a, p) => a + Number(p.value || 0), 0) : null;
  return (
    <div className="rounded-lg bg-slate-900 text-slate-100 text-xs px-3 py-2 shadow-lg min-w-[150px]">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map(p => (
        <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            {p.name}
          </span>
          <span className="font-mono">{format(Number(p.value), String(p.name))}</span>
        </div>
      ))}
      {total !== null && (
        <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-slate-700 font-semibold">
          <span>Total</span>
          <span className="font-mono">{format(total, 'Total')}</span>
        </div>
      )}
    </div>
  );
};
