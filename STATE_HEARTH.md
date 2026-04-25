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
- `/settings/xero` — Xero OAuth connection + Sync Now + Full Re-sync buttons
- `/business` — Business P&L: revenue, expenses, net profit by category, top merchants, recent transactions
- `/dev/training` — Ground truth labelling UI (URL-only, not in nav)

## Database Schema (Supabase project npydbobvppfqdoiyiuar)
- **accounts** — id, household_id, display_name, institution, account_type, current_balance (numeric), last_synced_at, is_active, scope ('household'|'business'|'investment', default 'household')
- **transactions** — id, household_id, account_id, date, amount, description, merchant, category, classification, is_transfer, source ('csv'|'xero'), raw_description TEXT; unique on (account_id, date, amount, description)
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
- Brisbane Health Tech (Xero) → business (auto-created by Xero sync — set scope in Settings → Accounts)
- Mastercard Bus. Plat. (Xero) → business (auto-created by Xero sync — set scope in Settings → Accounts)
- NAB CC / Business Amex → business

## Xero Integration
- Connected to: Brisbane Health & Technology Pty Ltd (tenant: set in xero_connections)
- Auth: OAuth 2.0 Web App, Client ID/Secret in Vercel env vars (XERO_CLIENT_ID, XERO_CLIENT_SECRET)
- Redirect URI: https://app.hearth.money/api/xero/callback (set in XERO_REDIRECT_URI env var)
- Scopes: openid profile email accounting.banktransactions.read accounting.settings.read offline_access
- Sync: incremental via If-Modified-Since header; full history on first sync
- Per-bank-account: creates separate Hearth accounts keyed by Xero BankAccount.AccountID + Name
  - "Brisbane Health Tech" — main business bank account
  - "Mastercard Bus. Plat." — business credit card
- Transactions from Xero scoped as 'business', source='xero'
- SPEND-TRANSFER → is_transfer=true; RECEIVE-TRANSFER skipped (avoids duplicates)
- Category mapping: xeroCategories.ts — AccountCode lookup first (AU standard chart), then type/keyword fallback
  - 477/478 → Director Income, 493 → Transport, 489/490 → Technology, 420 → Eating Out, etc.
- EQUITY/drawings accounts → Director Income; REVENUE → Business; EXPENSE by code then keyword

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
- `src/lib/xeroCategories.ts` — Maps Xero account types/codes to Hearth categories; parseXeroDate; cleanXeroMerchant; mapXeroAccountToCategory (AccountCode lookup); mapXeroTransactionClassification; shouldScopeAsHousehold
- `src/lib/ruleImpact.ts` — ruleImpact(keyword, transactions) impact preview utility
- `src/app/api/import/route.ts` — POST: parse CSV, processBatch, upsertTransactions, update current_balance
- `src/app/api/xero/auth/route.ts` — Xero OAuth redirect (state cookie for CSRF)
- `src/app/api/xero/callback/route.ts` — Xero OAuth callback; exchanges code for tokens; stores in xero_connections
- `src/app/api/xero/sync/route.ts` — POST: incremental sync from Xero; per-bank-account separation; SPEND-TRANSFER handling; AccountCode category mapping
- `src/app/api/xero/status/route.ts` — GET: connection status
- `src/app/api/xero/connection/route.ts` — DELETE: disconnect Xero
- `src/app/api/manual-income/route.ts` — CRUD for manual_income_entries
- `src/app/api/admin/recategorise/route.ts` — POST: re-run auto-categorisation on uncategorised transactions
- `src/app/api/business/summary/route.ts` — GET ?month=YYYY-MM: business-scoped P&L summary
- `src/app/business/page.tsx` — Business P&L page

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
- **303 tests passing** across 8 test files in src/lib/__tests__/:
  - csvParser.test.ts — import layer
  - cleanMerchant.test.ts — merchant name cleaning
  - transferPatterns.test.ts — transfer detection
  - autoCategory.test.ts — categorisation (incl. Government & Tax)
  - subscriptionDetector.test.ts — subscription detection
  - xeroCategories.test.ts — Xero category mapping, date parsing, merchant cleaning, AccountCode mapping
  - groundTruth.fixtures.ts — placeholder (regenerate from /dev/training → Export)
  - groundTruth.test.ts — 80% accuracy gate (vacuously passes until fixtures populated)

## Auto-Categorisation Rules (keyword-based, src/lib/autoCategory.ts)
18 categories: Transport, Eating Out, Food & Groceries, Entertainment, Technology,
Health & Fitness, Medical, Insurance, Household, Shopping, Education, Travel,
Mortgage, Utilities, Charity, Pets, Personal Care, Business, Government & Tax

