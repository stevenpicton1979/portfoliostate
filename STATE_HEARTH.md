# Hearth App — app.hearth.money

- Repo: stevenpicton1979/hearth-app (main branch, public)
- Live: https://app.hearth.money
- Vercel project: prj_OcSfg66gnYWG5cDxBT5UJYEESgAb, team: stevenpicton1979s-projects (team_Qdp9yMqPc3iK7cfwbinI3OHy)
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts + Vercel + Supabase
- Supabase project: npydbobvppfqdoiyiuar (Hearth org, NEW project — NOT the old fzykfxesznyiigoyeyed Finance Tracker project)
- Local dev path: C:\dev\personal-assistant\hearth-app
- DEFAULT_HOUSEHOLD_ID: 00000000-0000-0000-0000-000000000001

## What It Does
Personal finance tracker replacing a fragile Python/Excel workflow. Reads CBA bank CSV exports,
cleans merchant names, stores transactions in Supabase, and provides a web UI for reviewing,
categorising, and analysing expenses. Replaces the old finance-tracker app entirely.

## App Pages
- `/` — Dashboard: net worth card, this-month spending, upcoming subscriptions, goals, recent transactions
- `/import` — Drag-drop CSV upload, account selector (existing or create new), import summary with spinner
- `/transactions` — 599 transactions, filterable table with inline category/classification editing
- `/spending` — Month picker, category pie + bar charts, drilldown
- `/subscriptions` — Auto-detected recurring payments (Active / Lapsed / All / Duplicates / Timeline tabs)
- `/net-worth` — Bank account balances, manual assets/liabilities, snapshot chart
- `/goals` — Financial goals with progress bars
- `/mappings` — Admin view of merchant_mappings (89 rules), searchable, editable
- `/settings` — Hub linking to accounts, budgets, categories, mappings, import, export

## Database Schema (Supabase project npydbobvppfqdoiyiuar)
- **accounts** — id, household_id, display_name, institution, account_type, current_balance (numeric), last_synced_at, is_active
- **transactions** — id, household_id, account_id, date, amount, description, merchant, category, classification, is_transfer; unique on (account_id, date, amount, description)
- **merchant_mappings** — id, household_id, merchant, category, classification, notes; unique on (household_id, merchant)
- **assets** — manual assets (property, super, etc.)
- **liabilities** — manual liabilities
- **net_worth_snapshots** — historical net worth snapshots
- **goals** — financial goals
- **training_labels** — PENDING MIGRATION; merchant benchmark dataset (status: pending/confirmed/actioned, holdout flag, suggested_rule); unique on (household_id, merchant)

## The 4 CBA Accounts
All in DB (accounts table):
- Bills & Direct Debits — current_balance populated from CSV (e.g. ~$1,127)
- Business Credit Card — NO balance in CSV (col 4 always empty in credit card exports)
- Nicola's Account — current_balance populated from CSV (e.g. ~$25,586)
- Smart Awards — NO balance in CSV (col 4 always empty)

Net worth page shows "balance not available" for accounts with null current_balance.

## Key Source Files
- `src/lib/csvParser.ts` — CBA CSV parser. Critical: CBA exports have NO header row (cba_4col_noheader format). Also exports extractBalance() for reading running balance from col 3.
- `src/lib/cleanMerchant.ts` — TypeScript port of Python clean_merchant logic
- `src/lib/transferPatterns.ts` — Patterns for skipping internal transfers
- `src/lib/autoCategory.ts` — Keyword-based category guessing (17 categories)
- `src/lib/categoryPipeline.ts` — processBatch() + upsertTransactions(); latter returns { inserted, duplicates, autoCategorised } from actual DB-inserted rows
- `src/lib/subscriptionDetector.ts` — detectSubscriptions(); requires min 2 occurrences; excludes Shopping, Food & Groceries, Transport, Medical, Pets, Personal Care (Eating Out removed to catch HelloFresh etc.)
- `src/lib/ruleImpact.ts` — ruleImpact(keyword, transactions) impact preview utility
- `src/app/api/import/route.ts` — POST: parse CSV, processBatch, upsertTransactions, update current_balance
- `src/app/net-worth/NetWorthClient.tsx` — shows "balance not available" for null current_balance accounts

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
- 215 tests passing across 5 test files in src/lib/__tests__/:
  - csvParser.test.ts (15 tests) — import layer
  - cleanMerchant.test.ts (28 tests) — merchant name cleaning
  - transferPatterns.test.ts (50 tests) — transfer detection
  - autoCategory.test.ts (81 tests) — categorisation
  - subscriptionDetector.test.ts (41 tests) — subscription detection incl. Myer bug regression; 10 new tests for better auto-categorisation rules

