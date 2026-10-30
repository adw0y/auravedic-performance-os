# -*- coding: utf-8 -*-
"""
Generate calibrated 60-day daily dataset (2026-08-27 to 2026-10-25)
Calibrated exactly to the Context Handbook monthly totals:
- Oct 1-25: Shopify 27.0L, Amazon 29.8L, Meta 15.4L, Google 3.7L, Shop Orders 5,773, Amz Orders 6,794
- Sep 1-25: Shopify 24.8L, Amazon 23.4L, Meta 14.2L, Google 3.3L, Shop Orders 4,989, Amz Orders 4,925
- Sep 26-30: Reconciles to Sep full totals (Shopify 30.0L, Amazon 28.4L, Ads 21.6L, Orders Shop 6065, Amz 5958)
"""

import datetime, os, json, math, random

from data_io import write_daily_ts

start_date = datetime.date(2026, 8, 27)
end_date = datetime.date(2026, 10, 25)

# Target sums
# Oct 1 to 25 (25 days)
oct_shopify_sales = 2700000
oct_amazon_sales = 2980000
oct_meta_spend = 1540000
oct_google_spend = 370000
oct_shopify_orders = 5773
oct_amazon_orders = 6794
oct_flipkart_sales = 1250000
oct_flipkart_orders = 2850
oct_flipkart_ads = 215000
oct_nykaa_sales = 320000
oct_nykaa_orders = 520
oct_nykaa_ads = 31000
oct_myntra_sales = 155000
oct_myntra_orders = 260
oct_myntra_ads = 5800

# Sep 1 to 25 (25 days)
sep25_shopify_sales = 2480000
sep25_amazon_sales = 2340000
sep25_meta_spend = 1420000
sep25_google_spend = 330000
sep25_shopify_orders = 4989
sep25_amazon_orders = 4925
sep25_flipkart_sales = 950000
sep25_flipkart_orders = 2200
sep25_flipkart_ads = 190000
sep25_nykaa_sales = 280000
sep25_nykaa_orders = 460
sep25_nykaa_ads = 28000
sep25_myntra_sales = 135000
sep25_myntra_orders = 230
sep25_myntra_ads = 5200

# Sep 26 to 30 (5 days)
sep_rem_shopify_sales = 3000000 - sep25_shopify_sales
sep_rem_amazon_sales = 2840000 - sep25_amazon_sales
sep_rem_meta_spend = 1780000 - sep25_meta_spend
sep_rem_google_spend = 380000 - sep25_google_spend
sep_rem_shopify_orders = 6065 - sep25_shopify_orders
sep_rem_amazon_orders = 5958 - sep25_amazon_orders

# Aug 27 to 31 (5 days)
aug_rem_shopify_sales = 380000
aug_rem_amazon_sales = 520000
aug_rem_meta_spend = 220000
aug_rem_google_spend = 55000
aug_rem_shopify_orders = 720
aug_rem_amazon_orders = 1080

def distribute(total, count, variance=0.15, is_int=False):
    base = total / count
    weights = []
    for i in range(count):
        # weekly cycle: weekends slightly higher
        day_mod = 1.05 if (i % 7 in [5, 6]) else (0.95 if (i % 7 in [1, 2]) else 1.0)
        # smooth slight variation
        pseudo_rand = 1.0 + (variance * ((i * 13 % 17) - 8) / 10.0)
        weights.append(day_mod * pseudo_rand)
    sum_w = sum(weights)
    vals = [(w / sum_w) * total for w in weights]
    if is_int:
        int_vals = [int(round(v)) for v in vals]
        diff = total - sum(int_vals)
        int_vals[-1] += diff
        return int_vals
    else:
        diff = total - sum(vals)
        vals[-1] += diff
        return [round(v, 2) for v in vals]

oct_shop_s = distribute(oct_shopify_sales, 25)
oct_amz_s = distribute(oct_amazon_sales, 25)
oct_meta_sp = distribute(oct_meta_spend, 25)
oct_goog_sp = distribute(oct_google_spend, 25)
oct_shop_o = distribute(oct_shopify_orders, 25, is_int=True)
oct_amz_o = distribute(oct_amazon_orders, 25, is_int=True)
oct_fk_s = distribute(oct_flipkart_sales, 25)
oct_fk_o = distribute(oct_flipkart_orders, 25, is_int=True)
oct_fk_a = distribute(oct_flipkart_ads, 25)
oct_nyk_s = distribute(oct_nykaa_sales, 25)
oct_nyk_o = distribute(oct_nykaa_orders, 25, is_int=True)
oct_nyk_a = distribute(oct_nykaa_ads, 25)
oct_myn_s = distribute(oct_myntra_sales, 25)
oct_myn_o = distribute(oct_myntra_orders, 25, is_int=True)
oct_myn_a = distribute(oct_myntra_ads, 25)

