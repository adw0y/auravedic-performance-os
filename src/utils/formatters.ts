/**
 * Formatting utilities for Auravedic Dashboard
 * Follows Indian numbering system (Lakhs, Crores, ₹) and standard business metrics
 */

export function formatINR(val: number | null | undefined, compact: boolean = false): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  
  if (compact) {
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 10000000) {
      return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
    }
    if (absVal >= 100000) {
      return `${sign}₹${(absVal / 100000).toFixed(2)}L`;
    }
    if (absVal >= 1000) {
      return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${absVal.toLocaleString('en-IN')}`;
  }

  // Standard Indian grouping: ₹12,34,567
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('en-IN');
}

export function formatPercent(val: number | null | undefined, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatROAS(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0.00x';
  return `${val.toFixed(2)}x`;
}

export function formatDelta(current: number, prior: number): { text: string; positive: boolean; neutral: boolean } {
  if (!prior || prior === 0) return { text: '0.0%', positive: true, neutral: true };
  const delta = ((current - prior) / prior) * 100;
  const positive = delta >= 0;
  return {
    text: `${positive ? '+' : ''}${delta.toFixed(1)}%`,
    positive,
    neutral: Math.abs(delta) < 0.1
  };
}