## Auto-Categorisation Rules (keyword-based, src/lib/autoCategory.ts)
17 categories: Transport, Eating Out, Food & Groceries, Entertainment, Technology,
Health & Fitness, Medical, Insurance, Household, Shopping, Education, Travel,
Mortgage, Utilities, Charity, Pets, Personal Care, Business

## What Shipped (April 22 2026 — Ground Truth Evaluation System)

Overnight build — all 7 chunks delivered in one commit (10fc59a → main).

### New page: /dev/training (URL-only, NOT in nav)
- **Label tab**: 80 non-holdout merchants from training_labels, pending-first sorted by spend.
  Progress bar, filter bar (All/Pending/Confirmed/Actioned/Mismatches only).
  Per-card inline edit: category, classification, income/transfer/subscription toggles,
  frequency dropdown, notes, Confirm button.
  Mismatch warning (yellow) with "Copy rule suggestion" + "Preview impact" buttons.
  Holdout cards are amber-tinted (reserved 20 merchants).
- **Evaluate tab**: Run evaluation button → category accuracy, dollar-weighted accuracy,
  transfer accuracy, rule coverage (vs confirmed labels). Failure table with spend data.
  Collapsible holdout section. Overfitting warning if holdout accuracy drops >10% below benchmark.
  "Export as test fixtures" → downloads groundTruth.fixtures.ts.
- **Subscription Audit tab**: Yes/No toggle per subscription. Precision/recall metrics.
  False positive and false negative lists.
- **Seed now** button on page: calls POST /api/dev/seed-training — seeds top 100 merchants,
  20 holdout (fnv32a hash % 5 === 0), idempotent.

### New database table: training_labels
- Apply `scripts/migrate_training_labels.sql` in Supabase SQL editor (project npydbobvppfqdoiyiuar)
- Schema: merchant, correct_category, correct_classification, is_income, is_transfer,
  is_subscription, subscription_frequency, notes, status, suggested_rule, holdout, labelled_at
- Unique constraint: (household_id, merchant)
- **NOT yet applied** — Steve needs to run the migration in Supabase SQL editor, then click "Seed now"

### New API routes
- `GET /api/dev/training-labels` — list all labels with transaction stats
- `PUT /api/dev/training-labels` — update a label
- `POST /api/dev/seed-training` — seed top 100 merchants from transactions
- `POST /api/dev/evaluate` — run accuracy evaluation against confirmed labels
- `GET /api/dev/training-export` — export confirmed labels as TypeScript fixtures
- `GET /api/dev/rule-impact?keyword=...` — preview how many transactions a keyword would match
- `GET /api/subscriptions` — expose detectSubscriptions as JSON API

