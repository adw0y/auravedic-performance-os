import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MetricCard } from '../common/MetricCard';
import { CoverageBadge } from '../layout/CoverageBadge';
import { ViewFilterBar } from '../common/ViewFilterBar';
import { SectionSourceBadge } from '../common/SectionSourceBadge';
import { formatINR, formatPercent, formatROAS, formatNumber } from '../../utils/formatters';
import { dailyRecords } from '../../data/dailyData';
import {
  Megaphone,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AdvertisingView: React.FC = () => {
  const { data, period, setPeriod, channel } = useDashboard();
  const { metaAccounts } = data;

  const n = dailyRecords.length;
  let slice = dailyRecords.slice(35, 60);
  let periodLabel = 'MTD Oct 1–25, 2026';

  if (period === 'yesterday') {
    slice = [dailyRecords[n - 1]];
    periodLabel = 'Yesterday (25 Oct)';
  } else if (period === '7d') {
    slice = dailyRecords.slice(n - 7);
    periodLabel = 'Last 7 Days (19–25 Oct)';
  } else if (period === '14d') {
    slice = dailyRecords.slice(n - 14);
    periodLabel = 'Last 14 Days (12–25 Oct)';
  } else if (period === '30d') {
    slice = dailyRecords.slice(n - 30);
    periodLabel = 'Last 30 Days';
  } else if (period === 'all') {
    slice = dailyRecords;
    periodLabel = '60-Day History';
  }

  let metaSpend = 0;
  let googleSpend = 0;
  let amazonAds = 0;
  let flipkartAds = 0;
  let nykaaAds = 0;
  let myntraAds = 0;
  let metaPurchases = 0;
  let metaPurchaseVal = 0;
  let googleConversions = 0;
  let googleConversionVal = 0;

  slice.forEach(r => {
    metaSpend += r.metaSpend;
    googleSpend += r.googleSpend;
    amazonAds += r.amazonBilledAds;
    flipkartAds += r.flipkartAds;
    nykaaAds += r.nykaaAds;
    myntraAds += r.myntraAds;
    metaPurchases += r.metaPurchases;
    metaPurchaseVal += r.metaPurchaseValue;
    googleConversions += r.googleConversions;
    googleConversionVal += r.googleConversionValue;
  });

  const metaRoas = metaSpend > 0 ? metaPurchaseVal / metaSpend : 0;
  const googleRoas = googleSpend > 0 ? googleConversionVal / googleSpend : 0;

  const chartData = slice.map(r => ({
    date: r.date.slice(5),
    MetaSpend: Math.round(r.metaSpend),
    GoogleSpend: Math.round(r.googleSpend),
    AmazonAds: Math.round(r.amazonBilledAds),
    FlipkartAds: Math.round(r.flipkartAds),
    MetaROAS: r.metaSpend > 0 ? Number((r.metaPurchaseValue / r.metaSpend).toFixed(2)) : 0,
    GoogleROAS: r.googleSpend > 0 ? Number((r.googleConversionValue / r.googleSpend).toFixed(2)) : 0
  }));

  const fatigueAlerts = [
    {
      adSet: 'Kumkumadi_Tailam_Broad_Women25-45_Vid03',
      account: 'New26',
      spend7D: Math.round(metaSpend * 0.28),
      ctr: 0.94,
      frequency: 3.12,
      cpp: 540,
      roas: 1.42,
      status: 'High Fatigue',
      recommendation: 'Pause & rotate new hook (ugc_skincare_v4)'
    },
    {
      adSet: 'Rosemary_HairGrowth_Interest_Ayurveda',
      account: 'Auravedic Internal',
      spend7D: Math.round(metaSpend * 0.20),
      ctr: 1.05,
      frequency: 2.85,
      cpp: 495,
      roas: 1.58,
      status: 'Moderate Fatigue',
      recommendation: 'Swap visual thumbnail & refresh primary text'
    },
    {
      adSet: 'Retinol_Night_Cream_Prospecting_Lookalike2%',
      account: 'MP2',
      spend7D: Math.round(metaSpend * 0.18),
      ctr: 1.85,
      frequency: 1.45,
      cpp: 360,
      roas: 2.15,
      status: 'Winning Creative',
      recommendation: 'Scale budget +20% (fresh creative)'
    }
  ];

  return (
    <div className="space-y-6">
      <CoverageBadge />

      {/* Responsive Advertising Filter Bar */}
      <ViewFilterBar
        showChannels={false}
        showPeriods={true}
        activePeriod={period}
        onPeriodChange={setPeriod}
        title="Cross-Channel Advertising & Paid Acquisition"
        subtitle={`Tracking Meta (5 accounts), Google Ads, Amazon Billed Ads & Flipkart Ads for ${periodLabel}`}
        extraRight={
          <SectionSourceBadge 
            source="Windsor.ai (facebook & google_ads) + Settlement Billed Ads" 
            syncCadence="Daily 04:51 IST"
          />
        }
      />

      {/* Headline Ad KPIs for active period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Meta Spend (5 Accounts)"
          value={formatINR(metaSpend)}
          subtitle={`${formatNumber(metaPurchases)} purchases | ${periodLabel}`}
          badgeText="Meta Ads"
          badgeVariant="primary"
          footnote={`Purchase ROAS: ${formatROAS(metaRoas)}`}
        />

        <MetricCard
          title="Google Ads Spend"
          value={formatINR(googleSpend)}
          subtitle={`${googleConversions.toFixed(1)} conversions | ${periodLabel}`}
          badgeText="Google Ads"
          badgeVariant="neutral"
          footnote={`Conversion ROAS: ${formatROAS(googleRoas)}`}
        />

        <MetricCard
          title="Amazon Billed Ads"
          value={formatINR(amazonAds)}
          subtitle={`Settlement deduction | ${periodLabel}`}
          badgeText="Amazon SP"
          badgeVariant="warning"
          footnote="~₹27.5k / day in settlements"
        />

        <MetricCard
          title="Flipkart Ads Spend"
          value={formatINR(flipkartAds)}
          subtitle={`Campaign spend | ${periodLabel}`}
          badgeText="Flipkart Ads"
          badgeVariant="saffron"
          footnote="Ad sales: ~3.52x ROI"
        />
      </div>

      {/* Dynamic Ad Spend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Daily Platform Spend Breakdown — {periodLabel}
            </h3>
            <p className="text-xs text-slate-500">Daily investment by ad platform in INR.</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Meta
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Google
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Amazon Ads
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Flipkart Ads
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} domain={[1.0, 3.5]} />
              <Tooltip 
                formatter={(val: any, name: string) => {
                  if (name.includes('ROAS')) return [`${Number(val).toFixed(2)}x`, name];
                  return [`₹${Number(val).toLocaleString('en-IN')}`, name];
                }}
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="MetaSpend" stackId="spend" fill="#2563EB" name="Meta Ads Spend" />
              <Bar yAxisId="left" dataKey="GoogleSpend" stackId="spend" fill="#10B981" name="Google Ads Spend" />
              <Bar yAxisId="left" dataKey="AmazonAds" stackId="spend" fill="#F59E0B" name="Amazon Ads" />
              <Bar yAxisId="left" dataKey="FlipkartAds" stackId="spend" fill="#8B5CF6" name="Flipkart Ads" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="MetaROAS" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 3 }} name="Meta ROAS" />
              <Line yAxisId="right" type="monotone" dataKey="GoogleROAS" stroke="#047857" strokeWidth={2.5} dot={{ r: 3 }} name="Google ROAS" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <SectionSourceBadge 
            source="Daily Ad Network Tables (Meta 5-Accounts, Google Ads 318-241-3276, Amazon Billed Ads, Flipkart Ads)" 
            pipeline="Windsor.ai API + Settlement flat files"
          />
        </div>
      </div>

      {/* Meta Ads Breakdown by Account */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Meta Ads: Account League Table — {periodLabel}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Glitch Filter Active
              </span>
            </div>
            <p className="text-xs text-slate-500">5 accounts included. Auravedic Admin strictly excluded per Golden Rule.</p>
          </div>
          <SectionSourceBadge 
            source="Windsor.ai facebook Connector (5 Accounts | Excludes Admin 100149933695451)" 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Account Name</th>
                <th className="py-2.5 px-3">Account ID</th>
                <th className="py-2.5 px-3">Role / Strategy</th>
                <th className="py-2.5 px-3 text-right">Spend ({periodLabel})</th>
                <th className="py-2.5 px-3 text-right">Spend Share</th>
                <th className="py-2.5 px-3 text-right">Purchases</th>
                <th className="py-2.5 px-3 text-right">CPP</th>
                <th className="py-2.5 px-3 text-right">Purchase ROAS</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {metaAccounts.map((acc, idx) => {
                const proratedSpend = Math.round(metaSpend * (acc.share / 100));
                const proratedPurchases = Math.round(metaPurchases * (acc.share / 100));
                const cpp = proratedPurchases > 0 ? Math.round(proratedSpend / proratedPurchases) : 0;

                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${acc.status === 'Excluded' ? 'bg-slate-50/60 opacity-60' : ''}`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${acc.status === 'Excluded' ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                      {acc.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{acc.accountId}</td>
                    <td className="py-2.5 px-3 text-slate-600">{acc.strategy}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {acc.status === 'Excluded' ? '₹0' : formatINR(proratedSpend)}
                    </td>
                    <td className="py-2.5 px-3 text-right">{formatPercent(acc.share)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {acc.status === 'Excluded' ? '0' : formatNumber(proratedPurchases)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {acc.status === 'Excluded' ? '—' : formatINR(cpp)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
                      {acc.status === 'Excluded' ? '—' : (
                        <span className={acc.roasOct >= 1.85 ? 'text-emerald-700' : 'text-slate-800'}>
                          {formatROAS(acc.roasOct)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        acc.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 italic">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Campaign Context: Fresh Pixel 'BOM_Sales_Prospecting_IC_16.09' optimizes for Initiate Checkout on remarketing audiences. It is never ranked as worst purely on purchase ROAS.</span>
        </div>
      </div>

      {/* Creative Fatigue Monitor */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Creative Fatigue Monitor</h3>
              <p className="text-xs text-slate-500">Flags ad sets where CTR falls below 1.2% while frequency exceeds 2.5 and CPP climbs.</p>
            </div>
          </div>
          <SectionSourceBadge 
            source="Weekly Meta Ad-Level Audit (effective_status, CTR, CPM, Frequency)" 
            syncCadence="Mon 03:54 IST"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ad Set Name</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Spend ({periodLabel})</th>
                <th className="py-2.5 px-3 text-right">CTR</th>
                <th className="py-2.5 px-3 text-right">Frequency</th>
                <th className="py-2.5 px-3 text-right">CPP</th>
                <th className="py-2.5 px-3 text-right">ROAS</th>
                <th className="py-2.5 px-3">Fatigue Status</th>
                <th className="py-2.5 px-3">Tactical Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {fatigueAlerts.map((alert, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono text-[11px]">{alert.adSet}</td>
                  <td className="py-2.5 px-3">{alert.account}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">{formatINR(alert.spend7D)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span className={alert.ctr < 1.1 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {formatPercent(alert.ctr)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span className={alert.frequency > 2.5 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {alert.frequency.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatINR(alert.cpp)}</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-700">{formatROAS(alert.roas)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      alert.status.includes('High') ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      alert.status.includes('Moderate') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] font-sans">
                    {alert.recommendation}
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
