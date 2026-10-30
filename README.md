# Auravedic Cross-Channel Performance & Commerce Dashboard

An independent, production-grade analytics web application covering every Auravedic sales and marketing channel. Designed to live outside Claude so anyone across the executive, marketing, marketplace, warehouse, and finance teams can run it without dependencies.

---

## 🚀 Quick Start (Local Launch)

### Option 1: One-Click Launch (Windows)
Double-click `start-dashboard.bat` (production build) or `start-dev.bat` (hot-reload dev server) in this directory.

### Option 2: Command Line
```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start development server (http://localhost:3000)
npm run dev

# 3. Or build & run production preview
npm run build
npm run preview
```

---

## 📊 The 8 Core Pages

1. **Executive Summary**:
   - High-level KPIs: Total Gross Sales (pre-returns), Blended Ad Spend, Blended MER, Realistic Net Profit, Contribution Margin %, Total Orders, Blended AOV, CAC, Amazon TACOS.
   - Channel Sales Mix: Stacked multi-channel volume over time (Shopify vs Amazon vs Flipkart vs Others).
   - Target Pacing: MTD pacing against monthly targets with run-rate projections.
   - Daily Executive Intelligence: Top 5 algorithmic findings and top 3 prioritized tactical actions.

2. **Profit & Loss (P&L)**:
   - Dual P&L view: Dashboard-basis (Sales pre-returns minus ad spend) vs Realistic P&L (Net sales minus COGS, shipping, marketplace fees, and ads).
   - Interactive Waterfall Chart: Step-by-step margin erosion from gross billings down to net profit.
   - Channel P&L Cards: Dedicated Shopify and Amazon standalone P&Ls.
   - Dynamic Sensitivity Simulator: Adjust unit COGS (₹80–₹220), shipping rates, and monthly overheads in real time.

3. **Advertising & ROAS**:
   - Blended efficiency: Spend vs ROAS across Meta, Google, Amazon Ads, and Flipkart Ads.
   - Meta Ads (5 Accounts): League table for `New26`, `Auravedic Internal`, `MP2`, `Auravedic GC`, and `Fresh Pixel` with glitch filters applied. `Auravedic Admin` is explicitly excluded per Golden Rule.
   - Google Ads Breakdown: Spikes and ROAS tracked.
   - Marketplace Ads: Amazon billed ads in settlements & Flipkart campaign ROI.
   - Creative Fatigue Monitor: Identifies ad sets where CTR &lt; 1.2% while frequency &gt; 2.5 and CPP climbs, with actionable refresh advice.

4. **Shopify D2C Store**:
   - E-commerce Funnel: Sessions → Product Views → Add to Cart → Initiated Checkout → Completed Orders with drop-off percentages.
   - COD vs Prepaid Economics: State-wise COD share and RTO risk matrix (flagging critical high-RTO states: Bihar 24.5%, Rajasthan 18.2%, Assam 22%, West Bengal 17.8%, J&K 21.5%).
   - Reversal Audit: Historical analysis of large refund/cancellation batches (e.g. August 2026 43% reversal event).
   - Helio AI Chatbot: Attributed orders, revenue, and top customer inquiries/objections.

5. **Marketplaces (Amazon, Flipkart, Nykaa, Myntra)**:
   - Amazon ASIN Deep Dive: 55+ product listings parsed directly from Seller Central Business Reports.
   - Settlement Reconciler: Item principal vs refunds, promos, fees (~27%), and billed ads (~28%). 21 Oct ₹1.94L fee adjustment isolated.
   - Flipkart Seller Hub: Delivered lines, return rates (13.5%), FBF stock, and real vs estimated sales gap.
   - Emerging Channels: Dedicated tracking for Nykaa and Myntra.

6. **Products & Combo Recipes**:
   - 43 Base Products Master Table: Complete catalog of base items with landed costs and MRPs.
   - Combo Recipe Deconstruction Engine: Explodes 190 finished SKUs and combo bundles into physical base units. Select any base product to see every listing across channels that draws from its factory stock.
   - Unit Economic Margin Traps: Real SKU economics from Sheet31 exposing loss-making bundles (e.g. `KNS+KNC` combo losing ₹235 per order after RTO).

7. **Warehouse & Stock Operations**:
   - Stock by Warehouse: Coimbatore (CBE: D2C Available, Bulk Reserve, SIH) vs Mumbai closing stock.
   - Dispatch Rule: South India orders (TN, KA, KL, AP, TS, PY) ship from CBE; rest ship from Mumbai.
   - Days of Cover (DOC): Color-coded alerts (Red &lt;7d, Amber 7–14d, Green &gt;14d).
   - Automated Reorder Triggers: Reorder batch suggestions to reach 45 days of safety cover.
   - Amazon FBA Inbound Planning: Restock quantities needed.

8. **Data Health & In-App Ingestion**:
   - In-App Report Uploader: Drag and drop Amazon Business Reports (`.csv`), Windsor exports, or `Shan-Report-Sheet.xlsx` to parse and update dashboard state on the fly.
   - Governance & Assumptions: Flat ₹125 COGS default, ₹65 shipping for orders &gt; ₹499.
   - Missing Reports Checklist: Outstanding data stream audits.
   - One-Click Export: Export unified state to JSON or CSV.

---

## 🛡️ Enforced Golden Rules

1. **Read-Only on Store & Ad Accounts**: Direct integrations and data processing are strictly read-only.
2. **Zero PII**: No customer names, phone numbers, email addresses, or street addresses are ever stored or presented.
3. **Explicit Ad Attribution Badges**: Every view displays an attribution badge specifying active ad channels.
4. **Label Estimates**: Flipkart rupee figures, pre-13 Oct settlement estimates, and flat COGS figures are clearly badged as estimates.
5. **Pre-returns Headline vs Net Sales**: Headline Shopify sales is Gross − Discounts (pre-returns) to eliminate distortion from batch refund processing days.
6. **Glitch Filters**: Drops Meta ad-days exceeding ₹50k purchase value per purchase.
