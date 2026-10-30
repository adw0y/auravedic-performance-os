# Auravedic Dashboard: Context Handbook

**Purpose:** everything a person (or an AI agent) needs to work on Auravedic's performance dashboards with no prior context.
**Last updated:** 30 October 2026
**Read with:** `Auravedic_External_Dashboard_Scope.md` (what we're building next)

> **Golden rules (read first)**
> 1. **Read-only on ad accounts and the store.** Never change anything in Meta, Google Ads, Amazon, Flipkart or Shopify from a dashboard job. Windsor write actions are off-limits unless the owner explicitly asks.
> 2. **No personal data** in any dashboard, sheet or Slack post: no customer names, phones, emails or addresses. Order numbers, states and pincodes are fine. (The one existing exception, phone numbers in the Call & Chase duplicate-order card, is scoped to that ops page only.)
> 3. **Always say what's included.** Every ad-spend or "sales per ₹1 of ads" figure must state which platforms it counts. Today that is **Meta + Google only. Amazon Ads is NOT included.**
> 4. **Label estimates.** Flipkart rupee value, Amazon settlement days before 13 Oct, and all COGS figures are estimates or assumptions. Say so wherever they appear.
> 5. **Don't touch existing Windsor connections or scheduled tasks** when building new things. Add alongside them.

---

## 1. About Auravedic

| | |
|---|---|
| **What it is** | Indian D2C Ayurvedic skincare and haircare brand. "Modern science + traditional Ayurveda". |
| **Founded** | 2012. Claims 100K+ customers. |
| **Website / store** | auravedic.com (Shopify store "AURAVEDIC", currency INR, timezone IST) |
| **Hero product** | **Kumkumadi Tailam / Kumkumadi Oil 100ml** (saffron face oil). Most combos are built around it. The site shows 219 reviews at 5.0 for the Tailam. |
| **Other key lines** | Kumkumadi range: night cream (50g, with 0.25% retinol), gel, cream, serum, toner, face wash, mask, sleep mask, ubtan, under-eye cream, body massage oil. Also Nalpamaradi Thailam, Skin Brightening Oil, Vitamin C oil and cream, De-tan cream, Pigmentation serum, Tea tree acne range, sunscreens. Hair: Onion Hair Oil, Rosemary Hair Oil, Rosemary mist and shampoo, Hair Growth Serum, Hairfall Control Shampoo, Hair Mask. |
| **Price band** | About ₹350–₹1,400 per product (store range seen: ₹360–₹1,225). Night cream ₹585 (MRP ₹650). |
| **Catalogue size** | About 154 Shopify products (many are combos). 43 base products (Appendix B). |
| **Positioning and customer** | Concern-led: pigmentation, dark spots, dullness, tan, acne, anti-ageing, hair fall. Core buyer: urban Indian woman, 25–40, metro or Tier-1, ingredient-literate, comparing against Kama Ayurveda, Forest Essentials, Minimalist, Dot & Key. |
| **Competitors tracked** (SwipeKit ad library) | Indulekha, Shesha Ayurveda, Nat Habit, Pilgrim, WishCare |
| **Offers seen** | Free shipping above ₹499. A free-toner threshold at ₹1,200 (on the product page). Festive combos ("Festive Ritual" variants). |

### 1.1 Sales channels

| Channel | Status | Notes |
|---|---|---|
| **Shopify** (auravedic.com) | Live, main D2C | COD and prepaid. Ships from CBE (South India) and Mumbai (rest of India). |
| **Amazon.in** | Live, the biggest single channel until mid-2026 | Seller account A3OEY3JP0PGBDE-IN. Uses FBA (inventory reports exist). |
| **Flipkart** | Live | FBF and non-FBF. Data arrives as reports posted in Slack. |
| **Nykaa** | Probably live; **confirm** | An SKU map for Nykaa exists in the "Monthly inventory calculations and tracking" sheet. |
| Others (Myntra, Meesho, quick-commerce) | Unknown | Confirm with the owner. |

### 1.2 Operations

- **Warehouses:** CBE (Coimbatore) and Mumbai. Palakkad looks like the factory that dispatches to both (unconfirmed reading). South India orders (TN, KA, KL, AP, TS, PY) ship from CBE; the rest ship from Mumbai.
- **Stock terms (CBE):** SIH = stock in hand. D2C Avl = what Shopify can sell. BLK-RSRV = reserved for bulk, never counted as sellable. SIH = D2C Avl + BLK-RSRV.
- **Combos** consume their component base products. The recipes are in the stock desk (Appendix C).
- **COD risk:** high-RTO states flagged by ops are AS, WB, BR, RJ, JK. Couriers seen: ShypBuddy (aggregator), BlueDart, Delhivery, XpressBees, Ekart, Amazon TS, DTDC, India Post.

---

## 2. Tools, accounts and connections

### 2.1 Connectors available to Claude

| Connector | Used for | Notes |
|---|---|---|
| **Windsor.ai** (Basic plan, paid) | Meta Ads, Google Ads, Amazon Seller Central | **Read only.** It has write actions, which must never be used without explicit owner approval. |
| **Shopify** | Store sales, orders, sessions, products, inventory | Read only. Analytics query language (ShopifyQL-style `FROM sales SHOW … TIMESERIES day SINCE … UNTIL …`). |
| **Slack** | Report intake and posting summaries | See channels in 2.4 |
| **Google Drive** | Sheets (inventory, master order sheet mirror) | |
| **Helio / YourLIo** | AI chat agent analytics (WhatsApp, Instagram, site chat) | AI-attributed revenue, conversations, objections. **Not** total store revenue. |
| **SwipeKit** | Competitor ad library | Qualitative |
| Gmail, ClickUp | Daily summary email, task tracking | |

### 2.2 Windsor connected accounts

| Windsor connector | Account | ID | In reports? |
|---|---|---|---|
| `facebook` (Meta Ads) | New26 | 1274462564675838 | Yes |
| | Auravedic Internal | 636601780205220 | Yes |
| | MP2 | 1506928486493862 | Yes |
| | Auravedic GC | 1030922277728502 | Yes |
| | Fresh Pixel | 434037959170111 | Yes |
| | Auravedic Admin | 100149933695451 | **No, always excluded** |
| `google_ads` | Auravedic | 318-241-3276 | Yes |
| `amazon_sp` (Seller Central) | Amazon.in seller | A3OEY3JP0PGBDE-IN | Yes |
| `amazon_ads` | Profile 1844743165607135 | — | **Not connected.** An old cache task for it is deactivated. |

**Windsor cache tasks already running daily** (auto-created by Windsor; leave them alone). Each pre-caches one Amazon SP report:
Sales & Traffic by date · Sales & Traffic by ASIN (child) · All orders by order date · FBA inventory planning · Unsuppressed inventory (MYI) · Merchant listings (all) · Settlement report v2 (flat file). Restock recommendations and the Amazon Ads sponsored-products cache are deactivated.

**Windsor destinations available** (none set up yet): Google Sheets, Airtable, BigQuery, Snowflake, MySQL, PostgreSQL, Supabase, Azure SQL, Redshift, Databricks, Windsor Cloud DB, S3, Azure Blob. They are set up in Windsor's own dashboard (not from chat). Google Sheets needs a sheet ID and a tab name, with a schedule of 15 minutes, 30 minutes, hourly or daily. Adding a destination does **not** remove or change anything existing.

**Windsor does not support** Flipkart, Nykaa, Myntra, Meesho or quick-commerce. Those need report uploads.

### 2.3 Claude dashboards (artifacts) in the ecosystem

| Dashboard | Link | What it is | Updated by |
|---|---|---|---|
| **Auravedic cross-channel performance** (this project) | https://claude.ai/artifact/WfBQEuGmUPLQHMVf9mZXHR | Meta + Google + Shopify + Amazon (+ Flipkart, estimated). P&Ls, products, freshness. | Manual Claude sessions (snapshot to 25 Oct for core data; Flipkart to 29 Oct) |
| Daily Meta & Google ads report | https://claude.ai/artifact/QriS4b1yTU2HEUhdCcS3aL | Day-by-day database of ads + Shopify, campaign / ad set / ad level, COGS / shipping P&L | Scheduled task #9 (04:51 IST daily) |
| Meta ads: winners and losers | https://claude.ai/artifact/FjsQe1Smziy1BieB7baQCD | 6-month rolling Meta ad-level view, weekly log of new / stopped / improved ad sets | Weekly Meta refresh (Mon 03:54 IST) |
| Auravedic on Flipkart: Marketplace Report | https://claude.ai/artifact/4i9TyJwPFSQs3cDXFa7bdt | Flipkart orders, sales, ads, FBF stock, report checklist | Scheduled task #16 (09:40 IST daily) |
| Stock desk (WH Inventory Desk) | https://claude.ai/artifact/4JjNtSFcd4Yk9DT4q94MGg | Warehouse stock, SKU mappings, combo recipes (`kit/build.py`) | Scheduled task #7 (23:00 IST, Mon–Sat) |
| Call & Chase ops | https://claude.ai/artifact/JCeBMGaRXoQeoNCVgwTiDa | COD call queue, undelivered chase list, duplicate orders, desk SLA flags | Tasks #10 (07:00) and #8 (17:29) |

### 2.4 Scheduled tasks (all run unattended, all read-only on ad accounts and the store)

| # | Name | When (IST) | What it does |
|---|---|---|---|
| #9 | Meta & Google Ads daily report | 04:51 daily | Pulls yesterday from Windsor and Shopify, writes one day-document, rewrites the narrative, posts to #aura-daily-reports |
| #10 | Call & Chase ops refresh | 07:00 daily | Rebuilds the COD queue and chase list, posts to #calling-desk |
| #16 | Flipkart reports daily check | 09:40 daily | Reads #flipkart-reports, loads new reports, posts a checklist |
| #8 | Call & Chase closure recap | 17:29 daily | Evening delta on the morning queues |
| #7 | WH Inventory Desk | 23:00 Mon–Sat | Reads warehouse screenshots, rebuilds the stock desk, posts anomalies |
| — | Weekly Meta ads refresh | Mon 03:54 | Refreshes the winners and losers dashboard |

Other tasks exist (for example a daily Gmail summary at 09:00 and the Amazon daily check). List them with the scheduling tools before adding new ones, so nothing is duplicated.

### 2.5 Slack channels

| Channel | ID | Use |
|---|---|---|
| #aura-daily-reports | C0C3KUA4G3G | Daily ads report summary |
| #flipkart-reports | C0CD21J6SLE | Flipkart reports are posted here (orders, sales, inventory, ads) |
| #inventory-wh-movement | C0C6TMB60QN | Warehouse stock screenshots (Mumbai closing stock, CBE D2C Avl / BLK-RSRV / SIH) |
| #calling-desk | C0C2P3PLE4F | COD calling and delivery chase |

---

## 3. The cross-channel dashboard (current build)

**Link:** https://claude.ai/artifact/WfBQEuGmUPLQHMVf9mZXHR
**Type:** Claude "Dashboard" artifact. The page is `files/index.html` (about 200 KB) inside the artifact's own store. Data is in documents `datasets/<id>`, each pointing to an attached JSON file (`/_blob/<id>`). It is edited with the ArtifactData tool, never by publishing a file.
**State:** snapshot. Core data runs to **25 Oct 2026**, Flipkart to **29 Oct 2026**. It does not refresh itself; every source is a fixed attached file.

### 3.1 Page sections

1. Header with coverage badges: "Amazon Ads: NOT included", "Flipkart shown separately".
2. View switcher: **Yesterday, 7, 14 and 30 days, Month on month**. Each view compares with the period of the same length before it.
3. **Executive summary:** a headline, five findings and up to three actions, generated from the data.
4. **Overall P&L, dashboard basis** and **Realistic P&L** (see Section 7).
5. Channel cards (Meta, Google, Shopify, Amazon) and the channel scorecard (with two labelled Flipkart rows).
6. Meta by ad account.
7. Daily sales and ad spend chart, and 7-day rolling return on ad spend.
8. Product performance (product filter), and **Product groups**: everything that contains a selected base product, through the recipes.
9. Flipkart section: by period, top products, month on month, Ads reports.
10. Sales and ad spend by month, return on ad spend by month.
11. Days with large store reversals.
12. Data freshness checklist, reports still needed, data notes, "How to read this".

### 3.2 Calculations in the page (`dash.calc` ids)

`days` (daily totals by channel) · `periods` (Yesterday / 7 / 14 / 30 days) · `channels` (scorecard) · `accounts` (Meta by account) · `flags` (reversal days) · `months` · `execsum` · `pnl`, `pnl_lines`, `pnl_months` · `product_rows`, `group_lines`, `group_rows` · `latest` · `fk_periods`, `fk_top`, `fk_months`, `fk_ads` · `freshness_base`

### 3.3 Datasets (22)

| id | Content | Source / how it was pulled | Period |
|---|---|---|---|
| `meta_daily` | Spend, purchases, purchase value per Meta account per day | Windsor `facebook`: fields account_name, date, spend, actions_purchase, action_values_purchase; 5 accounts | 27 Aug – 25 Oct |
| `google_daily` | Spend, conversions, conversion value per day | Windsor `google_ads`: date, spend, conversions, conversions_value | 27 Aug – 25 Oct |
| `shopify_daily` | Orders, gross sales, discounts, net sales, total sales | Shopify `FROM sales SHOW orders, gross_sales, discounts, net_sales, total_sales TIMESERIES day` | 27 Aug – 25 Oct |
| `amazon_daily` | Ordered product sales, units, order items, units refunded | Windsor `amazon_sp` Sales & Traffic by date (`sales_and_traffic_report_by_date__salesbydate_*`) | 27 Aug – 25 Oct |
| `amazon_settle` | Daily principal, refunds, promos, shipping net, fees, GST on fees, billed ads, fee adjustments | Windsor `amazon_sp` settlement v2 (`v2_settlement_report_data_flat_file_v2__*`) | **13 – 25 Oct only** |
| `monthly` | Month totals by channel, plus a 1–25 Sep like-for-like row | Daily pulls summed from 1 Apr; Shopify monthly report | Apr – 25 Oct |
| `shop_costs_daily` / `shop_costs_monthly` | Units sold and orders over ₹499 | Shopify analytics | Daily: 60 days; monthly: Apr – Oct |
| `assumptions` | COGS ₹125 per unit, shipping ₹65 per order, threshold ₹499, Amazon COGS ₹125 | From the daily ads report (set 12 Oct 2026) | — |
| `products` | 149 listings that sold in 60 days (96 Shopify-only, 40 Amazon-only, 13 on both), SKU ↔ ASIN links (best guesses) | Shopify + Amazon | 60 days |
| `product_daily` | Units, orders, sales per Shopify SKU; units, sales, sessions, refunds per ASIN | Shopify analytics + Amazon Sales & Traffic by ASIN | 60 days |
| `recipes` | 190 listings → base products and quantities | Shopify recipes from the stock desk (confirmed); Amazon recipes read from listing names (some best guesses) | — |
| `parents` | 43 base products (key + name) | Stock desk | — |
| `flipkart_daily` | Order lines, units, estimated value, delivered / returned / cancelled / open, FBF lines, ad spend, ad revenue | Flipkart Orders report + Ads report (from the Flipkart dashboard) | 1 Sep – 29 Oct |
| `flipkart_sku_daily` | Units and estimated value per SKU per day | Same | 1 Sep – 29 Oct |
| `flipkart_ads` | Spend, revenue, units, clicks, views, ROI per campaign per report period | Flipkart Ads campaign reports (Sep; 1–28 Oct; 29 Oct) | Sep – 29 Oct |
| `flipkart_sales_real` | Real Seller Hub product sales | Typed from a screenshot | 28 Oct only |
| `flipkart_status` | Flipkart report checklist | Flipkart dashboard | — |
| `freshness_core` | Cadence and last pull per core source | — | — |
| `coverage` | What is and isn't counted (Amazon Ads, Flipkart) | — | — |
| `reports_needed` | Missing, partial and assumed data and how to get it | — | — |
| `notes` | Dated data notes (Section 8) | — | — |

---

## 4. Baseline numbers (for sanity checks)

### 4.1 Monthly, Apr – Oct 2026 (from `monthly`)

"Shopify" here means **sales before returns** (gross − discounts). "Total" = Shopify + Amazon ordered sales. "Ads" = Meta + Google only.

| Month | Shopify | Amazon | Total | Ads (Meta + Google) | Sales per ₹1 ads | Amazon share | Shopify orders | Amazon order items |
|---|---|---|---|---|---|---|---|---|
| Apr | ₹18.8L | ₹34.7L | ₹53.4L | ₹14.7L | ₹3.63 | 65% | 3,121 | 7,559 |
| May | ₹18.9L | ₹36.5L | ₹55.5L | ₹14.1L | ₹3.94 | 66% | 3,214 | 7,370 |
| Jun | ₹21.0L | ₹32.6L | ₹53.6L | ₹16.4L | ₹3.27 | 61% | 3,934 | 6,765 |
| Jul | ₹23.3L | ₹35.0L | ₹58.3L | ₹16.9L | ₹3.45 | 60% | 4,357 | 7,260 |
| Aug | ₹22.7L | ₹31.2L | ₹53.9L | ₹16.6L | ₹3.24 | 58% | 4,296 | 6,526 |
| Sep | ₹30.0L | ₹28.4L | ₹58.4L | ₹21.6L | ₹2.70 | 49% | 6,065 | 5,958 |
| Oct 1–25 | ₹27.0L | ₹29.8L | ₹56.8L | ₹19.1L | ₹2.98 | 53% | 5,773 | 6,794 |
| *Sep 1–25 (comparison)* | ₹24.8L | ₹23.4L | ₹48.2L | ₹17.5L | ₹2.75 | 48% | 4,989 | 4,925 |

**Platform ROAS by month:** Meta 1.48 (Apr) → 1.76 (Sep) → 1.87 (Oct 1–25). Google 2.56 (Apr), 1.48 (Jun, spike month), 2.12 (Sep), 2.56 (Oct 1–25).

**Story so far:** total sales are flat at about ₹53–58L a month. Shopify grew and Amazon shrank, so Amazon's share fell from about 65% to about 50%. Ad spend rose about 47% (₹14.7L → ₹21.6L, Apr → Sep), so efficiency fell. October to date is +17.9% sales on +8.7% spend against 1–25 Sep.

### 4.2 Amazon settlement, 13–25 Oct 2026 (13 days)

Principal (item price, before tax) ₹12.45L · refunds ₹0.60L · promotions ₹0.19L · shipping income ₹0.15L · **fees ₹3.39L (about 27% of principal)** + GST on fees ₹0.63L · **billed advertising ₹3.45L (about 28% of principal, about ₹25–30k a day)** · one unexplained **fee adjustment of ₹1.94L on 21 Oct**, excluded until explained.

### 4.3 Flipkart (estimated value)

| Period | Units | Est. order value | Delivered / returned / cancelled lines | Flipkart Ads spend | Ads revenue |
|---|---|---|---|---|---|
| Sep 2026 | 2,618 | ₹11.2L | 2,055 / 328 / 206 | ₹2.30L | ₹8.16L |
| 1–29 Oct 2026 | 3,356 | ₹14.5L | 1,726 / 453 / 361 (many still open) | ₹2.51L | ₹8.84L |

Value = units × current Flipkart selling price, before returns. On 28 Oct, real Seller Hub sales showed the estimate running about 8% high.

---

## 5. Data sources in detail

### 5.1 Meta Ads (Windsor `facebook`)
- **Fields in use:** account_name, date, spend, actions_purchase, action_values_purchase. The daily report also pulls campaign / adset_name / ad_name, impressions, clicks and statuses.
- **Weekly ad-level pull fields:** campaign_id, adset_id, ad_id, effective_status, object_type, actions_omni_purchase, action_values_omni_purchase (filter spend > 0, in chunks of 37 days or less).
- **Glitch rule:** drop an ad-day where purchase value per purchase exceeds ₹50,000.
- **Campaign context:** Fresh Pixel "BOM_Sales_Prospecting_IC_16.09" is Initiate Checkout-optimised, on remarketing audiences, and the lowest-budget line. Don't call it the "worst" campaign on purchase ROAS.

### 5.2 Google Ads (Windsor `google_ads`)
- **Fields:** date, spend, conversions, conversions_value (plus campaign, impressions, clicks, campaign_status in the daily report).
- **Conversions are fractional:** keep the decimals.

### 5.3 Shopify
- **Daily sales:** `FROM sales SHOW orders, gross_sales, discounts, net_sales, total_sales TIMESERIES day SINCE <d> UNTIL <d>`
- **Units sold** (for COGS): `FROM inventory SHOW inventory_units_sold TIMESERIES day`
- **Per-order rows:** `FROM sales SHOW net_sales, orders GROUP BY order_id, order_name, day`. `orders = 0` rows are refund or adjustment rows; exclude them. Orders over ₹499 = shipping-eligible.
- **Payment mix:** `GROUP BY order_payment_status`. "pending" = COD, "paid" = prepaid; exclude "voided".
- **Sessions:** `FROM sessions SHOW sessions, sessions_that_completed_checkout, conversion_rate GROUP BY landing_page_path`. Product landing-page handles must be resolved to product titles (handles and titles don't match).
- **Single vs combo order proxy** (owner's rule, 8 Oct 2026): single if net ≤ ₹499, or ₹570–600 (night cream), or ₹660–690 (serum). Everything else is combo / multi-item.
- **"Shopify revenue" in the daily ads report = net_sales.** The cross-channel dashboard headlines **sales before returns** (gross − discounts) instead, because returns post on the processing day.

### 5.4 Amazon (Windsor `amazon_sp`)
- **Sales & Traffic by date:** ordered product sales, units ordered, total order items, units refunded.
- **By ASIN (child):** units, ordered sales, sessions, refunded units (also page views and Buy Box, which aren't used yet).
- **Settlement v2:** posted_date, transaction_type, amount_type, amount_description, amount. Windsor holds about the last 90 days only. Day-by-day rows were returned for 13–25 Oct only.
- **Lag:** Amazon reports about a day behind, so 2 days behind is normal.

### 5.5 Flipkart (Slack → task #16 → Flipkart dashboard)

| Report | Cadence | Status (30 Oct) |
|---|---|---|
| Orders report (Seller Hub) | Daily | In use; through 29 Oct |
| Daily product sales | Daily | Partial; real figures for 28 Oct only |
| FBF current inventory | Weekly | In use; received 28 Oct |
| Flipkart Ads campaign report | Weekly | In use; Sep, 1–28 Oct and 29 Oct periods. **No product column.** Daily spend is a period average. |
| Settlement / payments | Weekly | **Not received** |
| Cancellation and return reasons | Weekly | **Not received** |

**Date rule:** dates come from inside the file, then from the poster's comment. Never assume them from the posting date. If no date can be found, don't load the file; ask in the thread.

**API note:** Flipkart's Reports API (settlement, P&L, FBF) is paid and partner-only. The Order Management API may be usable with the seller's own credentials (to be confirmed).

### 5.6 Stock desk (Slack screenshots → task #7)
Two screenshots arrive nightly in #inventory-wh-movement: Mumbai closing stock, and CBE (D2C Avl / BLK-RSRV / SIH). The kit (`build.py`, `state.json`, `PROCEDURE.md`) lives in the stock desk artifact. **Don't change the mappings, recipes or model without the owner asking.**

---

## 6. Products, SKUs and recipes

- **Listing kinds:** **S** = single (one unit of one base product), **P** = pack (several of one product), **C** = combo (different products).
- **Recipe format:** `parts` = `KEY:qty,KEY:qty`. For example AV220 "Kumkumadi Glowing Skin" = `K100:1,KGEL:1,KC:1`.
- **Recipe counts (190):**
  - Shopify: 58 singles, 9 packs and 71 combos, all confirmed from the stock desk.
  - Amazon: 52 listings. 39 are read from listing names, 12 are best guesses and 1 is low confidence.
- **Product list:** 149 listings sold in the last 60 days. 13 are matched across Shopify and Amazon by the same code or name (best guess).
- **Naming is messy.** The same product appears under several names and codes across channels (for example K100 / N109 / "Kumkumadi Tailam 100ml" / "Glow Secret Oil"). Always map to the **base product key** (Appendix B) before comparing across channels.
- **Kumkuma Oil (KMA) is a different product from Kumkumadi Oil (K100).**
- **Known gap:** Shopify SKU D-ACFM (₹562 in 60 days) has no recipe.

---

## 7. Metric definitions and formulas

### 7.1 Headline metrics
- **Total sales** = Shopify sales before returns (gross − discounts) + Amazon ordered product sales. Flipkart is *not* in the total; it is shown separately as an estimate.
- **Ad spend** = Meta (5 accounts) + Google. *Amazon Ads not included; Flipkart Ads shown separately.*
- **Sales per ₹1 of ads (MER)** = total sales ÷ ad spend.
- **Meta ROAS** = action_values_purchase ÷ spend. **Google ROAS** = conversions_value ÷ spend.
- **Shopify reversals** = gross − discounts − net sales (returns, cancellations and refunds posted that day).
- **Comparisons:** a period is compared with the same length of time immediately before. A partial month is compared with the same days of the previous month.

### 7.2 Dashboard-basis P&L
`Overall profit = Total sales (pre-returns) − Meta + Google ad spend`. There are no product, shipping or fee costs. A memo line shows Amazon Ads billed in settlements, which is not deducted.

### 7.3 Realistic P&L (same method as the daily ads report)

```
STORE
  Shopify net sales                       (after discounts and returns, before tax and shipping charged)
− Product cost     = units sold × ₹125
− Shipping         = Shopify orders with net sales > ₹499 × ₹65
− Meta + Google ad spend                  (all charged to the store)
= Store net profit

AMAZON
  Settlement principal                    (item price before tax)
− Refunds
− Promotions, net of shipping income
− Amazon fees                             (commission, closing, FBA etc., before GST on fees)
− Amazon Ads, as billed in the settlement
− Product cost     = units ordered × ₹125  (assumed same as Shopify)
= Amazon profit

COMBINED NET PROFIT = Store net profit + Amazon profit
Share % is of net revenue = Shopify net + Amazon principal − refunds
```

Settlement days before 13 Oct are estimated at the 13–25 Oct rate. The ₹1.94L fee adjustment on 21 Oct is excluded. Flipkart is not in either P&L.

### 7.4 Flipkart
- **Estimated value** = units × current Flipkart selling price (before discounts and returns).
- **Ad spend per day** = each report period's spend spread evenly over its days (`ad_basis` = "period average" or "exact").

---

## 8. Data notes and known issues (don't "fix" these silently)

| Date | Channel | Note |
|---|---|---|
| 21 Jul 2026 | Meta | MP2 reported ₹4.4 crore purchase value for 46 purchases, a glitch. That ad-day (₹19.4k spend included) is excluded. Without the exclusion, July Meta ROAS showed 33.7. |
| 16–17 Jun 2026 | Google | Spend spiked to ₹1.16L and ₹62.5k against about ₹12k normally. Kept in, so June Google ROAS is low (1.48). |
| 3–8 Sep 2026 | Google | Spend dropped to about ₹5k a day and conversions fell; recovered on 9 Sep. |
| Aug 2026 | Shopify | About 43% of the month's sales were reversed when processed (net ₹12.8L against ₹22.7L before returns). This is why the headline is sales before returns. |
| 21 Oct 2026 | Amazon | ₹1.94L "Fee Adjustment" in the settlement, unclassified and excluded |
| Oct 2026 | Amazon | Settlement rows exist day by day only for 13–25 Oct |
| 28 Oct 2026 | Flipkart | The only day with real rupee sales; the estimate ran about 8% high |

### 8.1 Missing or assumed data (from `reports_needed`)

| Report | Status | Fix |
|---|---|---|
| Amazon Ads campaign report | Missing | Connect `amazon_ads` in Windsor |
| Amazon settlement, full history | Partial | Seller Central → Reports → Payments → Date range reports, for Apr–Oct |
| Product cost per SKU | Assumed (flat ₹125) | Sheet with SKU / ASIN and landed unit cost |
| Shopify gateway and COD fees | Missing | Shopify Payments payout or COD partner remittance report |
| Returns and RTO on COD | Missing | RTO / NDR report from the shipping partner |
| Amazon 21 Oct fee adjustment | Unclassified | Seller Central → Payments → Transaction view |
| Overheads | Missing | Monthly overhead sheet |
| Ad spend by product | Missing | Campaign-to-product mapping sheet, or product-level Shopping / Amazon Ads reports |
| Flipkart settlement | Missing | Post the weekly report in #flipkart-reports |
| Flipkart daily sales | Partial | Post the product sales table daily, with its date |
| Flipkart Ads by day | Partial | Post the Ads report daily, or weekly with day columns |
| Flipkart cancellation and return reasons | Missing | Post the Seller Hub reasons report |

---

## 9. Working conventions

- **Time zone:** IST (Asia/Kolkata) for all dates. Scheduled jobs must compute the real IST date with a shell command; the session date may be UTC.
- **Money:** INR, Indian grouping (₹3,29,348), lakhs (L) and crores in prose. ROAS to 2 decimals.
- **Writing style:** plain language, specific numbers, the date range always stated. Campaign and account names in quotes. Never invent or extrapolate figures. Say "missing" rather than showing zero.
- **Changing an existing dashboard or task:** change only what was asked. Keep the page's scripts, filters and layout unless the change is about them. Re-run a data pull yourself before "fixing" a number.
- **Before scheduling anything new:** list the existing scheduled tasks to avoid duplicates. Never use the local cron tools (they die with the session).
- **Windsor:** only `get_data`, `get_fields`, `get_connectors`, `get_options` and the destination listing tools. Setting up exports happens in Windsor's dashboard. Never `execute_action`.

---

## 10. Glossary

| Term | Meaning |
|---|---|
| **MER** | Marketing efficiency ratio = total sales ÷ total ad spend ("sales per ₹1 of ads") |
| **ROAS** | Platform-attributed revenue ÷ that platform's spend |
| **ACOS / TACOS** | Amazon ad spend ÷ ad-attributed sales / ÷ total Amazon sales |
| **CPP** | Cost per purchase |
| **AOV** | Average order value |
| **COGS** | Cost of goods sold (₹125 per unit assumed) |
| **COD / Prepaid** | Cash on delivery / paid online |
| **RTO** | Return to origin (undelivered parcel coming back) |
| **NDR** | Non-delivery report (a failed delivery attempt) |
| **FBA / FBF** | Fulfilled by Amazon / Fulfilled by Flipkart |
| **ASIN / FSN** | Amazon / Flipkart product identifiers |
| **SIH / D2C Avl / BLK-RSRV** | Stock in hand / available for D2C / reserved for bulk |
| **CBE** | Coimbatore warehouse (ships South India) |
| **Principal** | Amazon settlement item price, before tax |
| **Base product** | A physical product (for example K100) that listings and combos are made of |
| **Recipe** | Which base products, and how many, a listing contains |
| **Sales before returns** | Shopify gross sales − discounts (headline Shopify figure) |
| **Reversal** | Returns, cancellations and refunds posted on a day |

---

## Appendix A: Key IDs at a glance

```
Shopify store ......... AURAVEDIC · auravedic.com · INR · IST
Amazon seller ......... A3OEY3JP0PGBDE-IN (Amazon.in)
Amazon Ads profile .... 1844743165607135 (not connected in Windsor)
Google Ads ............ 318-241-3276 "Auravedic"
Meta (included) ....... 1274462564675838 New26 · 636601780205220 Auravedic Internal
                        1506928486493862 MP2 · 1030922277728502 Auravedic GC
                        434037959170111 Fresh Pixel
Meta (excluded) ....... 100149933695451 Auravedic Admin
Slack ................. #aura-daily-reports C0C3KUA4G3G · #flipkart-reports C0CD21J6SLE
                        #inventory-wh-movement C0C6TMB60QN · #calling-desk C0C2P3PLE4F
```

## Appendix B: Base products (43)

| Key | Name | Key | Name |
|---|---|---|---|
| K100 | Kumkumadi Oil 100ml | KFW | Kumkumadi Face Wash 100ml |
| K30 | Kumkumadi Tailam 30ml | KM | Kumkumadi Mask 100g |
| KMA | Kumkuma Oil 100ml (a different product) | KUEC | Kumkumadi Under Eye Cream |
| SBO | Skin Brightening Oil | KUFW | Kumkumadi Ubtan |
| KNS | Kumkumadi Night Serum 50ml | KSM | Kumkumadi Sleep Mask |
| KGEL | Kumkumadi Gel 100g | KMO | Kumkumadi Body Massage Oil 200ml |
| KNC | Kumkumadi Night Cream 50g | KBS | Kumkumadi Brightening Serum SPF50 |
| KC | Kumkumadi Cream 100g | KT | Kumkumadi Toner 100ml |
| RBMO | Relaxing Body Massage Oil 200ml | BTMO | Body Toning Massage Oil 200ml |
| VCO | Vitamin C Oil 100ml | VCC | Vitamin C Cream |
| DTC | De-tan Cream 100g | DSC | Dark Spot Corrector Cream |
| FO | Firming Age Repair Oil 100ml | ARP | Age Repair Face Polish |
| UO | Ultra Skin Oil (Vitamin E) 100ml | PS | Pigmentation Serum 30ml |
| NL | Nalpamaradi Thailam 100ml | SLM | Skin Lightening Mask 100g |
| ACS | Acne Calming Sunscreen | ACFM | Acne Clearing Face Mask 100g |
| NTFW | Acne Clearing Face Wash (Tea Tree) 120ml | TTS | Tea Tree Serum 30ml |
| CSSM | Chia Seeds Sleep Mask | RWT | Rose Water Toner |
| AG | Aloevera Gel | HGS | Hair Growth Serum 30ml |
| HCS | Hairfall Control Shampoo 500ml | HM | Hair Mask |
| RHO | Rosemary Hair Oil 100ml | RHM | Rosemary Hair Mist 100ml |
| RS | Rosemary Shampoo | OHO | Onion Hair Oil |
| PHO | Protective Hair Oil | | |

## Appendix C: Where to find things

| Need | Where |
|---|---|
| Combo recipes, SKU mappings, warehouse names | Stock desk artifact → `kit/build.py`, `kit/state.json`, `kit/PROCEDURE.md` |
| SKU maps for Amazon, Flipkart and Nykaa | Google Sheet "Duplicate Monthly inventory calculations and tracking" (cell contents not readable through the connector; open it directly) |
| Old warehouse sheet (CBE / Mumbai, Oct 2025) | Google Sheet "Aura Simple Inventory - Warehouses" (outdated) |
| Order-level ops data (COD, RTO, desk status) | Call & Chase ops page; master order sheet mirror "Claude-connect-Shopify-Master-Sheet" (read-only) |
| Daily ad-level history since mid-Sep | Daily ads report artifact database, collection `days` |
| Meta ad-level 6-month history | Meta winners and losers artifact |
| Flipkart raw tables (orders, sales, ads, FBF) | Flipkart Marketplace Report artifact, `datasets/*` |
| Amazon price / rank / rating tracking | The "run-amazon-check" routine's Google Sheet |