## Known TypeScript Gotcha
- `tsconfig.json` has a low `target` — Set and Map iteration with `for...of` fails at build time.
- Fix: use `Array.from(set)` / `Array.from(map.entries())` instead of direct iteration.
- Set: `new Set(prev); next.add(x)` not `new Set([...prev, x])`

## What Shipped (April 25 2026 — Transfer linking + Training UI)

### Transfer linking (linked_transfer_id)
- New column: `transactions.linked_transfer_id UUID REFERENCES transactions(id) ON DELETE SET NULL`
- Index: `idx_transactions_linked_transfer_id WHERE linked_transfer_id IS NOT NULL`
- Migration: `supabase/migrations/009_linked_transfer_id.sql` (run in Supabase — done)
- `src/lib/transferLinker.ts` — `linkTransferPairs(dates)`: matches same-date, opposite-amount, different-account rows; at least one side must be `is_transfer=true`; updates both rows with each other's id
- Called after CSV import and after Xero sync for affected dates

### Training UI — rich transaction context
- `GET /api/dev/merchant-examples` redesigned:
  - Explicit column select including `linked_transfer_id`
  - Transfer rows bypass de-dup (was losing linked_transfer_id pairs)
  - Two-step account name resolution: linked tx → account_id → display_name
  - Sets `transfer_destination` on each transfer example
  - Returns `_debug_linked_id` and `_debug_dest` fields (still present — remove when confident)
- `ExampleCard` in `/dev/training` shows expandable detail panel:
  - FROM / TO / WHEN / AMOUNT / SOURCE / RAW / DBG fields
  - Credit transactions: FROM/TO labels swapped (money IN means linked account is sender)
  - `toLabel = transferDest || merchant` (does not require `is_transfer` flag to be set)
  - Debug line (orange) shows raw lid= and dest= values from API

### Account owner field
- `accounts.owner` column: 'Steven' | 'Nicola' | 'Joint' | 'Business'
- Migration: `supabase/migrations/008_account_owner.sql` (run — done)
- Training UI classification dropdown pre-fills based on account owner

### Xero sync fixes (this session)
- `composeXeroRawDescription` now actually called in sync route (was defined but never imported)
- `raw_description` includes BankAccount name as last pipe segment
- Full Re-sync fixed: POST() now accepts `NextRequest`; `?full=true` properly read (was ignored)
- Cross-account dedup moved to `/api/xero/dedup` endpoint (avoids Vercel timeout on sync)

### Director income fix
- Removed `/\bsalary\b/i` and `/\btransfer\s+from\b/i` from `DIRECTOR_INCOME_PATTERNS` in `directorIncome.ts`
- Was incorrectly firing on Nicola's "SALARY EDUCATION QLD" and inter-account transfers

### Data state (April 25 2026)
- Tests: 327 passing
- D E transfer card: Feb 2026 → Bills & Direct Debits ✓, June 2025 → Nicola's Account ✓
- Feb 2025 D E row: lid=null (counterpart CSV not imported for that period — not a code issue)
- Debug lines intentionally left in training UI until Steve confirms correct across all cards

## What Shipped (April 23 2026 — Items 8 & 9: raw_description + Skip button)

### 8. raw_description column
- Added `raw_description TEXT` column to transactions (nullable); run `scripts/addRawDescription.sql` in Supabase
- Xero sync composes raw_description from: ContactName | Reference | Narration | LineItem[0].Description (pipe-joined, max 300 chars) via new `composeXeroRawDescription()` in xeroCategories.ts
- CSV import stores original pre-clean description as raw_description
- merchant-examples endpoint returns raw_description (richer context) when available; falls back to description
- Transaction table shows raw_description as hover tooltip on merchant name
- 6 new tests for composeXeroRawDescription (303 tests total)
- **Action needed:** Run `scripts/addRawDescription.sql` migration in Supabase, then Full Re-sync from Settings → Xero

### 9. Training card — Skip button
- Each pending merchant card now has a "Skip" button alongside Confirm
- Skip hides the card for the current session only (client-side state, not persisted)
- "N skipped this session" count shown near filter bar
- Skipped cards reappear on next page load

---

## What Shipped (April 22 2026 — Overnight Backlog: Nav + Subscriptions + Xero + Income + Training)

All 7 BACKLOG.md items delivered in a single overnight session.

### 1. Removed debug endpoint
- Deleted `src/app/api/xero/debug/route.ts` (temporary Xero raw data endpoint)

### 2. `.gitattributes` — LF line endings
- Added `.gitattributes` at repo root; eliminates CRLF warnings on every commit from Windows

