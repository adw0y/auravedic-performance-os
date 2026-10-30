import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const FreshnessStrip: React.FC = () => {
  const { data, setCurrentView } = useDashboard();
  const { freshness } = data;

  const items = [
    { name: 'Meta Ads (5 Acc)', time: freshness.metaAds, status: 'fresh' },
    { name: 'Google Ads', time: freshness.googleAds, status: 'fresh' },
    { name: 'Shopify Store', time: freshness.shopifySales, status: 'fresh' },
    { name: 'Amazon SP-API', time: freshness.amazonSales, status: 'fresh' },
    { name: 'Amazon Settle', time: freshness.amazonSettlement, status: 'partial' },
    { name: 'Flipkart Hub', time: freshness.flipkartOrders, status: 'fresh' },
    { name: 'Warehouse Desk', time: freshness.warehouseStock, status: 'fresh' },
  ];

  return (
    <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto select-none">
      <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span className="uppercase tracking-wider text-[10px] text-amber-400 font-bold">Data Freshness:</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
            {item.status === 'fresh' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-200 font-medium">{item.name}:</span>
            <span className="text-slate-400">{item.time}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setCurrentView('data-health')}
        className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors ml-auto shrink-0 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded"
      >
        Ingestion & Logs →
      </button>
    </div>
  );
};
