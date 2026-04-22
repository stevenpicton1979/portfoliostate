# Hearth App — app.hearth.money

- Repo: stevenpicton1979/hearth-app (main branch, public)
- Live: https://app.hearth.money
- Vercel project: prj_OcSfg66gnYWG5cDxBT5UJYEESgAb, team: stevenpicton1979s-projects (team_Qdp9yMqPc3iK7cfwbinI3OHy)
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts + Vercel + Supabase
- Supabase project: npydbobvppfqdoiyiuar (Hearth org, NEW project — NOT the old fzykfxesznyiigoyeyed Finance Tracker project)
- Local dev path: C:\dev\personal-assistant\hearth-app
- DEFAULT_HOUSEHOLD_ID: 00000000-0000-0000-0000-000000000001

## What It Does
Personal finance tracker for a household with a Pty Ltd business (Brisbane Health & Technology Pty Ltd).
Reads CBA bank CSV exports + syncs from Xero (business transactions), cleans merchant names, stores
transactions in Supabase, and provides a web UI for reviewing, categorising, and analysing expenses.
Handles the complexity of a director/owner structure: wages, drawings, dividends, and business expenses.

## App Pages
- `/` — Dashboard: net worth card, this-month spending, upcoming subscriptions, goals, recent transactions, business summary widget
- `/import` — Drag-drop CSV upload, account selector (existing or create new), import summary with spinner
- `/transactions` — 2000+ transactions, filterable by scope (Household/Business/Investment), account, category, classification; inline editing; Transfer badge; Show excluded checkbox
- `/spending` — Month picker, category pie + bar charts, drilldown, income/cash flow cards, quick-categorise modal
- `/subscriptions` — Auto-detected recurring payments (Active / Lapsed / All / Duplicates / Timeline tabs)
- `/net-worth` — Bank account balances (household-scoped only), manual assets/liabilities, snapshot chart
- `/goals` — Financial goals with progress bars
- `/mappings` — Admin view of merchant_mappings (89+ rules), searchable, editable
- `/settings` — Hub linking to accounts, budgets, categories, mappings, import, export, income entries, Xero
- `/settings/income-entries` — Manual income entries (dividends, director fees, EOY events)
- `/settings/xero` — Xero OAuth connection + Sync Now button
- `/dev/training` — Ground truth labelling UI (URL-only, not in nav)

## Database Schema (Supabase project npydbobvppfqdoiyiuar)
- **accounts** — id, household_id, display_name, institution, account_type, current_balance (numeric), last_synced_at, is_active, scope ('household'|'business'|'investment', default 'household')
- **transactions** — id, household_id, account_id, date, amount, description, merchant, category, classification, is_transfer, source ('csv'|'xero'); unique on (account_id, date, amount, description)
- **merchant_mappings** — id, household_id, merchant, category, classification, notes; unique on (household_id, merchant)
- **manual_income_entries** — id, household_id, date, amount, description, category, recipient, financial_year
- **xero_connections** — id, household_id, tenant_id, tenant_name, access_token, refresh_token, expires_at, last_synced_at, created_at, updated_at; unique on (household_id, tenant_id). No RLS.
- **assets** — manual assets (property, super, etc.)
- **liabilities** — manual liabilities
- **net_worth_snapshots** — historical net worth snapshots
- **goals** — financial goals
- **training_labels** — merchant benchmark dataset (status: pending/confirmed/actioned, holdout flag, suggested_rule); unique on (household_id, merchant). No RLS.

## Account Scoping
accounts.scope controls which figures each account contributes to:
- **household** — included in spending, income, subscriptions, headline net worth
- **business** — excluded from household metrics; shown in Business summary widget only
- **investment** — excluded from spending; shown in net worth

Steve's accounts and their intended scopes:
- Bills & Direct Debits (CBA) → household
- Nicola's Account (CBA) → household
- Business Credit Card (CBA) → business
- Smart Awards (CBA) → household (personal rewards card)
- Xero (Business) — auto-created by Xero sync → business (SET THIS IN SETTINGS → ACCOUNTS)
- NAB CC / Business Amex → business

