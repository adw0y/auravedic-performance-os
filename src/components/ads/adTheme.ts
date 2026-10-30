import type { PlatformKey } from '../../utils/adsAnalytics';

/**
 * Platform colours, in stacking order. Validated with the dataviz palette validator on a white
 * surface (adjacent pairs: worst CVD ΔE 9.1, worst normal-vision ΔE 19.6). Order matters: it is
 * what keeps neighbouring segments distinguishable, so keep Meta → Amazon → Google → Flipkart.
 * Several of these sit under 3:1 contrast on white, so every chart ships a visible legend and a
 * table view instead of relying on colour alone.
 */
export const PLATFORM_ORDER: PlatformKey[] = ['meta', 'amazon', 'google', 'flipkart'];

export const PLATFORM_COLOR: Record<PlatformKey, string> = {
  meta: '#e87ba4',
  amazon: '#eda100',
  google: '#1baf7a',
  flipkart: '#2a78d6'
};

export const PLATFORM_NAME: Record<PlatformKey, string> = {
  meta: 'Meta',
  amazon: 'Amazon Ads',
  google: 'Google Ads',
  flipkart: 'Flipkart Ads'
};

// Chart chrome: recessive, solid hairlines (never dashed grids)
export const CHROME = {
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  surface: '#ffffff'
};

// Status colours are reserved for meaning (good / bad); always paired with an icon + label
export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b'
};

/** Compact rupee tick: ₹50k, ₹1.5L */
export const compactINR = (v: number) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1).replace(/\.0$/, '')}L`
    : v >= 1000
      ? `₹${Math.round(v / 1000)}k`
      : `₹${Math.round(v)}`;
