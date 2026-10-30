import { dailyRecords } from './dailyData';
import { initialDashboardData } from './initialData';
import type { MetaAccount } from './initialData';
import { accountIndexes } from '../utils/adsAnalytics';

/**
 * ILLUSTRATIVE ad-set level Meta data.
 *
 * The dashboard has no impressions, clicks, CTR or frequency yet (the handbook says the Windsor
 * `facebook` daily pull carries them, but they are not in this app's data bundle). This module
 * builds a stand-in at the same grain as that export so the analysis views have something real
 * to run on:
 *
 *  - spend, purchases and purchase value of every account-day are NOT invented: they are the real
 *    daily Meta series split by the real account shares and ROAS / purchase-rate indexes, so any
 *    period's totals tie exactly to the league table and the KPI cards;
 *  - the split of an account-day across its ad sets, and impressions / clicks / frequency, ARE
 *    invented (seeded, deterministic). Every view built on them is labelled illustrative.
 *
 * To go live, replace `adSetDays` with rows parsed from a Windsor `facebook` ad-set export using
 * the AdSetDay shape below (date, account, ad set, spend, impressions, clicks, purchases, value,
 * frequency); nothing downstream needs to change.
 */

export interface AdSetSpec {
  id: string;
  name: string;
  account: string; // MetaAccount.name
  /** Share of the account's daily spend (relative; normalised within the account). */
  weight: number;
  /** Baseline link CTR (fraction). */
  ctr: number;
  /** Baseline CPM in rupees. */
  cpm: number;
  /** Relative click -> purchase propensity (only splits the account's purchases between its ad sets). */
  cvr: number;
  /** Baseline 7-day frequency. */
  freq: number;
  /** Creative wearing out: from `start` (day index) CTR decays by up to `severity` and frequency climbs. */
  fatigue?: { start: number; severity: number; freqGrowth: number };
}

export const AD_SETS: AdSetSpec[] = [
  // New26 - Scale / Evergreen Prospecting
  { id: 'n26-a', name: 'Kumkumadi_Tailam_Broad_Women25-45_Vid03', account: 'New26', weight: 0.40, ctr: 0.0165, cpm: 175, cvr: 0.026, freq: 1.9, fatigue: { start: 30, severity: 0.45, freqGrowth: 0.045 } },
  { id: 'n26-b', name: 'Rosemary_HairGrowth_Interest_Ayurveda_Img12', account: 'New26', weight: 0.35, ctr: 0.0135, cpm: 190, cvr: 0.024, freq: 1.7 },
  { id: 'n26-c', name: 'Combo_Hero_Broad_LAL1pct_Vid07', account: 'New26', weight: 0.25, ctr: 0.0185, cpm: 165, cvr: 0.032, freq: 1.5 },

  // Auravedic Internal - Middle of Funnel / Retargeting
  { id: 'int-a', name: 'Retarget_ATC_7d_Offer_Carousel', account: 'Auravedic Internal', weight: 0.38, ctr: 0.029, cpm: 260, cvr: 0.045, freq: 2.6 },
  { id: 'int-b', name: 'Retarget_VideoViewers_30d_UGC02', account: 'Auravedic Internal', weight: 0.32, ctr: 0.021, cpm: 230, cvr: 0.03, freq: 2.2, fatigue: { start: 38, severity: 0.3, freqGrowth: 0.04 } },
  { id: 'int-c', name: 'Retarget_SiteVisitors_14d_Static05', account: 'Auravedic Internal', weight: 0.3, ctr: 0.014, cpm: 240, cvr: 0.034, freq: 2.9, fatigue: { start: 44, severity: 0.28, freqGrowth: 0.03 } },

  // MP2 - Combo & Hero Push
  { id: 'mp2-a', name: 'Retinol_Night_Cream_Prospecting_LAL2pct', account: 'MP2', weight: 0.36, ctr: 0.019, cpm: 170, cvr: 0.032, freq: 1.5 },
  { id: 'mp2-b', name: 'KNS_KNC_Combo_Interest_Skincare_Vid05', account: 'MP2', weight: 0.34, ctr: 0.0175, cpm: 185, cvr: 0.014, freq: 1.8 },
  { id: 'mp2-c', name: 'Hero_K100_Broad_Women28-50_Img03', account: 'MP2', weight: 0.3, ctr: 0.0098, cpm: 150, cvr: 0.034, freq: 1.6 },

  // Auravedic GC - Broad Interest Tests
  { id: 'gc-a', name: 'BroadTest_Ayurveda_Interest_Vid01', account: 'Auravedic GC', weight: 0.36, ctr: 0.0125, cpm: 205, cvr: 0.024, freq: 1.4 },
  { id: 'gc-b', name: 'BroadTest_Haircare_Interest_Img04', account: 'Auravedic GC', weight: 0.34, ctr: 0.0105, cpm: 255, cvr: 0.021, freq: 1.6 },
  { id: 'gc-c', name: 'BroadTest_Skincare_Auto_Vid09', account: 'Auravedic GC', weight: 0.3, ctr: 0.015, cpm: 195, cvr: 0.025, freq: 1.5, fatigue: { start: 36, severity: 0.36, freqGrowth: 0.04 } },

  // Fresh Pixel - Initiate Checkout optimised remarketing
  { id: 'fp-a', name: 'BOM_Sales_Prospecting_IC_16.09', account: 'Fresh Pixel', weight: 0.6, ctr: 0.0155, cpm: 200, cvr: 0.026, freq: 1.8 },
  { id: 'fp-b', name: 'BOM_IC_Remarketing_14d_Vid02', account: 'Fresh Pixel', weight: 0.4, ctr: 0.0195, cpm: 215, cvr: 0.03, freq: 2.3 }
];