## Xero Integration
- Connected to: Brisbane Health & Technology Pty Ltd (tenant: set in xero_connections)
- Auth: OAuth 2.0 Web App, Client ID/Secret in Vercel env vars (XERO_CLIENT_ID, XERO_CLIENT_SECRET)
- Redirect URI: https://app.hearth.money/api/xero/callback (set in XERO_REDIRECT_URI env var)
- Scopes: openid profile email accounting.banktransactions.read accounting.settings.read offline_access
- Sync: incremental via If-Modified-Since header; first sync pulled full history (1426 new + 574 duplicates)
- Virtual account "Xero (Business)" auto-created in accounts table on first sync
- Transactions from Xero scoped as 'business', source='xero'
- Category mapping: xeroCategories.ts maps Xero account types/codes → Hearth categories
- EQUITY/drawings accounts → Director Income; REVENUE → Business; EXPENSE by keyword

## Director Income & Business Structure
- Brisbane Health & Technology Pty Ltd pays Steve wages + director drawings
- Wages/drawings arriving as CBA credits: detected by directorIncome.ts, categorised as 'Director Income', is_transfer=false
- Annual dividend: recorded manually in manual_income_entries (not in bank data)
- FY2024-25 dividend: $51,298 each to Steve and Nicola (net cash); $17,099 each in franking credits recorded as Gov. & Tax
- Division 7A: director drawings treated as loans if not paid back within the year; handled by accountant

## The 4 CBA Accounts
All in DB (accounts table):
- Bills & Direct Debits — current_balance populated from CSV (~$1,127)
- Business Credit Card — NO balance in CSV (col 4 always empty in credit card exports)
- Nicola's Account — current_balance populated from CSV (~$25,586)
- Smart Awards — NO balance in CSV (col 4 always empty)

Net worth page shows "balance not available" for accounts with null current_balance.

## Key Source Files
- `src/lib/csvParser.ts` — CBA, NAB CC, Amex CSV parsers. CBA: no header row. NAB: 10-col with Merchant Name. Amex: 5-col, positive=spend (negated on import).
- `src/lib/cleanMerchant.ts` — TypeScript port of Python clean_merchant logic
- `src/lib/transferPatterns.ts` — Patterns for detecting internal transfers
- `src/lib/autoCategory.ts` — Keyword-based category guessing (18 categories incl. Government & Tax)
- `src/lib/categoryPipeline.ts` — processBatch() + upsertTransactions(); source field support
- `src/lib/subscriptionDetector.ts` — detectSubscriptions(); min 2 occurrences; excludes Shopping, Food & Groceries, Transport, Medical, Pets, Personal Care
- `src/lib/directorIncome.ts` — Detects incoming CBA credits matching payroll patterns; flags is_transfer=false, category='Director Income'
- `src/lib/xeroApi.ts` — Xero API client: getXeroConnection (with auto token refresh), getXeroBankTransactions (paginated, incremental via If-Modified-Since), getXeroAccounts
- `src/lib/xeroCategories.ts` — Maps Xero account types/codes to Hearth categories; parseXeroDate; cleanXeroMerchant
- `src/lib/ruleImpact.ts` — ruleImpact(keyword, transactions) impact preview utility
- `src/app/api/import/route.ts` — POST: parse CSV, processBatch, upsertTransactions, update current_balance
- `src/app/api/xero/auth/route.ts` — Xero OAuth redirect (state cookie for CSRF)
- `src/app/api/xero/callback/route.ts` — Xero OAuth callback; exchanges code for tokens; stores in xero_connections
- `src/app/api/xero/sync/route.ts` — POST: incremental sync from Xero; creates Xero (Business) account if needed
- `src/app/api/xero/status/route.ts` — GET: connection status
- `src/app/api/xero/connection/route.ts` — DELETE: disconnect Xero
- `src/app/api/manual-income/route.ts` — CRUD for manual_income_entries
- `src/app/api/admin/recategorise/route.ts` — POST: re-run auto-categorisation on uncategorised transactions

