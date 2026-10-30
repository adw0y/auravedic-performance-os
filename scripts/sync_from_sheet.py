# -*- coding: utf-8 -*-
"""
Sync dashboard data from a Google Sheet (or a folder of CSV exports) into the app's data files.

The dashboard is a static site, so "live" means: the data files are refreshed before each build.
GitHub Actions runs this script on a schedule (see .github/workflows/deploy.yml), then builds and
deploys. Nothing is fetched in the browser and no credentials ever reach it.

Sheet layout: one tab per table, header names in row 1 (extra columns are ignored).

  marketplaces   -> marketplaceSummary   channel, type, monthlyRevenue, sharePercent, orders, aov,
                                         returnRate, status, [adSpend, adRoas, skusMapped]
  monthly        -> monthlyPerformance   month, shopifyPreReturns, ... (see MONTHLY below)
  meta_accounts  -> metaAccounts         name, accountId, status, share, spendOct, purchasesOct,
                                         roasOct, strategy
  freshness      -> freshness            key, value  (keys like metaAds, assumptions.defaultCOGS)
  daily          -> src/data/dailyData.ts  one row per day, columns as in scripts/data_io.py

A tab that is missing or has no data rows is skipped and the bundled snapshot is kept for it. A tab
that is present but malformed stops the run with an error naming the tab, row and column.

Usage
  python scripts/sync_from_sheet.py                         # Google Sheet from the environment
  python scripts/sync_from_sheet.py --csv-dir DIR           # CSV exports, one <tab>.csv each
  python scripts/sync_from_sheet.py --export-csv DIR        # write the current data as a template
  python scripts/sync_from_sheet.py --csv-dir DIR --out-dir OUT   # write somewhere else (testing)

Environment (Google Sheet mode)
  GOOGLE_SERVICE_ACCOUNT_JSON   the service account key (JSON text); share the sheet with its email
  GOOGLE_SHEET_ID               the id in the sheet's URL
Without both, the script exits cleanly and the build keeps the bundled snapshot.
"""

import argparse
import csv
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_io import DAILY_FIELDS, read_daily_ts, write_daily_ts  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data")

STR, NUM = "str", "num"


class SyncError(Exception):
    pass


def col(name, kind=NUM, optional=False):
    return (name, kind, optional)


MONTHLY = [
    col("month", STR), col("shopifyPreReturns"), col("shopifyNet"), col("amazonSales"), col("totalSales"),
    col("flipkartSalesEst"), col("metaSpend"), col("googleSpend"), col("totalAdsIncluded"),
    col("amazonAdsSpendEst"), col("flipkartAdsSpend"), col("salesPerRupeeAd"), col("amazonShare"),
    col("shopifyOrders"), col("amazonOrders"), col("metaROAS"), col("googleROAS"),
    col("realisticNetProfit"), col("contributionMargin"),
]

TABLES = {
    "marketplaces": {
        "target": "marketplaceSummary",
        "unique": "channel",
        "columns": [
            col("channel", STR), col("type", STR), col("monthlyRevenue"), col("sharePercent"), col("orders"),
            col("aov"), col("returnRate"), col("status", STR),
            col("adSpend", NUM, True), col("adRoas", NUM, True), col("skusMapped", NUM, True),
        ],
    },
    "monthly": {"target": "monthlyPerformance", "unique": "month", "columns": MONTHLY, "min_rows": 2},
    "meta_accounts": {
        "target": "metaAccounts",
        "unique": "name",
        "columns": [
            col("name", STR), col("accountId", STR), col("status", STR), col("share"), col("spendOct"),
            col("purchasesOct"), col("roasOct"), col("strategy", STR),
        ],
    },
}

CANONICAL_CHANNELS = ["Shopify D2C", "Amazon.in", "Flipkart", "Nykaa", "Myntra"]


# ---------------------------------------------------------------------------
# Parsing and validation
# ---------------------------------------------------------------------------

def parse_number(text, where):
    s = str(text).strip().replace(",", "").replace("₹", "").replace("%", "")
    try:
        v = float(s)
    except ValueError:
        raise SyncError(f"{where}: '{text}' is not a number")
    if v != v or v in (float("inf"), float("-inf")):
        raise SyncError(f"{where}: '{text}' is not a finite number")
    return int(v) if v.is_integer() else v


def table_rows(tab, table):
    """Turn a list-of-lists (header first) into (header map, data rows), skipping blank rows."""
    if not table or not any(str(c).strip() for c in table[0]):
        return None
    header = {str(h).strip().lower(): i for i, h in enumerate(table[0]) if str(h).strip()}
    rows = [(n + 2, r) for n, r in enumerate(table[1:]) if any(str(c).strip() for c in r)]
    return header, rows