### 3. Mappings in sidebar nav
- `/mappings` now directly accessible in sidebar between Subscriptions and Net Worth
- Uses `TagIcon` from heroicons; added to Sidebar.tsx, BottomNav.tsx, and navItems.ts

### 4. Subscriptions — Confirm and Dismiss per row
- Each subscription row (Active/Lapsed/All tabs) now has **Confirm** and **Dismiss** buttons
- Confirm → writes `classification='Subscription'` to merchant_mappings via PATCH upsert
- Dismiss → writes `classification='Not a subscription'`; dismissed merchants filtered out server-side on next load
- Added PATCH upsert endpoint to `POST /api/mappings` (fixed the broken POST-with-body pattern that existed)
- Dismissed merchants filter applied in `SubscriptionsPage` before passing to client

### 5. Xero Full Re-sync button
- "Full Re-sync" button added to Settings → Xero alongside existing "Sync Now"
- Uses `POST /api/xero/sync?full=true` — NULLs `last_synced_at` then runs standard sync
- Saves having to manually run SQL in Supabase for a full re-sync
- Added `NextRequest` param to sync route; `?full=true` handled at the top

### 6. Inline edit for Income Entries
- Each income entry row now has an Edit (pencil) button
- Expands row to full-width inline form with all fields: date, amount, description, category, recipient, financial_year
- Save calls `PUT /api/manual-income` (new endpoint added); Cancel reverts to read-only
- Delete behaviour unchanged

### 7. Training card — example transaction descriptions
- Each merchant card on `/dev/training` now shows up to 3 distinct raw transaction `description` values
- Fetched lazily on mount via `GET /api/dev/merchant-examples?merchant=X`
- Displayed in italics under the date range / accounts metadata

## What Shipped (April 22 2026 — Session 3: Xero Data Quality + Business P&L)

### Xero Sync Improvements
- **Per-bank-account separation** — creates one Hearth account per Xero BankAccount (Brisbane Health Tech + Mastercard Bus. Plat.) instead of a single "Xero (Business)"
- **Transfer dedup** — RECEIVE-TRANSFER skipped; SPEND-TRANSFER stored with is_transfer=true
- **AccountCode category mapping** — comprehensive AU chart of accounts code → Hearth category lookup in mapXeroAccountToCategory; far more accurate than keyword-only
- **Richer merchant names** — cleanXeroMerchant: lineItem description > reference > contactName > narration priority
- **Date fix** — parseXeroDate now handles both /Date(ms)/ and ISO 8601 formats
- **Fix: Map iteration** — replaced `for...of map` with `Array.from(map.entries())` (TypeScript target limitation)
- DB cleanup + full re-sync performed: old Xero transactions/accounts deleted, last_synced_at NULLed, re-synced

### Business P&L Page
- New page: `/business` — revenue, expenses, net profit, expense by category chart, top merchants, recent transactions
- New API: `/api/business/summary?month=YYYY-MM`

### Ground Truth Training
- training_labels migration run in Supabase (done)
- Seeded: 264 merchants, 58 holdout reserved
- Steve has confirmed ~7 labels so far; working through Label tab at /dev/training

### Debug Cleanup Needed
- `src/app/api/xero/debug/route.ts` — temporary debug endpoint, should be deleted (in BACKLOG)

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
- training_labels table migration: scripts/migrate_training_labels.sql (run in Supabase — done)

## Recent Commit History (latest first)
- 3473fe7: "feat: add raw_description support and comprehensive tests"
- fbf18d1: "chore: mark all backlog items complete"
- f0bad3d: "feat: show example transaction descriptions on training label cards"
- c7b41a4: "feat: inline edit for income entries with PUT /api/manual-income"
- 67db50a: "feat: Xero full re-sync button (POST /api/xero/sync?full=true nulls last_synced_at)"
- e3aba0c: "feat: subscription Confirm and Dismiss actions with merchant_mappings persistence"
- b370aa3: "feat: add Mappings to sidebar navigation with tag icon"
- 6ca905b: "chore: remove debug endpoint and add .gitattributes for LF line endings"
- 2130f3c: "fix: Map iteration downlevelIteration error in Xero sync route"
- 0b1bd4f: "feat: Xero sync improvements — transfer detection, AccountCode category mapping, per-bank-account separation"
- d4c1bd3: "debug: temporary Xero raw data endpoint (remove after debugging)"
- b27d53c: "feat: richer Xero transaction descriptions using line item, narration, and bank account fields"
- 93ff62e: "fix: Set iteration and Business P&L build errors"
- 707a21c: "fix: always show Confirm button on pending training label cards"
- 4afb5ec: "feat: Business P&L page with revenue, expenses, net profit by category"
- dc1fd90: "fix: recentlyConfirmed override only applies on Pending filter"
- b27c099: "fix: parseXeroDate handles ISO 8601 dates from Xero API"
- a1dd774: "fix: add Accept: application/json header to Xero API calls"

