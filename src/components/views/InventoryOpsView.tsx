import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MetricCard } from '../common/MetricCard';
import { SectionSourceBadge } from '../common/SectionSourceBadge';
import { formatINR, formatPercent, formatNumber } from '../../utils/formatters';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Warehouse,
  Truck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const InventoryOpsView: React.FC = () => {
  const { data } = useDashboard();
  const { warehouseStock, amazonInventoryPlan } = data;

  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');

  const filteredStock = warehouseStock.filter(item => {
    if (filterStatus === 'critical') return item.daysOfCover < 7;
    if (filterStatus === 'warning') return item.daysOfCover >= 7 && item.daysOfCover <= 14;
    if (filterStatus === 'healthy') return item.daysOfCover > 14;
    return true;
  });

  const criticalItems = warehouseStock.filter(item => item.daysOfCover < 7);
  const warningItems = warehouseStock.filter(item => item.daysOfCover >= 7 && item.daysOfCover <= 14);

  return (
    <div className="space-y-6">
      {/* Headline Inventory KPIs (Section) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Physical Warehouse & FBA Inventory
          </span>
          <SectionSourceBadge 
            source="Nightly Warehouse Reports (Slack #inventory-wh-movement) + Amazon FBA Reports" 
            syncCadence="Mon-Sat 23:00 IST"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Critical Stockout Alerts"
            value={`${criticalItems.length} Products`}
            subtitle="Cover &lt; 7 days (immediate factory batch needed)"
            badgeText="Urgent"
            badgeVariant="danger"
            footnote="Kumkumadi Night Serum (KNS): 6.3 days"
          />

          <MetricCard
            title="Reorder Warning Queue"
            value={`${warningItems.length} Products`}
            subtitle="Cover between 7 and 14 days"
            badgeText="7–14 Days"
            badgeVariant="warning"
            footnote="KNC Night Cream & KGEL Gel"
          />

          <MetricCard
            title="Hero Product Stock (K100)"
            value="7,190 Units"
            subtitle="CBE: 4,040 | Mumbai: 3,150"
            badgeText="Hero Oil"
            badgeVariant="success"
            footnote="Days of cover: 43.5 days (Safe)"
          />

          <MetricCard
            title="Amazon FBA Reserve Units"
            value="4,379 Units"
            subtitle="Total available across FBA centers"
            badgeText="Amazon FBA"
            badgeVariant="primary"
            footnote="Avg monthly Amazon run-rate: 3,905 units"
          />
        </div>
      </div>

      {/* Operational Dispatch Rule Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Warehouse className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <strong className="text-white block font-semibold">Warehouse Dispatch & Routing Logic:</strong>
            <p className="text-slate-300 text-[11px] mt-0.5">
              South India orders (TN, KA, KL, AP, TS, PY) ship from <strong>Coimbatore (CBE)</strong>. All other zones ship from <strong>Mumbai</strong>. Palakkad factory replenishes both hubs weekly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">CBE SIH = D2C Avl + BLK-RSRV</span>
        </div>
      </div>

      {/* Days of Cover & Reorder Table (Section) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Base Product Stock & Days of Cover (CBE + Mumbai)</h3>
            <p className="text-xs text-slate-500">Nightly closing stock report parsed from #inventory-wh-movement.</p>
          </div>

          <div className="flex items-center gap-3">
            <SectionSourceBadge 
              source="Coimbatore & Mumbai Warehouse Closing OCR Logs" 
              syncCadence="Task #7 (23:00 IST)"
            />
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                All ({warehouseStock.length})
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterStatus === 'critical' ? 'bg-rose-500 text-white font-semibold' : 'text-slate-600'}`}
              >
                Critical ({criticalItems.length})
              </button>
              <button
                onClick={() => setFilterStatus('warning')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterStatus === 'warning' ? 'bg-amber-500 text-white font-semibold' : 'text-slate-600'}`}
              >
                Warning ({warningItems.length})
              </button>
              <button
                onClick={() => setFilterStatus('healthy')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterStatus === 'healthy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Healthy
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Base Key</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">CBE D2C Avl</th>
                <th className="py-2.5 px-3 text-right">CBE Bulk Reserve</th>
                <th className="py-2.5 px-3 text-right">Mumbai Stock</th>
                <th className="py-2.5 px-3 text-right">Total Units</th>
                <th className="py-2.5 px-3 text-right">Daily Velocity</th>
                <th className="py-2.5 px-3 text-right">Days of Cover</th>
                <th className="py-2.5 px-3 text-right">Reorder Batch</th>
                <th className="py-2.5 px-3">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStock.map((item, idx) => {
                const targetDays = 45;
                const reorderNeeded = item.daysOfCover < 14;
                const suggestedBatch = Math.max(0, Math.round((item.dailyRunRate * targetDays) - item.totalStock));

                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.daysOfCover < 7 ? 'bg-rose-50/40' : item.daysOfCover <= 14 ? 'bg-amber-50/20' : ''}`}>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-900">{item.key}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatNumber(item.cbeD2CAvl)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatNumber(item.cbeBulkReserve)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatNumber(item.mumbaiSIH)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(item.totalStock)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{item.dailyRunRate} u/day</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={item.daysOfCover < 7 ? 'text-rose-700 font-extrabold' : item.daysOfCover <= 14 ? 'text-amber-700' : 'text-emerald-700'}>
                        {item.daysOfCover}d
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {reorderNeeded ? (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          +{formatNumber(suggestedBatch)} units
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.daysOfCover < 7 ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold' :
                        item.daysOfCover <= 14 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {item.daysOfCover < 7 ? 'Critical (<7d)' : item.daysOfCover <= 14 ? 'Low (7-14d)' : 'Optimal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Amazon Inventory Plan Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Amazon Inbound & Inventory Restock Plan (FBA)</h3>
            <p className="text-xs text-slate-500">Cross-channel restock recommendations extracted from operational planning.</p>
          </div>
          <SectionSourceBadge 
            source="Amazon FBA Inventory Planning (Windsor SP-API amz_inventory)" 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ASIN</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Current FBA Stock</th>
                <th className="py-2.5 px-3 text-right">Inbound Pipeline</th>
                <th className="py-2.5 px-3 text-right">Avg Monthly Sale</th>
                <th className="py-2.5 px-3 text-right">FBA Days of Cover</th>
                <th className="py-2.5 px-3 text-right">Inbound Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {amazonInventoryPlan.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-900">{p.asin}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{p.product}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatNumber(p.currentInventory)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold">+{formatNumber(p.inbound)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatNumber(p.avgMonthlySale)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{p.daysOfCover}d</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {p.neededToSend > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                        Send {formatNumber(p.neededToSend)} u
                      </span>
                    ) : (
                      <span className="text-emerald-700">Stocked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
