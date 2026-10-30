import React, { useMemo, useState } from 'react';
import { Sliders } from 'lucide-react';
import type { AccountRow } from '../../utils/adsAnalytics';
import { simulateShift } from '../../utils/adsAnalytics';
import { formatINR } from '../../utils/formatters';
import { Delta } from './AdsBits';

/**
 * "What if I move budget between Meta accounts?" Diminishing returns are the whole point: extra
 * spend rarely earns the receiving account's current ROAS, so the slider lets you say how much of
 * it it keeps and shows the efficiency at which the move stops paying.
 */
export const BudgetSimulator: React.FC<{ rows: AccountRow[]; be: number }> = ({ rows, be }) => {
  const comparable = rows.filter(r => r.verdict !== 'Judge on IC cost');
  const byRoas = [...comparable].sort((a, b) => a.roas - b.roas);

  const [from, setFrom] = useState<string>(byRoas[0]?.name ?? '');
  const [to, setTo] = useState<string>(byRoas[byRoas.length - 1]?.name ?? '');
  const [amount, setAmount] = useState<number>(100000);
  const [efficiency, setEfficiency] = useState<number>(80);

  const result = useMemo(
    () => simulateShift(rows, from, to, amount, efficiency / 100, be),
    [rows, from, to, amount, efficiency, be]
  );
  const donor = rows.find(r => r.name === from);
  const recipient = rows.find(r => r.name === to);
  const noMove = from === to || result.amount === 0;
  const pays = !noMove && result.deltaValue > 0;
  const maxMove = Math.max(25000, Math.floor((donor?.spend ?? 300000) / 25000) * 25000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Controls */}
      <div className="lg:col-span-2 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-slate-500 font-medium block mb-1">Move budget from</span>
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-800 font-medium"
            >
              {rows.map(r => (
                <option key={r.name} value={r.name}>{r.name} ({r.roas.toFixed(2)}x)</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-slate-500 font-medium block mb-1">to</span>
            <select
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-800 font-medium"
            >
              {rows.map(r => (
                <option key={r.name} value={r.name}>{r.name} ({r.roas.toFixed(2)}x)</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="text-slate-500 font-medium block mb-1">
            Amount moved: <strong className="text-slate-900 font-mono">{formatINR(Math.min(amount, maxMove))}</strong>
          </label>
          <input
            type="range"
            min={25000}
            max={maxMove}
            step={25000}
            value={Math.min(amount, maxMove)}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-slate-500 font-medium block mb-1">
            Extra spend keeps <strong className="text-slate-900 font-mono">{efficiency}%</strong> of {recipient?.name ?? 'the target'}'s ROAS
          </label>
          <input
            type="range"
            min={40}
            max={100}
            step={5}
            value={efficiency}
            onChange={e => setEfficiency(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>40% (saturated)</span>
            <span>100% (no diminishing returns)</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-3 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Value lost</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">−{formatINR(result.lostValue, true)}</div>
            <div className="text-[10px] text-slate-500">at {donor?.name} {donor?.roas.toFixed(2)}x</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Value gained</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">+{formatINR(result.gainedValue, true)}</div>
            <div className="text-[10px] text-slate-500">at {((recipient?.roas ?? 0) * (efficiency / 100)).toFixed(2)}x effective</div>
          </div>
          <div className={`rounded-lg p-3 border ${noMove ? 'bg-slate-50 border-slate-200' : pays ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Net purchase value</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {result.deltaValue >= 0 ? '+' : '−'}{formatINR(Math.abs(result.deltaValue), true)}
            </div>
            <div className="text-[10px] text-slate-600">{noMove ? 'Pick two different accounts' : pays ? 'Move pays' : 'Move loses value'}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Contribution</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {result.deltaContribution >= 0 ? '+' : '−'}{formatINR(Math.abs(result.deltaContribution), true)}
            </div>
            <div className="text-[10px] text-slate-500">after COGS and shipping</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
          <span>
            Meta ROAS: <span className="font-mono font-semibold text-slate-900">{result.roasBefore.toFixed(2)}x</span> →{' '}
            <span className="font-mono font-semibold text-slate-900">{result.roasAfter.toFixed(2)}x</span>{' '}
            <Delta value={result.roasAfter - result.roasBefore} suffix="x" digits={3} />
          </span>
          {from !== to && (
            <span>
              Pays only if extra spend keeps at least{' '}
              <span className="font-mono font-semibold text-slate-900">{(result.breakEvenEfficiency * 100).toFixed(0)}%</span> of {recipient?.name}'s ROAS
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
          <Sliders className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            A back-of-envelope model on platform-attributed ROAS with the spend held constant. Contribution is purchase value ÷ the {be.toFixed(2)}x break-even ROAS. It cannot see audience saturation, so treat a small positive result as noise and test any real move in steps.
          </span>
        </p>
      </div>
    </div>
  );
};