## CSV Format (CBA)
- Transaction/savings accounts: Date, Amount (negative=expense), Description, Balance — NO header row
- Credit card/rewards accounts: Date, Amount, Description, "" (empty balance col) — NO header row
- All exports: DD/MM/YYYY dates, amounts like "-23.14" or "+1.00"
- BankExtracts location: C:\dev\personal-assistant\BankExtracts\
  - BillsandDirectDebits.csv
  - Business CreditCard.csv
  - NicolaAccount.csv
  - SmartAwards.csv

## Testing Infrastructure
- **Vitest** installed and configured (vitest.config.ts at project root)
- `npm test` — run all tests
- `npm run test:watch` — watch mode
- `npm run test:coverage` — coverage report
- **285 tests passing** across 8 test files in src/lib/__tests__/:
  - csvParser.test.ts — import layer
  - cleanMerchant.test.ts — merchant name cleaning
  - transferPatterns.test.ts — transfer detection
  - autoCategory.test.ts — categorisation (incl. Government & Tax)
  - subscriptionDetector.test.ts — subscription detection
  - xeroCategories.test.ts — Xero category mapping, date parsing, merchant cleaning
  - groundTruth.fixtures.ts — placeholder (regenerate from /dev/training → Export)
  - groundTruth.test.ts — 80% accuracy gate (vacuously passes until fixtures populated)

## Auto-Categorisation Rules (keyword-based, src/lib/autoCategory.ts)
18 categories: Transport, Eating Out, Food & Groceries, Entertainment, Technology,
Health & Fitness, Medical, Insurance, Household, Shopping, Education, Travel,
Mortgage, Utilities, Charity, Pets, Personal Care, Business, Government & Tax

## What Shipped (April 22 2026 — Session 2: Business Structure + Xero)

### Account Scoping
- Added `scope` column to accounts table (household/business/investment)
- Spending, income, subscriptions, net worth all filter by scope='household'
- Business accounts excluded from headline metrics; shown in dashboard Business widget
- Migration: scripts/addAccountScope.sql (run in Supabase — done)

### Director Income Detection
- `src/lib/directorIncome.ts` — detects incoming CBA credits matching payroll patterns
- Sets is_transfer=false, category='Director Income' for wages/drawings
- Transfer visibility: is_transfer=true rows stored in DB (not skipped); Show excluded checkbox in /transactions

### Manual Income Entries
- New table: manual_income_entries (migration: scripts/addManualIncome.sql — run without RLS — done)
- New page: /settings/income-entries — list + add + delete manual income entries
- API: /api/manual-income (GET/POST/DELETE)
- Included in monthly income totals on dashboard and spending page
- FY2024-25 dividend data entered: 4 entries totalling $136,794

### Xero Integration (full transaction sync)
- OAuth 2.0 Web App registered in Xero Developer Portal
- New DB table: xero_connections (migration done, no RLS)
- New DB column: transactions.source ('csv'|'xero') (migration: scripts/addXeroSource.sql — done)
- New DB column: xero_connections.last_synced_at (migration: scripts/addXeroLastSynced.sql — done)
- Incremental sync via If-Modified-Since header; full history on first sync
- Xero scopes: accounting.banktransactions.read + accounting.settings.read (new granular scopes, required for apps created after March 2 2026)
- 1426 transactions synced from Brisbane Health & Technology full history
- New settings page: /settings/xero with Connect/Sync Now/Disconnect
- Env vars in Vercel: XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI

### Business Dashboard Widget
- Collapsed Business summary section on dashboard
- Shows business-scoped account totals separately from household

## What Shipped (April 22 2026 — Session 1: Ground Truth Evaluation System)

Overnight build — all 7 chunks delivered in one commit.

### New page: /dev/training (URL-only, NOT in nav)
- Label tab, Evaluate tab, Subscription Audit tab
- Seed now button → POST /api/dev/seed-training (top 100 merchants, 20 holdout)
- training_labels table migration: scripts/migrate_training_labels.sql (run in Supabase — PENDING)