## Data State (April 22 2026)
- ~599 transactions from 4 CBA CSV imports (household accounts)
- Xero transactions re-synced: now split across Brisbane Health Tech + Mastercard Bus. Plat. accounts
- 89+ merchant mappings in merchant_mappings table
- 4 manual income entries: FY2024-25 dividends ($51,298 × 2) + franking credits ($17,099 × 2)
- Bills & Direct Debits + Nicola's Account have real current_balance values
- Business Credit Card + Smart Awards have null current_balance (no balance in CBA credit card CSV exports)
- training_labels: 264 merchants seeded, 58 holdout, ~10 confirmed (working through Label tab)
- Merchants needing Xero lookup before labelling: "STEVEN PICTON" ($4,711 income, 2 txns), "D E" ($22,000 income, 2 txns)

## Current State (April 23 2026 — BACKLOG items 8 & 9 complete)
- **Tests:** 316 passing (9 test files, up from 297)
- **Build:** clean
- **Live:** https://app.hearth.money deployed on Vercel
- **Xero:** Connected to Brisbane Health & Technology, re-synced with per-account separation + AccountCode mapping
- **raw_description:** Column implementation complete, Xero sync composes ContactName | Reference | Narration | LineItem, CSV import stores original description

## What Shipped (April 23 2026 — BACKLOG items 8 & 9)

### BACKLOG Item 8 — raw_description column (COMPLETE)
- Migration file created: `scripts/addRawDescription.sql` (adds TEXT column, nullable)
- Xero sync (`src/app/api/xero/sync/route.ts`): Composes raw_description from ContactName | Reference | Narration | LineItem[0].Description (max 300 chars)
- CSV import (`src/app/api/import/route.ts`): Stores original bank description in raw_description
- Both paths already pass raw_description through categoryPipeline.ts and upsertTransactions
- Training UI (`/dev/training`): Already displays examples from merchant-examples endpoint, which returns raw_description values
- Added 8 comprehensive unit tests for composeXeroRawDescription function
- **NEXT STEP:** Run migration in Supabase: `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS raw_description TEXT;`
- **NEXT STEP:** After deploy, go to Settings → Xero → Full Re-sync to backfill raw_description on Xero transactions

### BACKLOG Item 9 — Skip button on training cards (COMPLETE)
- Skip button already implemented on training cards at `/dev/training`
- Client-side state management: clicking Skip hides card and shows "N skipped this session" count
- Merchant remains as status='pending' in DB (not persisted)
- Skipped cards reappear on next page load
- Implementation found in `src/app/dev/training/page.tsx` lines 282-287

### Tests Added
- Added `src/lib/__tests__/rawDescription.test.ts` with 13 tests total:
  - 8 tests for composeXeroRawDescription (compose, filter, truncate, order)
  - 5 tests for raw_description in RawTransaction and ProcessedTransaction types
- Fixed truncated `src/lib/xeroCategories.ts` file (encoding issue from Windows)
- All 316 tests passing (was 297, added 13 new + fixed 8 xeroCategories tests that weren't running)

## Pending Work / Known Issues

1. **Ground truth labelling** — Steve is actively working through /dev/training. Once 20+ labels confirmed, export fixtures → activate 80% gate. "D E" = director loan repayments from personal accounts to Brisbane Health Tech (Transfer, Business). "STEVEN PICTON" still needs lookup.
2. **Training debug lines** — Remove `_debug_linked_id`, `_debug_dest` from merchant-examples/route.ts and the DBG row from ExampleCard in page.tsx once Steve is confident transfer display is correct across all cards.
3. **Feb 2025 D E transfer** — $10,000 from an unknown personal account to Brisbane Health Tech; counterpart CSV not imported for that period. Not a code issue.
4. **Import more recent CSVs** — Income shows $0 this month because current month's CSVs haven't been imported.
5. **Set account scopes** — Brisbane Health Tech → business, Mastercard Bus. Plat. → business in Settings → Accounts.
6. **BUG-001** — www.hearth.money redirect not configured.
7. **Goals page** — empty state, no goals added yet.
8. **Account management** — No delete account / bulk delete transactions in the app yet.

## Git / Workflow Notes
- Use **Claude Code** for all code changes and git operations (NOT the Cowork sandbox)
- Use **Git Bash** (not PowerShell) for git commands
- Vercel auto-deploys on push to main
- All secrets in Vercel env vars — never in .env files