### New test files
- `src/lib/__tests__/groundTruth.fixtures.ts` — placeholder (regenerate from /dev/training → Export)
- `src/lib/__tests__/groundTruth.test.ts` — 80% accuracy gate (vacuously passes until fixtures populated)
  Individual per-merchant tests use `test.skip` (informational only, don't gate CI)

### New library files
- `src/lib/ruleImpact.ts` — ruleImpact(keyword, transactions) utility

### Scripts
- `scripts/migrate_training_labels.sql` — SQL to paste in Supabase editor
- `scripts/seedTrainingLabels.ts` — CLI seed script (needs valid SUPABASE_SERVICE_ROLE_KEY)
- `scripts/applyTrainingSchema.ts` — programmatic migration runner (same requirement)

### Steve's next actions
1. Paste `scripts/migrate_training_labels.sql` into Supabase SQL editor (project npydbobvppfqdoiyiuar)
2. Visit https://app.hearth.money/dev/training and click "Seed now"
3. Work through Label tab — confirm or correct categories for each merchant
4. Once 20+ labels confirmed: click "Run evaluation" on Evaluate tab
5. Click "Export as test fixtures" → save output as src/lib/__tests__/groundTruth.fixtures.ts
6. Run `npm test` — the 80% gate will now be live

## What Shipped (April 21 2026 Sprint)

1. **ESLint build fix** — Removed unused `beforeEach`, `afterEach`, `vi` imports from `subscriptionDetector.test.ts`

2. **Mid-month spending comparison fix** — Dashboard and Spending page now compare to "same point last month" (day-adjusted) rather than the full prior month total. Label reads "vs same point last month".

3. **Auto net worth snapshots** — `/net-worth` page auto-inserts a snapshot on load if none exists for today. "Record snapshot" button shows "Recorded today" when already done. Chart now self-populates as users visit the page.

4. **Clickable spending categories** — Donut segments and category list rows on `/spending` navigate to `/transactions?category=...` with pre-applied filter.

5. **Income tracking + savings rate** — Spending page shows Income / Total spent / Net cards. Dashboard "This Month" card shows Income / Spent / Net with net surplus/deficit prominent and savings rate indicator (green ≥20%, amber 10–19%, red <10%).

6. **Budget prompts** — Spending page shows "Set budgets to track your spending limits →" when no budgets configured. Dashboard shows top 3 budget categories with colour-coded mini progress bars when budgets exist.

7. **Suggested budget amounts** — Settings → Budgets computes 3-month per-category average and pre-fills the amount field when a category is selected.

8. **Quick-categorise flow** — Amber "X uncategorised transactions this month / Fix uncategorised →" banner on Spending page. Modal shows top 10 uncategorised merchants by spend with category dropdown. Saving creates merchant mapping rules.

9. **Better auto-categorisation** — Added rules for: BWS/Dan Murphy's/Liquorland → Shopping; Alehouse/Espresso/Genovese/Hanaichi/Asian Delights → Eating Out; Carina Med/MED & SPEC → Medical; United Petrol → Transport. 10 new tests added.

## Recent Commit History (latest first)
- (April 21 2026): "state: update after April 21 2026 sprint — income tracking, budget progress, spending comparison fix, auto snapshots"
- e6f0d1e: "test: add Vitest + 205 unit tests for import/categorisation layers; fix subscription detection (min 3 occurrences, exclude Shopping/Eating Out/etc)"
- 85625c7: "fix: show 'balance not available' for accounts without CSV balance data (credit card / rewards)"
- 3054595: "fix: accurate auto-categorised count (new rows only) + loading spinner on import"
- b693828: "fix: remove unused firstDataLine param from detectFormat (lint error)"
- edf7d27: "fix: CBA CSV no-header detection, extractBalance utility, reset import form after submit" — ERROR build (lint), superseded by b693828
- c122eb8: "Fix BUG-002b, BUG-005, BUG-006, BUG-007"

## Bugs Fixed (Prior Sessions)
- **BUG-002** — Account column concatenation in DB. Fixed: import form clears accountName state after import. DB names fixed manually in Supabase Studio.
- **BUG-003** — Spending shows $0. Already fixed.
- **BUG-004** — Subscriptions shows 0. Already fixed.
- **BUG: $0 bank balances on Net Worth** — CBA CSV has no header row; parser was treating first data row as headers → wrong format detected → balance not extracted. Fixed: cba_4col_noheader format detection + extractBalance() utility.
- **BUG: auto_categorised count inflated** — was counting all transactions in batch with categories, including duplicates. Fixed: upsertTransactions now returns autoCategorised from actual DB-inserted rows via .select('id, category').
- **BUG: No loading feedback on import** — button only showed "Importing..." text. Fixed: added spinning SVG animation + "this may take a moment…" message.
- **BUG: Subscriptions showing Shopping merchants (Myer)** — algorithm had no category awareness and required only 2 occurrences. Fixed: EXCLUDED_CATEGORIES set + minimum 3 occurrences.
- **BUG: Net Worth showing $0 for credit card accounts** — null current_balance displayed as $0. Fixed: show "balance not available" for null values.

## Data State (April 2026)
- ~599 transactions imported from 4 CSV files
- 89 merchant mappings in merchant_mappings table
- Bills & Direct Debits + Nicola's Account have real current_balance values
- Business Credit Card + Smart Awards have null current_balance (no balance in CBA credit card CSV exports)

## Current State (April 22 2026)
- **Tests:** 238 passing (7 test files)
- **Build:** clean
- **Live:** https://app.hearth.money deployed on Vercel
- **Pending:** training_labels table not yet created in Supabase (Steve needs to run migration SQL)

## Pending Work / Known Issues
1. **Income shows $0** — Salary account may not be connected via Basiq, or salary transactions aren't in the imported CSVs. The income feature is wired up and working; it just needs the data.
2. **Subscriptions UI** — Add Confirm / Dismiss (Not a subscription) buttons per row. Dismissed merchants saved to merchant_mappings with classification='Not a subscription'. Remove PROBABLE/HIGH/MEDIUM labels, replace with "Unconfirmed" badge.
3. **Mappings sidebar nav** — /mappings has no direct nav link; only accessible via Settings. Should be in sidebar.
4. **BUG-001** — www.hearth.money redirect (non-www to www or vice versa) not configured.
5. **SSL certificate** — app.hearth.money had a privacy error earlier; recheck.
6. **Intermittent 503s** — RSC streaming requests occasionally 503 on Vercel cold starts; pages render correctly despite this. Monitor.
7. **.gitattributes** — LF/CRLF warnings on every commit from Windows. Add .gitattributes to fix.
8. **Business Credit Card balance** — user needs to enter manually on Net Worth page (no balance in CSV).
9. **Goals page** — empty state, no goals added yet.

## Git / Workflow Notes
- Use **Claude Code** for code changes and git operations (not Cowork sandbox)
- Use **Git Bash** (not PowerShell) for git commands
- Vercel auto-deploys on push to main
- The sandbox workspace (great-dazzling-tesla) was locked by a stuck `gh auth login` process in a previous session — restart Cowork if bash hangs