sep25_shop_s = distribute(sep25_shopify_sales, 25)
sep25_amz_s = distribute(sep25_amazon_sales, 25)
sep25_meta_sp = distribute(sep25_meta_spend, 25)
sep25_goog_sp = distribute(sep25_google_spend, 25)
sep25_shop_o = distribute(sep25_shopify_orders, 25, is_int=True)
sep25_amz_o = distribute(sep25_amazon_orders, 25, is_int=True)
sep25_fk_s = distribute(sep25_flipkart_sales, 25)
sep25_fk_o = distribute(sep25_flipkart_orders, 25, is_int=True)
sep25_fk_a = distribute(sep25_flipkart_ads, 25)
sep25_nyk_s = distribute(sep25_nykaa_sales, 25)
sep25_nyk_o = distribute(sep25_nykaa_orders, 25, is_int=True)
sep25_nyk_a = distribute(sep25_nykaa_ads, 25)
sep25_myn_s = distribute(sep25_myntra_sales, 25)
sep25_myn_o = distribute(sep25_myntra_orders, 25, is_int=True)
sep25_myn_a = distribute(sep25_myntra_ads, 25)

sep_rem_shop_s = distribute(sep_rem_shopify_sales, 5)
sep_rem_amz_s = distribute(sep_rem_amazon_sales, 5)
sep_rem_meta_sp = distribute(sep_rem_meta_spend, 5)
sep_rem_goog_sp = distribute(sep_rem_google_spend, 5)
sep_rem_shop_o = distribute(sep_rem_shopify_orders, 5, is_int=True)
sep_rem_amz_o = distribute(sep_rem_amazon_orders, 5, is_int=True)

aug_shop_s = distribute(aug_rem_shopify_sales, 5)
aug_amz_s = distribute(aug_rem_amazon_sales, 5)
aug_meta_sp = distribute(aug_rem_meta_spend, 5)
aug_goog_sp = distribute(aug_rem_google_spend, 5)
aug_shop_o = distribute(aug_rem_shopify_orders, 5, is_int=True)
aug_amz_o = distribute(aug_rem_amazon_orders, 5, is_int=True)

daily_rows = []

current_d = start_date
day_idx = 0

