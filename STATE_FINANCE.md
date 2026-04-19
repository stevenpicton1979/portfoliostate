# Finance Tracker — finance-tracker-red-delta.vercel.app

- Repo: stevenpicton1979/finance-tracker (main branch, private)
- Live: https://finance-tracker-red-delta.vercel.app
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Vercel + Supabase
- Supabase project: dqzqqfcepsqhaxovneen (Pro tier)
- Local dev path: C:\dev\personal-assistant\Finance Tracker

## What It Does
Replaces the old Python/Excel finance workflow. Reads CBA bank CSV exports, cleans merchant names, stores transactions in Supabase, and provides a web UI for reviewing, categorising, and analysing expenses.

## Database Schema
- **accounts** — 4 CBA accounts (Bills & Direct Debits, Business Credit Card, Nicola's Account, Smart Awards)
- **transactions** — raw imported rows; unique on (account_id, date, amount, description)
- **merchant_mappings** — persistent category/classification rules per merchant+account; `confirmed` boolean

## Key Files
- `src/lib/cleanMerchant.ts` — TypeScript port of Python clean_merchant logic (must match exactly)
- `src/lib/csvParser.ts` — CBA CSV parser (DD/MM/YYYY format, skip excluded rows, amount sign)
- `src/lib/llmCategory.ts` — Claude Haiku batch categorisation; falls back to keyword rules if no key
- `src/lib/autoCategory.ts` — keyword-based category guessing (fallback)
- `src/app/api/import/route.ts` — POST: parse CSV, insert transactions, batch LLM categorise new merchants
- `src/app/api/accounts/route.ts` — GET + POST (upsert by name)
- `src/app/api/admin/reset/route.ts` — token-protected reset (token: reset-finance-tracker-2026)

## Pages
- `/setup` — 3-step startup wizard (Import → Bills & Subscriptions → Review spending). Entry point for new installs. Root `/` redirects here when 0 transactions in DB.
- `/import` — drag-drop CSV upload, account selector, import summary
- `/transactions` — Review tab (merchant queue, Confirm All) + Browse tab (filter/search table)
- `/subscriptions` — recurring payment detection + confirmation; Confirm All in column header
- `/spending` — month picker, pie + bar charts, category drilldown with auto-scroll
- `/mappings` — admin view of all merchant_mappings; searchable, editable, deletable

## Auto-Categorisation
At import time: new merchants sent to `claude-haiku-4-5-20251001` in one batch call → ~96% hit rate in testing (193/201 merchants). Falls back to 20+ keyword rules. Categories saved to merchant_mappings with `confirmed=false`; user confirms in /transactions Review tab or wizard Step 3.

## Excluded Transaction Patterns (not imported)
TRANSFER TO/FROM, FAST TRANSFER, WDL ATM, MYCARD CREDIT, CITIBANK CREDIT, TAX OFFICE, BCC RATES, OVERDRAW FEE, DEBIT EXCESS, RETURN NO ACCOUNT, PAYMENT RECEIVED, DISPUTE ADJUSTMENT, INTNL TRANS. Also skips amount >= 0.

## Data State (as of initial load, April 2026)
- ~595 transactions imported from 4 CSV files
- 201 unique merchants detected; 193 auto-categorised by LLM (96%)
- Existing finance_tags.json mappings migrated via scripts/migrate-tags.ts
- Bank extract CSVs: C:\dev\personal-assistant\BankExtracts\

## Environment Variables (all in Vercel — never in .env files)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY (enables LLM categorisation; without it falls back to keywords)

## Known Issues / Git State (April 2026)
- Local git repo is behind GitHub (GitKraken index.lock prevents sandbox git pulls). Use GitHub web editor for commits, or `git fetch origin && git reset --hard origin/main` from a Windows terminal to sync locally.
- The `.git/config` and `.git/HEAD` files had null byte corruption in a previous session; both were rewritten cleanly.

## Recent Commit History
- 0872ef6: "fix: force-dynamic on subscriptions GET route to prevent stale caching" — READY on Vercel. Fixes persistence bug where Recurring page changes were lost on navigation.
- 85be950: "fix: force-dynamic on uncategorized + subscriptions GET routes to fix caching bug" — superseded by 0872ef6 (subscriptions route was truncated in 85be950)
- e88ed86: "Refactor merchant mapping logic in import route" — user mappings take full priority; LLM only runs for merchants with zero existing mapping (any account, any status). READY on Vercel.
- 663937ab: "Specify type for newMerchants Set" (TS fix — builds clean)
- d3a4579: "fix: distinguish real DB errors from duplicates in import; add errors counter"
- 32eb9f3: "ux: import progress stages, step 2 dismiss button, spending drilldown scroll + view link"
- 4b956b8: "fix: force-dynamic on home page so redirect checks DB on every request"
- ecb97ed: "fix: ts type cast and eslint warning blocking build"
- 3fe9538: "feat: startup wizard, LLM categorisation via Claude Haiku, account creation, DB reset endpoint"

## Bug Fix: Next.js Caching (April 2026)
Root cause of "changes not persisting" on Recurring and Transactions pages: Next.js 14 App Router statically caches GET route handlers that don't use the `request` parameter. POST saves were writing to Supabase correctly, but the GET on reload returned a stale cached response.
Fix: `export const dynamic = 'force-dynamic'` added to:
- `src/app/api/transactions/uncategorized/route.ts` (commit 85be950 / 0872ef6)
- `src/app/api/subscriptions/route.ts` (commit 0872ef6)
Note: `src/app/api/mappings/route.ts` was already safe (uses `req: NextRequest` parameter).

## Screen Test Results (April 2026)
All post-wizard screens verified working against live production data:
- /spending: $7,724.73 total, 16 categories, charts + drilldown scroll
- /transactions Review tab: 193/201 merchants categorised, 8 Smart Awards remaining
- /transactions Browse tab: filters, colour-coding, inline category/classification dropdowns
- /subscriptions (Recurring): 23+ auto-detected items (HCFHEALTH, NETFLIX, OPENAI, FITBOX, QLD URBAN UTIL, etc.)
- /mappings: 193 rules, searchable, Edit/Delete per row, transaction count column

## Pending / Future Work
- Basiq integration: will replace the manual merchant mapping step at import time (no action needed yet)
- 8 Smart Awards merchants still uncategorised — appear in Transactions Review queue