def parse_table(tab, spec, table):
    parsed = table_rows(tab, table)
    if parsed is None:
        return None
    header, rows = parsed
    if not rows:
        return None

    missing = [name for name, _, optional in spec["columns"] if not optional and name.lower() not in header]
    if missing:
        raise SyncError(f"{tab}: missing column(s) {', '.join(missing)} in row 1")

    out = []
    for line, row in rows:
        item = {}
        for name, kind, optional in spec["columns"]:
            idx = header.get(name.lower())
            raw = row[idx].strip() if idx is not None and idx < len(row) else ""
            if raw == "":
                if optional:
                    continue
                raise SyncError(f"{tab} row {line}: column {name} is empty")
            item[name] = raw if kind == STR else parse_number(raw, f"{tab} row {line}, column {name}")
        out.append(item)

    key = spec.get("unique")
    if key:
        seen = set()
        for item in out:
            if item[key] in seen:
                raise SyncError(f"{tab}: {key} '{item[key]}' appears more than once")
            seen.add(item[key])
    if len(out) < spec.get("min_rows", 1):
        raise SyncError(f"{tab}: needs at least {spec.get('min_rows', 1)} data rows, found {len(out)}")
    return out


def check_extra(tab, items):
    if tab == "meta_accounts":
        for it in items:
            if not re.fullmatch(r"\d{10,}", it["accountId"]):
                raise SyncError(
                    f"meta_accounts: accountId '{it['accountId']}' for {it['name']} is not a plain digit string. "
                    "Format the column as plain text so long IDs are not turned into numbers."
                )
        if not any(it["status"].lower() == "active" for it in items):
            raise SyncError("meta_accounts: no account has status Active")
    if tab == "marketplaces":
        absent = [c for c in CANONICAL_CHANNELS if c not in {it["channel"] for it in items}]
        if absent:
            print(f"  note: marketplaces has no row for {', '.join(absent)}; the dashboard will show nothing for it")


def parse_freshness(table):
    parsed = table_rows("freshness", table)
    if parsed is None:
        return None
    header, rows = parsed
    if "key" not in header or "value" not in header:
        raise SyncError("freshness: needs columns key and value in row 1")
    out = {}
    for line, row in rows:
        k = row[header["key"]].strip() if header["key"] < len(row) else ""
        v = row[header["value"]].strip() if header["value"] < len(row) else ""
        if not k:
            continue
        if k.startswith("assumptions."):
            out.setdefault("assumptions", {})[k.split(".", 1)[1]] = parse_number(v, f"freshness row {line}, {k}")
        else:
            if not v:
                raise SyncError(f"freshness row {line}: value for {k} is empty")
            out[k] = v
    return out or None


def parse_daily(table):
    parsed = table_rows("daily", table)
    if parsed is None:
        return None
    header, rows = parsed
    if not rows:
        return None
    missing = [name for name, _ in DAILY_FIELDS if name.lower() not in header]
    if missing:
        raise SyncError(f"daily: missing column(s) {', '.join(missing)} in row 1")

    out = []
    for line, row in rows:
        item = {}
        for name, kind in DAILY_FIELDS:
            idx = header[name.lower()]
            raw = row[idx].strip() if idx < len(row) else ""
            if raw == "":
                raise SyncError(f"daily row {line}: column {name} is empty")
            if kind == "string":
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
                    raise SyncError(
                        f"daily row {line}: date '{raw}' is not YYYY-MM-DD. Format the date column as plain text."
                    )
                item[name] = raw
            else:
                item[name] = parse_number(raw, f"daily row {line}, column {name}")
        out.append(item)

    dates = [r["date"] for r in out]
    if len(set(dates)) != len(dates):
        raise SyncError("daily: a date appears more than once")
    out.sort(key=lambda r: r["date"])
    if len(out) < 14:
        raise SyncError(f"daily: needs at least 14 days (the 14-day view and prior periods), found {len(out)}")
    return out


# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------

def read_csv_tables(directory):
    tables = {}
    for tab in list(TABLES) + ["freshness", "daily"]:
        path = os.path.join(directory, f"{tab}.csv")
        if os.path.exists(path):
            with open(path, newline="", encoding="utf-8-sig") as f:
                tables[tab] = list(csv.reader(f))
    return tables


def read_google_tables(sheet_id, credentials_json):
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError:
        raise SyncError("Google mode needs: pip install gspread google-auth")
    try:
        info = json.loads(credentials_json)
    except json.JSONDecodeError:
        raise SyncError("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON")
    creds = Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
    )
    book = gspread.authorize(creds).open_by_key(sheet_id)
    tables = {}
    for tab in list(TABLES) + ["freshness", "daily"]:
        try:
            tables[tab] = book.worksheet(tab).get_all_values()
        except gspread.WorksheetNotFound:
            print(f"  tab '{tab}' not found in the sheet: keeping the bundled snapshot for it")
    return tables