while current_d <= end_date:
    d_str = current_d.strftime("%Y-%m-%d")
    
    if current_d.month == 8:
        i = current_d.day - 27
        s_s, a_s = aug_shop_s[i], aug_amz_s[i]
        m_sp, g_sp = aug_meta_sp[i], aug_goog_sp[i]
        s_o, a_o = aug_shop_o[i], aug_amz_o[i]
        fk_s, fk_o, fk_a = s_s * 0.4, int(s_o * 0.4), m_sp * 0.12
        nyk_s, nyk_o, nyk_a = s_s * 0.12, int(s_o * 0.08), m_sp * 0.02
        myn_s, myn_o, myn_a = s_s * 0.06, int(s_o * 0.04), m_sp * 0.005
    elif current_d.month == 9 and current_d.day <= 25:
        i = current_d.day - 1
        s_s, a_s = sep25_shop_s[i], sep25_amz_s[i]
        m_sp, g_sp = sep25_meta_sp[i], sep25_goog_sp[i]
        s_o, a_o = sep25_shop_o[i], sep25_amz_o[i]
        fk_s, fk_o, fk_a = sep25_fk_s[i], sep25_fk_o[i], sep25_fk_a[i]
        nyk_s, nyk_o, nyk_a = sep25_nyk_s[i], sep25_nyk_o[i], sep25_nyk_a[i]
        myn_s, myn_o, myn_a = sep25_myn_s[i], sep25_myn_o[i], sep25_myn_a[i]
    elif current_d.month == 9 and current_d.day > 25:
        i = current_d.day - 26
        s_s, a_s = sep_rem_shop_s[i], sep_rem_amz_s[i]
        m_sp, g_sp = sep_rem_meta_sp[i], sep_rem_goog_sp[i]
        s_o, a_o = sep_rem_shop_o[i], sep_rem_amz_o[i]
        fk_s, fk_o, fk_a = s_s * 0.4, int(s_o * 0.4), m_sp * 0.12
        nyk_s, nyk_o, nyk_a = s_s * 0.12, int(s_o * 0.08), m_sp * 0.02
        myn_s, myn_o, myn_a = s_s * 0.06, int(s_o * 0.04), m_sp * 0.005
    else: # October
        i = current_d.day - 1
        s_s, a_s = oct_shop_s[i], oct_amz_s[i]
        m_sp, g_sp = oct_meta_sp[i], oct_goog_sp[i]
        s_o, a_o = oct_shop_o[i], oct_amz_o[i]
        fk_s, fk_o, fk_a = oct_fk_s[i], oct_fk_o[i], oct_fk_a[i]
        nyk_s, nyk_o, nyk_a = oct_nyk_s[i], oct_nyk_o[i], oct_nyk_a[i]
        myn_s, myn_o, myn_a = oct_myn_s[i], oct_myn_o[i], oct_myn_a[i]

    # Discounts & Returns
    # Headline Shopify Sales = Gross - Discounts = s_s
    discounts = round(s_s * 0.08, 2)
    gross = round(s_s + discounts, 2)
    returns = round(s_s * 0.09, 2)
    net = round(s_s - returns, 2)

    # Amazon Fees & Ads
    amz_fees = round(a_s * 0.272, 2)
    amz_billed_ads = round(a_s * 0.275, 2)
    amz_refunds = round(a_s * 0.048, 2)

    # Meta purchases & purchase value
    meta_purchases = int(round(m_sp / 560.0))
    meta_purchase_val = round(m_sp * 1.87, 2)

    # Google conversions & value
    goog_conv = round(g_sp / 850.0, 1)
    goog_conv_val = round(g_sp * 2.56, 2)

    row = {
        "date": d_str,
        "shopifyGross": gross,
        "shopifyDiscounts": discounts,
        "shopifyPreReturns": s_s,
        "shopifyReturns": returns,
        "shopifyNet": net,
        "shopifyOrders": s_o,
        "amazonSales": a_s,
        "amazonOrders": a_o,
        "amazonRefunds": amz_refunds,
        "amazonFees": amz_fees,
        "amazonBilledAds": amz_billed_ads,
        "flipkartSales": round(fk_s, 2),
        "flipkartOrders": int(fk_o),
        "flipkartAds": round(fk_a, 2),
        "nykaaSales": round(nyk_s, 2),
        "nykaaOrders": int(nyk_o),
        "nykaaAds": round(nyk_a, 2),
        "myntraSales": round(myn_s, 2),
        "myntraOrders": int(myn_o),
        "myntraAds": round(myn_a, 2),
        "metaSpend": m_sp,
        "metaPurchases": meta_purchases,
        "metaPurchaseValue": meta_purchase_val,
        "googleSpend": g_sp,
        "googleConversions": goog_conv,
        "googleConversionValue": goog_conv_val,
        "totalAdsIncluded": round(m_sp + g_sp, 2),
        "totalSales": round(s_s + a_s, 2),
        "salesPerRupeeAd": round((s_s + a_s) / (m_sp + g_sp), 2)
    }
    daily_rows.append(row)
    current_d += datetime.timedelta(days=1)

# ---------------------------------------------------------------------------
# Day-to-day variance on the ad side.
# The sales-side series above already move day to day, but spend was derived from
# sales at a fixed ratio, so ROAS / MER came out identical on every day of a month.
# Real ad platforms don't behave like that, so give spend, purchase value and
# purchases their own seeded noise (smooth day to day, with a couple of bad days),
# then rescale inside each calendar block so every block total is unchanged:
# monthly spend, ROAS and the handbook benchmarks stay exactly as calibrated.
# ---------------------------------------------------------------------------
rng = random.Random(20261030)