export interface AdSetDay {
  date: string;
  dayIndex: number;
  adSetId: string;
  account: string;
  spend: number;
  impressions: number;
  clicks: number;
  /** Fractional: purchases are split across ad sets, so they are not whole numbers per row. */
  purchases: number;
  purchaseValue: number;
  /** 7-day frequency. */
  frequency: number;
}

// Deterministic PRNG so the sample is identical on every load
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildAdSetDays(accounts: MetaAccount[], specs: AdSetSpec[] = AD_SETS): AdSetDay[] {
  const rand = mulberry32(20261030);
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const lognormal = (sigma: number) => Math.exp(gauss() * sigma);

  const indexes = accountIndexes(accounts);
  const rows: AdSetDay[] = [];
  const lastDay = dailyRecords.length - 1;

  dailyRecords.forEach((rec, d) => {
    for (const acc of indexes) {
      const sets = specs.filter(s => s.account === acc.name);
      if (sets.length === 0) continue;

      // Real, tied account-day totals
      const accSpend = rec.metaSpend * (acc.share / 100);
      const accPurchases = rec.metaPurchases * (acc.share / 100) * acc.purchIdx;
      const accValue = rec.metaPurchaseValue * (acc.share / 100) * acc.roasIdx;

      // Invented split of the account-day across its ad sets
      const rawSpend = sets.map(s => s.weight * lognormal(0.12));
      const spendTotal = rawSpend.reduce((a, b) => a + b, 0);

      const built = sets.map((s, i) => {
        const spend = (rawSpend[i] / spendTotal) * accSpend;
        const progress = s.fatigue ? Math.min(1, Math.max(0, (d - s.fatigue.start) / (lastDay - s.fatigue.start))) : 0;
        const daysWorn = s.fatigue ? Math.max(0, d - s.fatigue.start) : 0;

        const frequency = s.freq + (s.fatigue ? s.fatigue.freqGrowth * daysWorn : 0) + gauss() * 0.05;
        const ctr = s.ctr * (1 - (s.fatigue ? s.fatigue.severity * progress : 0)) * lognormal(0.06);
        const cpm = s.cpm * (1 + 0.05 * (frequency - s.freq)) * lognormal(0.05);

        const impressions = (spend * 1000) / cpm;
        const clicks = impressions * ctr;
        const rawPurchases = clicks * s.cvr * lognormal(0.1);
        return { s, spend, impressions, clicks, frequency, rawPurchases, rawValue: 0 };
      });

      const purchTotal = built.reduce((a, b) => a + b.rawPurchases, 0);
      built.forEach(b => {
        b.rawPurchases = (b.rawPurchases / purchTotal) * accPurchases;
        b.rawValue = b.rawPurchases * lognormal(0.05);
      });
      const valueTotal = built.reduce((a, b) => a + b.rawValue, 0);

      built.forEach(b => {
        rows.push({
          date: rec.date,
          dayIndex: d,
          adSetId: b.s.id,
          account: acc.name,
          spend: b.spend,
          impressions: b.impressions,
          clicks: b.clicks,
          purchases: b.rawPurchases,
          purchaseValue: (b.rawValue / valueTotal) * accValue,
          frequency: b.frequency
        });
      });
    }
  });

  return rows;
}

export const adSetDays: AdSetDay[] = buildAdSetDays(initialDashboardData.metaAccounts);
