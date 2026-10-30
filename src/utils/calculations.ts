import { BaseProduct, Recipe, UnitEconomicItem, MonthlyMetric } from '../data/initialData';
import { dailyRecords, DailyRecord } from '../data/dailyData';
import { TimePeriod, ChannelFilter } from '../context/DashboardContext';

/**
 * Calculations module for Auravedic Commerce Dashboard
 * Implements the official business formulas from the Context Handbook & Scope document
 */

export interface PnLBreakdown {
  grossSales: number;
  discounts: number;
  returns: number;
  netRevenue: number;
  cogs: number;
  shipping: number;
  marketplaceFees: number;
  adSpend: number;
  overheads: number;
  netContribution: number;
  contributionMarginPercent: number;
  dashboardProfit: number; // Pre-returns sales - ad spend
}

export function computeRealisticPnL(params: {
  shopifyGross: number;
  shopifyDiscounts: number;
  shopifyReturns: number;
  amazonPrincipal: number;
  amazonRefunds: number;
  amazonPromos: number;
  amazonFees: number;
  amazonBilledAds: number;
  shopifyUnits: number;
  amazonUnits: number;
  shopifyOrdersOver499: number;
  metaGoogleSpend: number;
  customCOGSPerUnit?: number;
  flatShippingRate?: number;
  overheads?: number;
}): PnLBreakdown {
  const cogsRate = params.customCOGSPerUnit ?? 125;
  const shippingRate = params.flatShippingRate ?? 65;
  const overheads = params.overheads ?? 0;

  // Store numbers
  const shopifyNet = params.shopifyGross - params.shopifyDiscounts - params.shopifyReturns;
  const storeCOGS = params.shopifyUnits * cogsRate;
  const storeShipping = params.shopifyOrdersOver499 * shippingRate;
  const storeAds = params.metaGoogleSpend;

  // Amazon numbers
  const amazonNet = params.amazonPrincipal - params.amazonRefunds - params.amazonPromos;
  const amazonCOGS = params.amazonUnits * cogsRate;
  const amazonFees = params.amazonFees;
  const amazonAds = params.amazonBilledAds;

  // Combined totals
  const grossSales = params.shopifyGross + params.amazonPrincipal;
  const discounts = params.shopifyDiscounts + params.amazonPromos;
  const returns = params.shopifyReturns + params.amazonRefunds;
  const netRevenue = shopifyNet + amazonNet;
  const totalCOGS = storeCOGS + amazonCOGS;
  const totalShipping = storeShipping;
  const totalMarketplaceFees = amazonFees;
  const totalAdSpend = storeAds + amazonAds;

  const netContribution = netRevenue - totalCOGS - totalShipping - totalMarketplaceFees - totalAdSpend - overheads;
  const contributionMarginPercent = netRevenue > 0 ? (netContribution / netRevenue) * 100 : 0;

  // Dashboard Basis Profit (Sales pre-returns minus Meta + Google ad spend)
  const dashboardProfit = (params.shopifyGross - params.shopifyDiscounts + params.amazonPrincipal) - params.metaGoogleSpend;

  return {
    grossSales,
    discounts,
    returns,
    netRevenue,
    cogs: totalCOGS,
    shipping: totalShipping,
    marketplaceFees: totalMarketplaceFees,
    adSpend: totalAdSpend,
    overheads,
    netContribution,
    contributionMarginPercent,
    dashboardProfit
  };
}

export interface FilteredMetrics {
  periodLabel: string;
  priorLabel: string;
  channelLabel: string;
  sales: number;
  priorSales: number;
  adSpend: number;
  priorAdSpend: number;
  mer: number;
  priorMer: number;
  orders: number;
  priorOrders: number;
  aov: number;
  priorAov: number;
  netProfit: number;
  priorNetProfit: number;
  marginPercent: number;
  priorMarginPercent: number;
  chartData: any[];
  isSingleDay: boolean;
  deltaSales: number;
  deltaAdSpend: number;
  deltaMer: number;
  deltaNetProfit: number;
  deltaOrders: number;
}

/**
 * Reactive calculation engine that computes real-time metrics for any Period and Channel selection
 */