# ---------------------------------------------------------------------------
# Export (template / round-trip) and apply
# ---------------------------------------------------------------------------

def export_csv(directory, include_daily):
    os.makedirs(directory, exist_ok=True)
    with open(os.path.join(DATA_DIR, "dashboardData.json"), encoding="utf-8") as f:
        data = json.load(f)

    def write(tab, header, rows):
        with open(os.path.join(directory, f"{tab}.csv"), "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(header)
            w.writerows(rows)

    for tab, spec in TABLES.items():
        names = [c[0] for c in spec["columns"]]
        write(tab, names, [[item.get(n, "") for n in names] for item in data[spec["target"]]])

    fresh = data["freshness"]
    rows = [[k, v] for k, v in fresh.items() if k != "assumptions"]
    rows += [[f"assumptions.{k}", v] for k, v in fresh.get("assumptions", {}).items()]
    write("freshness", ["key", "value"], rows)

    daily_names = [n for n, _ in DAILY_FIELDS]
    daily = read_daily_ts(os.path.join(DATA_DIR, "dailyData.ts")) if include_daily else []
    write("daily", daily_names, [[r[n] for n in daily_names] for r in daily])
    print(f"Wrote template CSVs to {directory}")


def apply(tables, out_dir, dry_run):
    results = {}
    for tab, spec in TABLES.items():
        items = parse_table(tab, spec, tables.get(tab))
        if items is not None:
            check_extra(tab, items)
            results[tab] = items
    fresh = parse_freshness(tables.get("freshness"))
    daily = parse_daily(tables.get("daily"))

    with open(os.path.join(DATA_DIR, "dashboardData.json"), encoding="utf-8") as f:
        data = json.load(f)

    for tab, items in results.items():
        data[TABLES[tab]["target"]] = items
        print(f"  {tab}: {len(items)} rows -> {TABLES[tab]['target']}")
    if fresh:
        merged = {**data["freshness"], **{k: v for k, v in fresh.items() if k != "assumptions"}}
        merged["assumptions"] = {**data["freshness"].get("assumptions", {}), **fresh.get("assumptions", {})}
        data["freshness"] = merged
        print(f"  freshness: {len(fresh)} keys")
    for tab in ("marketplaces", "monthly", "meta_accounts", "freshness", "daily"):
        if tab not in results and not (tab == "freshness" and fresh) and not (tab == "daily" and daily):
            print(f"  {tab}: empty or missing, keeping the bundled snapshot")
    if daily:
        print(f"  daily: {len(daily)} days ({daily[0]['date']} to {daily[-1]['date']}) -> dailyData.ts")

    if dry_run:
        print("Dry run: nothing written.")
        return
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "dashboardData.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    if daily:
        write_daily_ts(
            daily,
            os.path.join(out_dir, "dailyData.ts"),
            header=(
                "// Synced from the Google Sheet by scripts/sync_from_sheet.py. Do not edit by hand:\n"
                "// the next sync overwrites it.\n"
            ),
        )
    print(f"Wrote data files to {out_dir}")


def main():
    ap = argparse.ArgumentParser(description="Sync dashboard data from a Google Sheet or CSV exports.")
    ap.add_argument("--csv-dir", help="read <tab>.csv files from this folder instead of Google")
    ap.add_argument("--export-csv", metavar="DIR", help="write the current data as template CSVs and exit")
    ap.add_argument("--include-daily", action="store_true", help="with --export-csv, include the daily rows")
    ap.add_argument("--out-dir", default=DATA_DIR, help="where to write the data files (default src/data)")
    ap.add_argument("--dry-run", action="store_true", help="validate and report without writing")
    args = ap.parse_args()

    try:
        if args.export_csv:
            export_csv(args.export_csv, args.include_daily)
            return 0
        if args.csv_dir:
            print(f"Reading CSV exports from {args.csv_dir}")
            tables = read_csv_tables(args.csv_dir)
        else:
            sheet_id = os.environ.get("GOOGLE_SHEET_ID", "").strip()
            creds = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
            if not sheet_id or not creds:
                print("Google Sheet sync is not configured (GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON).")
                print("Keeping the bundled snapshot.")
                return 0
            print(f"Reading Google Sheet {sheet_id}")
            tables = read_google_tables(sheet_id, creds)
        apply(tables, args.out_dir, args.dry_run)
        return 0
    except SyncError as e:
        print(f"SYNC FAILED: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