# (first row, last row + 1, Meta ROAS, Google ROAS): Aug 27-31, Sep 1-25, Sep 26-30, Oct 1-25.
# ROAS targets are the handbook's monthly platform ROAS (Aug 1.65 / 2.25, Sep 1.76 / 2.12,
# Oct 1-25 1.87 / 2.56), so the daily series agrees with the monthly figures.
BLOCKS = [(0, 5, 1.65, 2.25), (5, 30, 1.76, 2.12), (30, 35, 1.76, 2.12), (35, 60, 1.87, 2.56)]

def ar_noise(n, sigma, rho=0.35, shocks=0, shock_factor=0.8):
    """Multiplicative noise, lightly autocorrelated, with `shocks` randomly placed bad days."""
    out, prev = [], 0.0
    for _ in range(n):
        prev = rho * prev + rng.gauss(0, sigma)
        out.append(math.exp(prev))
    for idx in rng.sample(range(n), min(shocks, n)):
        out[idx] *= shock_factor
    return out

def rescale(values, target, ndigits=2):
    total = sum(values)
    scaled = [v * target / total for v in values] if total else list(values)
    out = [round(v, ndigits) for v in scaled]
    out[-1] = round(out[-1] + (target - sum(out)), ndigits)
    return out

def rescale_int(values, target):
    total = sum(values)
    scaled = [v * target / total for v in values] if total else list(values)
    out = [int(round(v)) for v in scaled]
    out[scaled.index(max(scaled))] += target - sum(out)
    return out

for lo, hi, meta_roas_target, google_roas_target in BLOCKS:
    rows = daily_rows[lo:hi]
    n = hi - lo

    def block_sum(key):
        return sum(r[key] for r in rows)

    # Meta: spend paces around its old shape; value = spend x a noisy daily ROAS;
    # purchases = value / a noisy daily order value.
    meta_sp = rescale([r["metaSpend"] * f for r, f in zip(rows, ar_noise(n, 0.09))], block_sum("metaSpend"))
    meta_val = rescale([sp * f for sp, f in zip(meta_sp, ar_noise(n, 0.11, shocks=2, shock_factor=0.78))],
                       round(block_sum("metaSpend") * meta_roas_target, 2))
    meta_pur = rescale_int([v / f for v, f in zip(meta_val, ar_noise(n, 0.06))], int(block_sum("metaPurchases")))

    # Google: noisier ROAS than Meta, fractional conversions.
    goog_sp = rescale([r["googleSpend"] * f for r, f in zip(rows, ar_noise(n, 0.14))], block_sum("googleSpend"))
    goog_val = rescale([sp * f for sp, f in zip(goog_sp, ar_noise(n, 0.18, shocks=2, shock_factor=0.7))],
                       round(block_sum("googleSpend") * google_roas_target, 2))
    goog_conv = rescale([v / f for v, f in zip(goog_val, ar_noise(n, 0.12))], block_sum("googleConversions"), 1)

    # Marketplace ads
    amz_ads = rescale([r["amazonBilledAds"] * f for r, f in zip(rows, ar_noise(n, 0.12))], block_sum("amazonBilledAds"))
    fk_ads = rescale([r["flipkartAds"] * f for r, f in zip(rows, ar_noise(n, 0.15))], block_sum("flipkartAds"))
    nyk_ads = rescale([r["nykaaAds"] * f for r, f in zip(rows, ar_noise(n, 0.15))], block_sum("nykaaAds"))
    myn_ads = rescale([r["myntraAds"] * f for r, f in zip(rows, ar_noise(n, 0.15))], block_sum("myntraAds"))

    for i, r in enumerate(rows):
        r["metaSpend"], r["metaPurchaseValue"], r["metaPurchases"] = meta_sp[i], meta_val[i], meta_pur[i]
        r["googleSpend"], r["googleConversionValue"], r["googleConversions"] = goog_sp[i], goog_val[i], goog_conv[i]
        r["amazonBilledAds"], r["flipkartAds"] = amz_ads[i], fk_ads[i]
        r["nykaaAds"], r["myntraAds"] = nyk_ads[i], myn_ads[i]
        r["totalAdsIncluded"] = round(r["metaSpend"] + r["googleSpend"], 2)
        r["salesPerRupeeAd"] = round(r["totalSales"] / r["totalAdsIncluded"], 2)

print(f"Generated {len(daily_rows)} rows.")

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'data', 'dailyData.ts')
write_daily_ts(daily_rows, out_path)

print("Saved dailyData.ts successfully.")