export function getFilteredMetrics(
  period: TimePeriod,
  channel: ChannelFilter,
  cogsRate: number = 125,
  shippingRate: number = 65,
  monthlyPerformance: MonthlyMetric[] = []
): FilteredMetrics {
  const n = dailyRecords.length; // 60 days
  let currentSlice: DailyRecord[] = [];
  let priorSlice: DailyRecord[] = [];
  let periodLabel = 'MTD Oct 1–25';
  let priorLabel = 'Sep 1–25';
  let isSingleDay = false;

  switch (period) {
    case 'yesterday':
      // Index 59 is Oct 25 (Yesterday), Index 58 is Oct 24 (Day before)
      currentSlice = [dailyRecords[n - 1]];
      priorSlice = [dailyRecords[n - 2]];
      periodLabel = 'Yesterday (25 Oct 2026)';
      priorLabel = 'Prior Day (24 Oct)';
      isSingleDay = true;
      break;

    case '7d':
      // Last 7 days: 19 to 25 Oct (53 to 59), prior 7 days: 12 to 18 Oct (46 to 52)
      currentSlice = dailyRecords.slice(n - 7);
      priorSlice = dailyRecords.slice(n - 14, n - 7);
      periodLabel = 'Last 7 Days (19–25 Oct)';
      priorLabel = 'Prior 7 Days (12–18 Oct)';
      break;

    case '14d':
      // Last 14 days: 12 to 25 Oct (46 to 59), prior 14 days: 28 Sep to 11 Oct (32 to 45)
      currentSlice = dailyRecords.slice(n - 14);
      priorSlice = dailyRecords.slice(n - 28, n - 14);
      periodLabel = 'Last 14 Days (12–25 Oct)';
      priorLabel = 'Prior 14 Days (28 Sep–11 Oct)';
      break;

    case '30d':
      // Last 30 days: 26 Sep to 25 Oct (30 to 59), prior 30 days: 27 Aug to 25 Sep (0 to 29)
      currentSlice = dailyRecords.slice(n - 30);
      priorSlice = dailyRecords.slice(0, 30);
      periodLabel = 'Last 30 Days';
      priorLabel = 'Prior 30 Days';
      break;

    case 'all':
      // MoM History across all days
      currentSlice = dailyRecords;
      priorSlice = dailyRecords.slice(0, 30);
      periodLabel = '60-Day History (27 Aug–25 Oct)';
      priorLabel = 'Prior Period';
      break;

    case 'mtd':
    default:
      // Oct 1 to 25 (indices 35 to 59), Prior: Sep 1 to 25 (indices 5 to 29)
      currentSlice = dailyRecords.slice(35, 60);
      priorSlice = dailyRecords.slice(5, 30);
      periodLabel = 'MTD Oct 1–25, 2026';
      priorLabel = 'Sep 1–25, 2026';
      break;
  }

  // Channel extractor helper
  const extractChannelData = (slice: DailyRecord[]) => {
    let sales = 0;
    let adSpend = 0;
    let orders = 0;
    let cogs = 0;
    let shipping = 0;
    let fees = 0;

    slice.forEach(r => {
      if (channel === 'shopify') {
        sales += r.shopifyPreReturns;
        adSpend += (r.metaSpend + r.googleSpend);
        orders += r.shopifyOrders;
        cogs += r.shopifyOrders * 1.3 * cogsRate;
        shipping += (r.shopifyOrders * 0.8) * shippingRate;
        fees += 0;
      } else if (channel === 'amazon') {
        sales += r.amazonSales;
        adSpend += r.amazonBilledAds;
        orders += r.amazonOrders;
        cogs += r.amazonOrders * cogsRate;
        shipping += 0;
        fees += r.amazonFees;
      } else if (channel === 'flipkart') {
        sales += r.flipkartSales;
        adSpend += r.flipkartAds;
        orders += r.flipkartOrders;
        cogs += r.flipkartOrders * cogsRate;
        shipping += 0;
        fees += r.flipkartSales * 0.22;
      } else if (channel === 'nykaa') {
        sales += r.nykaaSales;
        adSpend += r.nykaaAds;
        orders += r.nykaaOrders;
        cogs += r.nykaaOrders * cogsRate;
        shipping += 0;
        fees += r.nykaaSales * 0.25;
      } else if (channel === 'myntra') {
        sales += r.myntraSales;
        adSpend += r.myntraAds;
        orders += r.myntraOrders;
        cogs += r.myntraOrders * cogsRate;
        shipping += 0;
        fees += r.myntraSales * 0.28;
      } else {
        // 'all' channels
        sales += (r.shopifyPreReturns + r.amazonSales);
        adSpend += (r.metaSpend + r.googleSpend);
        orders += (r.shopifyOrders + r.amazonOrders);
        cogs += (r.shopifyOrders * 1.3 + r.amazonOrders) * cogsRate;
        shipping += (r.shopifyOrders * 0.8) * shippingRate;
        fees += r.amazonFees;
      }
    });

    const mer = adSpend > 0 ? sales / adSpend : 0;
    const aov = orders > 0 ? sales / orders : 0;
    const netProfit = sales - cogs - shipping - fees - adSpend;
    const marginPercent = sales > 0 ? (netProfit / sales) * 100 : 0;

    return { sales, adSpend, orders, mer, aov, netProfit, marginPercent };
  };

  const curr = extractChannelData(currentSlice);
  const prev = extractChannelData(priorSlice);

  const channelLabelMap: Record<ChannelFilter, string> = {
    all: 'All Channels (Shopify + Amazon)',
    shopify: 'Shopify D2C Store',
    amazon: 'Amazon.in Seller Central',
    flipkart: 'Flipkart Seller Hub',
    nykaa: 'Nykaa Marketplace',
    myntra: 'Myntra Marketplace'
  };

  // Build daily chart series
  const chartData = currentSlice.map(r => {
    let daySales = 0;
    let daySpend = 0;
    if (channel === 'shopify') {
      daySales = r.shopifyPreReturns;
      daySpend = r.metaSpend + r.googleSpend;
    } else if (channel === 'amazon') {
      daySales = r.amazonSales;
      daySpend = r.amazonBilledAds;
    } else if (channel === 'flipkart') {
      daySales = r.flipkartSales;
      daySpend = r.flipkartAds;
    } else if (channel === 'nykaa') {
      daySales = r.nykaaSales;
      daySpend = r.nykaaAds;
    } else if (channel === 'myntra') {
      daySales = r.myntraSales;
      daySpend = r.myntraAds;
    } else {
      daySales = r.shopifyPreReturns + r.amazonSales;
      daySpend = r.metaSpend + r.googleSpend;
    }

    return {
      date: r.date.slice(5), // '10-25'
      fullDate: r.date,
      Sales: Math.round(daySales),
      AdSpend: Math.round(daySpend),
      SalesLakhs: Number((daySales / 100000).toFixed(2)),
      SpendLakhs: Number((daySpend / 100000).toFixed(2)),
      ShopifyLakhs: Number((r.shopifyPreReturns / 100000).toFixed(2)),
      AmazonLakhs: Number((r.amazonSales / 100000).toFixed(2)),
      FlipkartLakhs: Number((r.flipkartSales / 100000).toFixed(2)),
      MER: daySpend > 0 ? Number((daySales / daySpend).toFixed(2)) : 0
    };
  });

  const delta = (c: number, p: number) => (p > 0 ? ((c - p) / p) * 100 : 0);

  return {
    periodLabel,
    priorLabel,
    channelLabel: channelLabelMap[channel],
    sales: curr.sales,
    priorSales: prev.sales,
    adSpend: curr.adSpend,
    priorAdSpend: prev.adSpend,
    mer: curr.mer,
    priorMer: prev.mer,
    orders: curr.orders,
    priorOrders: prev.orders,
    aov: curr.aov,
    priorAov: prev.aov,
    netProfit: curr.netProfit,
    priorNetProfit: prev.netProfit,
    marginPercent: curr.marginPercent,
    priorMarginPercent: prev.marginPercent,
    chartData,
    isSingleDay,
    deltaSales: delta(curr.sales, prev.sales),
    deltaAdSpend: delta(curr.adSpend, prev.adSpend),
    deltaMer: delta(curr.mer, prev.mer),
    deltaNetProfit: delta(curr.netProfit, prev.netProfit),
    deltaOrders: delta(curr.orders, prev.orders)
  };
}