### Steve's next actions for ground truth
1. Paste `scripts/migrate_training_labels.sql` into Supabase SQL editor (project npydbobvppfqdoiyiuar)
2. Visit https://app.hearth.money/dev/training and click "Seed now"
3. Work through Label tab — confirm or correct categories for each merchant
4. Once 20+ labels confirmed: click "Run evaluation" on Evaluate tab
5. Click "Export as test fixtures" → save output as src/lib/__tests__/groundTruth.fixtures.ts
6. Run `npm test` — the 80% gate will now be live

## Recent Commit History (latest first)
- a1dd774: "fix: add Accept: application/json header to Xero API calls"
- (incremental sync): "feat: incremental Xero sync using If-Modified-Since"
- 9fe3fe3: "fix: use new Xero granular scope accounting.banktransactions.read"
- dd94c0c: "fix: replace invalid accounting.accounts.read scope with accounting.settings.read"
- cee6e0b: "fix: unused req param lint errors in Xero routes"
- b95539c: "feat: Xero OAuth integration + transaction sync"
- 6f8a7f7: "feat: business summary widget on dashboard"
- 53afc86: "feat: manual income entries — table, API, settings UI, integrated into monthly totals"
- a3735cb: "feat: Director Income detection, Income badge, un-exclude action"
- 67704af: "feat: scope-aware metrics across spending, dashboard, subscriptions, net worth, transactions"

## Data State (April 22 2026)
- ~599 transactions from 4 CBA CSV imports (household accounts)
- 1426 transactions from Xero (Brisbane Health & Technology full history)
- 89+ merchant mappings in merchant_mappings table
- 4 manual income entries: FY2024-25 dividends ($51,298 × 2) + franking credits ($17,099 × 2)
- Bills & Direct Debits + Nicola's Account have real current_balance values
- Business Credit Card + Smart Awards have null current_balance (no balance in CBA credit card CSV exports)

## Current State (April 22 2026)
- **Tests:** 285 passing (8 test files)
- **Build:** clean
- **Live:** https://app.hearth.money deployed on Vercel
- **Xero:** Connected to Brisbane Health & Technology, 1426 transactions synced, incremental sync live

## Pending Work / Known Issues
1. **Set account scopes** — Go to Settings → Accounts and set: Xero (Business) → business; Business Credit Card → business; Business Amex → business. NAB CC → decide household or business.
2. **training_labels migration** — Run scripts/migrate_training_labels.sql in Supabase, then Seed now at /dev/training. (Ground truth system built but not yet seeded.)
3. **Xero categorisation cleanup** — Several Xero merchants miscategorised: STAN/Netflix → Entertainment (not Transport/Eating Out); KFC/Guzman → Eating Out (not Business). Fix via merchant mappings or autoCategory rules.
4. **Income shows $0 this month** — Wages/salary credits not in current month's imported CSVs. Manual income entries are annual (July 2024), so don't appear in April 2026 view. Need to import more recent CSVs or connect live bank feed.
5. **Subscriptions UI** — Add Confirm / Dismiss per row. Dismissed merchants → merchant_mappings with classification='Not a subscription'.
6. **Mappings sidebar nav** — /mappings only accessible via Settings. Should be in sidebar.
7. **BUG-001** — www.hearth.money redirect not configured.
8. **.gitattributes** — LF/CRLF warnings on every commit from Windows.
9. **Business Credit Card balance** — enter manually on Net Worth page.
10. **Goals page** — empty state, no goals added yet.
11. **Edit button on Income Entries** — currently delete-and-re-add only; should have inline edit.
12. **Net Worth overstated** — Xero (Business) account not yet scoped to business; may be inflating headline net worth figure until scope is set.
13. **Account management** — No delete account or bulk delete transactions in the app. Should be in Settings → Accounts: delete account (with confirmation + cascade delete transactions) and "Remove all transactions" per account.
14. **Xero force full re-sync** — No UI option to force a full re-sync (currently requires manually NULLing last_synced_at in Supabase). Add a "Full re-sync" button to Settings → Xero that clears last_synced_at and re-fetches all history.

## Git / Workflow Notes
- Use **Claude Code** for all code changes and git operations (NOT the Cowork sandbox)
- Use **Git Bash** (not PowerShell) for git commands
- Vercel auto-deploys on push to main
- All secrets in Vercel env vars — never in .env files
