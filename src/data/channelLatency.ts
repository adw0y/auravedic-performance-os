import type { ChannelFilter } from '../context/DashboardContext';

/**
 * How stale each data source normally is, taken from the pipeline cadences in the
 * Context Handbook (§2.4 scheduled tasks, §5 source notes). Badges resolve their
 * latency from this table, so it follows the channel on screen instead of being
 * one fixed string.
 */
export type LatencySourceKey =
  | 'shopify'
  | 'meta'
  | 'google'
  | 'amazonSales'
  | 'amazonSettlement'
  | 'flipkart'
  | 'nykaa'
  | 'myntra'
  | 'warehouse'
  | 'callChase'
  | 'browser'
  | 'reference';

export interface LatencySource {
  label: string;
  latency: string;
  /** Matched against the lower-cased source/pipeline text of a badge. */
  match: RegExp;
}

// Task #9 pulls "yesterday" from Windsor (Meta, Google) and Shopify at 04:51 IST.
const DAILY_PULL = 'T-1 (loads ~04:51 IST)';

// Declaration order is the display order.
export const LATENCY_SOURCES: Record<LatencySourceKey, LatencySource> = {
  shopify: { label: 'Shopify', latency: DAILY_PULL, match: /shopify/ },
  meta: { label: 'Meta', latency: DAILY_PULL, match: /\bmeta\b|facebook|instagram/ },
  google: { label: 'Google Ads', latency: DAILY_PULL, match: /google/ },
  amazonSales: {
    label: 'Amazon sales',
    latency: '1–2d behind (Amazon report lag)',
    match: /sp-api|seller central|amazon fba|business report|sales & traffic|amazon ordered/
  },
  amazonSettlement: {
    label: 'Amazon settlement & ads',
    latency: '1–2d behind · pre-13 Oct estimated',
    match: /settlement|billed ads|amazon ads/
  },
  flipkart: {
    label: 'Flipkart',
    latency: 'Orders daily (09:40 IST) · ads & stock weekly',
    match: /flipkart/
  },
  nykaa: { label: 'Nykaa', latency: 'Manual report upload · no API feed', match: /nykaa/ },
  myntra: { label: 'Myntra', latency: 'Manual report upload · no API feed', match: /myntra/ },
  warehouse: { label: 'Warehouse', latency: 'Nightly 23:00 IST (Mon–Sat)', match: /warehouse|inventory-wh/ },
  callChase: {
    label: 'Call & Chase',
    latency: '07:00 & 17:29 IST daily',
    match: /call & chase|courier remittance/
  },
  browser: { label: 'Upload', latency: 'Instant · parsed in-browser', match: /client-side parser|papaparse/ },
  reference: {
    label: 'Reference data',
    latency: 'Static · updated on edit',
    match: /recipe|registry|combo formulas|constants|handbook|master sheet/
  }
};

/**
 * Sources that feed each channel's numbers. 'all' is Shopify + Amazon, which is what
 * the combined totals contain (Flipkart is shown separately, never summed in).
 */
export const CHANNEL_LATENCY_SOURCES: Record<ChannelFilter, LatencySourceKey[]> = {
  all: ['shopify', 'meta', 'google', 'amazonSales', 'amazonSettlement'],
  shopify: ['shopify', 'meta', 'google'],
  amazon: ['amazonSales', 'amazonSettlement'],
  flipkart: ['flipkart'],
  nykaa: ['nykaa'],
  myntra: ['myntra']
};

export interface LatencyGroup {
  labels: string[];
  latency: string;
}

/**
 * Latency for a channel (when the view is channel-scoped) or for whatever sources a
 * badge's text names. Sources with identical latency are merged into one group.
 */
export function resolveLatency(opts: { channel?: ChannelFilter; text?: string }): LatencyGroup[] {
  const keys: LatencySourceKey[] = opts.channel
    ? CHANNEL_LATENCY_SOURCES[opts.channel]
    : (Object.keys(LATENCY_SOURCES) as LatencySourceKey[]).filter(k =>
        LATENCY_SOURCES[k].match.test((opts.text ?? '').toLowerCase())
      );

  const groups: LatencyGroup[] = [];
  for (const key of keys) {
    const { label, latency } = LATENCY_SOURCES[key];
    const existing = groups.find(g => g.latency === latency);
    if (existing) existing.labels.push(label);
    else groups.push({ labels: [label], latency });
  }
  return groups;
}