/**
 * Explodes finished listing sales into base product physical consumption
 */
export function explodeListingDemandToBaseProducts(
  listingSales: { code: string; units: number }[],
  recipes: Recipe[],
  baseProducts: BaseProduct[]
): Record<string, { baseKey: string; name: string; category: string; unitsDemanded: number; mrp: number }> {
  const result: Record<string, { baseKey: string; name: string; category: string; unitsDemanded: number; mrp: number }> = {};

  baseProducts.forEach(bp => {
    result[bp.key] = {
      baseKey: bp.key,
      name: bp.name,
      category: bp.category,
      unitsDemanded: 0,
      mrp: bp.mrp
    };
  });

  const recipeMap = new Map<string, Recipe>();
  recipes.forEach(r => recipeMap.set(r.code, r));

  listingSales.forEach(item => {
    const recipe = recipeMap.get(item.code);
    if (recipe) {
      Object.entries(recipe.parts).forEach(([baseKey, qty]) => {
        if (result[baseKey]) {
          result[baseKey].unitsDemanded += item.units * qty;
        } else {
          result[baseKey] = {
            baseKey,
            name: baseKey,
            category: 'Unclassified',
            unitsDemanded: item.units * qty,
            mrp: 500
          };
        }
      });
    } else {
      if (result[item.code]) {
        result[item.code].unitsDemanded += item.units;
      }
    }
  });

  return result;
}

/**
 * Calculates stock days of cover and status
 */
export function calculateDaysOfCover(stockInHand: number, dailyVelocity: number): {
  days: number;
  status: 'critical' | 'warning' | 'healthy';
  reorderUnits: number;
} {
  if (dailyVelocity <= 0) {
    return { days: 999, status: 'healthy', reorderUnits: 0 };
  }
  const days = Math.round((stockInHand / dailyVelocity) * 10) / 10;
  
  if (days < 7) {
    const targetDays = 45;
    const reorderUnits = Math.round(dailyVelocity * targetDays - stockInHand);
    return { days, status: 'critical', reorderUnits: Math.max(0, reorderUnits) };
  }
  
  if (days < 14) {
    const targetDays = 35;
    const reorderUnits = Math.round(dailyVelocity * targetDays - stockInHand);
    return { days, status: 'warning', reorderUnits: Math.max(0, reorderUnits) };
  }

  return { days, status: 'healthy', reorderUnits: 0 };
}
