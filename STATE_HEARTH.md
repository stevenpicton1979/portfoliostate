# Hearth App — Session State
_Last updated: 2026-05-02 (session 2)_

## What Hearth is
Personal finance app (Next.js 14 + Supabase + Xero). Tracks household transactions, categorises them, links to Xero for business bank feed. Business transactions come exclusively from Xero. Personal transactions come from CSV bank extracts only. No overlap.

## Taxonomy design

The full classification of any transaction is expressed by four fields together:

```
owner          → realm   (Business | Steven | Nicola | Joint)
isIncome       → direction  (true = Income, false = Expenses)
isSubscription → sub-bucket within Expenses
category       → leaf node  (canonical string from src/lib/categories.ts)
```

Category is ALWAYS the leaf node — never the realm. `owner` already encodes the entity. Transfer rules use `category: null` — the only permitted null.

**Director Income semantics:** money drawn from BHT into the joint account. Owner is always `'Joint'` because the Steve/Nicola split is determined by the accountant at year-end for tax efficiency. Hearth does not pre-allocate it to an individual.

## Completed this session

### Task 16 — merchant_mappings source column (done ✅)
- `merchant_mappings` now has a `source TEXT NOT NULL DEFAULT 'auto'` column
- Pipeline only loads `source = 'manual'` rows before named rules — stale auto entries never shadow rules
- Named rules no longer write to `merchant_mappings` (removed autoMappings.set from ruleResult branch)
- Keyword fallback still writes to `merchant_mappings` with `source: 'auto'`
- All user-facing API routes (PUT/PATCH /api/mappings, POST /api/transactions/[id]/categorise) set `source: 'manual'`
- DB migration: `ALTER TABLE merchant_mappings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'auto'`
- 590 tests passing after this task

### Task 17 — canonical category taxonomy (done ✅)
- New file: `src/lib/categories.ts` — `Category` union type with 23 canonical leaf strings
- `MerchantCategoryRule`, `RuleResult`, `ProcessedTransaction` all use `Category | null` — TypeScript enforces the taxonomy at every write point
- Rule category changes:
  - `bell_partners`: `'Business'` → `'Accounting'`
  - `xero_misc_code`: `'Business'` → `'Office Expenses'`
  - `invoice_income`, `oncore_income`, `crosslateral_income`: `'Business'` → `'Business Revenue'`
- Pipeline fallback changes:
  - ATO BPAY fallback: `'Business'` → `'Government & Tax'`
  - GST fallback: `'Business'` → `'Office Expenses'`
- Director income classification fixed: `null` → `'Joint'`
- `xeroCategories.ts`: added `GL_NAME_TO_CANONICAL` map + `mapGlNameToCanonicalCategory()` function
- Schema validation test: asserts every rule's category is in CATEGORIES or null
- 8 GL-name mapping tests added
- 599 tests passing after this task

### Previously completed this session

#### Rules engine fingerprint expansion (done ✅)
- `MerchantCategoryRule` output expanded from 2 fields to 5: `{ category, isIncome, isTransfer, isSubscription, owner }`
- `RuleContext` cleaned up: removed unused `amount` and `accountScope`
- All 16 rules updated with explicit `output` object

#### Taxonomy decisions
- Spotify, Xbox, Steam → `category: 'Entertainment', owner: 'Business'`
- Google One → `category: 'Technology', owner: 'Business', isSubscription: true`
- Rules checking `ctx.isIncome` output explicit `isIncome: true/false` (not null)

#### is_subscription column (done ✅)
- DB migration: `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN NOT NULL DEFAULT FALSE`
- All three upsert paths in `categoryPipeline.ts` include `is_subscription`

#### New dev pages (done ✅)
- `/dev/reconcile` — Xero data reconciliation report (⚠️ DB count bug: Task 14)
- `/dev/coverage` — Transaction coverage inspector (fully updated, see Task 15 below)

#### Previously completed (prior session)
- Named merchant rules engine, `matched_rule` column, `/dev/rules` page
- cleanXeroMerchant fix, per-account pagination, CSV/Xero dedup fix

## Current rules in `merchantCategoryRules.ts`
| Rule name | Trigger | Category | isIncome | isTransfer | isSub | owner |
|-----------|---------|----------|----------|------------|-------|-------|
| `ato_payments` | merchant ∋ "ato" | Government & Tax | null | false | false | null |
| `airbnb` | merchant ^= "airbnb" | Travel | null | false | false | null |
| `uber` | merchant ^= "uber" | Transport | null | false | false | null |
| `bell_partners` | merchant ∋ "bell partners" | Accounting | null | false | false | Business |
| `invoice_income` | merchant = "INVOICE" + isIncome | Business Revenue | true | false | false | Business |
| `oncore_income` | merchant ∋ "oncore" + isIncome | Business Revenue | true | false | false | Business |
| `crosslateral_income` | merchant ∋ "crosslateral" + isIncome | Business Revenue | true | false | false | Business |
| `superannuation_payable` | glAccount ∋ "superannuation payable" | Payroll Expense | null | false | false | Business |
| `income_tax_provision` | glAccount ∋ "income tax" | Government & Tax | null | false | false | Business |
| `xero_misc_code` | merchant = "MIS" (legacy) | Office Expenses | null | false | false | null |
| `google_one` | merchant ∋ "google one" | Technology | null | false | true | Business |
| `steam_games` | merchant ∋ "steamgames" | Entertainment | null | false | false | Business |
| `xbox` | merchant ∋ "xbox" | Entertainment | null | false | true | Business |
| `spotify` | merchant ∋ "spotify" | Entertainment | null | false | true | Business |
| `bht_directors_loan_transfer` | glAccount ∋ "directors loan" | null (transfer) | null | true | false | null |
| `director_loan_repayment` | merchant ∋ "steven/nicola picton" + isIncome | null (transfer) | null | true | false | null |

## Pipeline priority order
1. Director income rules (highest — fires before transfer check)
2. Transfer detection (pattern match + forced_is_transfer flag)
3. Named merchant category rules that resolve to isTransfer: true
4. Manual `merchant_mappings` entries (`source = 'manual'` only)
5. Named merchant category rules (category output)
6. `category_hint` / GL account hint from Xero
7. Keyword fallback (`guessCategory`) — writes `source: 'auto'` to merchant_mappings

## Repeatable reset runbook
```bash
curl -s -X POST "https://app.hearth.money/api/admin/wipe-business-transactions?confirm=true"
curl -s -X POST "https://app.hearth.money/api/xero/sync?full=true"
```
(fix-mis-merchants no longer needed — full sync re-processes all rules fresh)

## Key files
| File | Purpose |
|------|---------|
| `src/lib/categories.ts` | Canonical Category type — all allowed leaf category strings |
| `src/lib/merchantCategoryRules.ts` | Named rules engine — add all new rules here |
| `src/lib/categoryPipeline.ts` | `processBatch` + `upsertTransactions` |
| `src/lib/directorIncome.ts` | Director income detection (fires before transfer check) |
| `src/lib/reconcile.ts` | Pure reconciliation functions |
| `src/lib/coverageReport.ts` | Pure coverage aggregation functions |
| `src/lib/xeroCategories.ts` | `cleanXeroMerchant`, `mapGlNameToCanonicalCategory`, GL→canonical map |
| `src/lib/xeroApi.ts` | Xero API client |
| `src/app/api/xero/sync/route.ts` | Main Xero sync — `?full=true` for deep sync |
| `src/app/dev/reconcile/page.tsx` | Reconciliation UI |
| `src/app/dev/coverage/page.tsx` | Coverage inspector UI |
| `src/app/api/admin/wipe-business-transactions/route.ts` | Full business data wipe |
| `src/lib/__tests__/merchantCategoryRules.test.ts` | Rule tests — all 16 rules, all 5 output fields + schema validation |

### Task 15 — Coverage inspector three-state match status + search (done ✅)
- `MatchStatus` type: `'rule' | 'gl' | 'unmatched'`
  - `'rule'` — a named rule fired (`matched_rule` non-null)
  - `'gl'` — no named rule, but Xero GL hint provided the category (`gl_account` non-null)
  - `'unmatched'` — no rule, no GL hint — genuine gap needing attention
- `buildCoverageRows` in `coverageReport.ts` computes `matchStatus` per merchant
- API route accepts `status=rule|gl|unmatched`; `unmatched=true` kept as backwards-compatible alias
- UI: checkbox → segmented control (All / Rule / GL / Unmatched); default view = Unmatched
- Three-count summary: "X rule matched, Y GL covered, Z unmatched"
- Colour-coded `MatchStatusBadge` per state
- Merchant name search input — client-side, real-time, case-insensitive
- 7 new matchStatus tests in coverageReport.test.ts, 2 new status-filter tests in coverageRoute.test.ts
- 608 tests passing after this task

### Task 14 — Reconcile page DB count fix (done ✅)
- Was filtering `.eq('source', 'xero')` — source column defaults to 'csv', sync wasn't setting it → zero counts
- Fixed: use `.not('external_id', 'is', null)` as Xero discriminator; sync now sets `source: 'xero'` explicitly
- Also fixed: DB count was capped at 1,000 (Supabase default). Fixed with `{ count: 'exact' }` + `.limit(10000)`
- 612 tests passing after this task

### Reconcile Xero count fix (done ✅)
- `getXeroBankTransactionCount` paginates 100/page; BHT needs 50 sequential calls ≈ 25s → serverless timeout → null for all accounts
- **Proper fix:** store `last_xero_sync_count` + `last_xero_synced_at` on `accounts` table; written at end of each full sync from `raws` array (already RECEIVE-TRANSFER filtered)
- Reconcile route reads stored count — no live Xero API calls; `getXeroBankTransactionCount` deleted from `xeroApi.ts`
- Reconcile UI gains "Synced" column showing date of last full sync
- DB migration: `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_xero_sync_count INTEGER, ADD COLUMN IF NOT EXISTS last_xero_synced_at TIMESTAMPTZ`
- **⚠️ Migration must be run in Supabase dashboard before deploying**
- **After deploy: run full sync to populate counts** — `curl -s -X POST "https://app.hearth.money/api/xero/sync?full=true"`
- 612 tests passing

## DB schema notes
- `transactions.external_id` — unique, nullable. Xero: BankTransactionID. CSV: null.
- `transactions.matched_rule` — which named rule fired, e.g. `merchant:oncore_income`
- `transactions.gl_account` — Xero chart-of-accounts name
- `transactions.is_subscription` — BOOLEAN NOT NULL DEFAULT FALSE
- `transactions.raw_description` — TEXT nullable. Xero: pipe-separated context fields.
- `transactions.source` — 'xero' or 'csv'
- `merchant_mappings.source` — 'manual' | 'auto'. Pipeline only reads 'manual' rows.
- `accounts.last_xero_sync_count` — INTEGER nullable. Set at end of each full sync.
- `accounts.last_xero_synced_at` — TIMESTAMPTZ nullable. Set at end of each full sync.
- Business accounts: `institution = 'Xero'` OR `scope = 'business'`
- Personal accounts: `scope = 'household'`, CSV only

### Named rules — personal merchants batch 1 (done ✅)
17 new rules added covering top unmatched personal CSV merchants:
- Personal income: `salary_nicola_education_qld` (Nicola's salary, owner: Nicola, isIncome: true)
- Education: `mansfield_state_high` (school canteen → Eating Out), `learning_ladders` (isSubscription)
- Health & Fitness: `fitness_passport`, `fitstop`, `fitbox`, `ironfist_gym` (all isSubscription where applicable)
- Insurance: `hcf_health_insurance`, `hospitals_contribution`, `clearview_insurance` (all isSubscription)
- Utilities/Gov: `qld_urban_utilities`, `brisbane_city_council`, `bcc_rates`, `qld_transport_rego`
- Food: `the_bread_corner` (fixes wrong Business autoCategory)
- Technology: `apple_bill` (isSubscription)
- Transport: `translink`
- Two new categories added to `categories.ts`: `Health & Fitness`, `Food & Groceries`
- `reprocess-csv` endpoint created: `POST /api/admin/reprocess-csv` — re-applies pipeline rules to all 852 existing CSV transactions via UPDATE by ID
- 647 tests passing after this work

### Task 18 — Outcome bucket grouping (done ✅)
- `getOutcomeBucket()` in `src/lib/categories.ts` — maps (owner, isIncome, isSubscription, category) → string[] hierarchy
- `GET /api/dev/buckets` — groups transactions by bucket, sums amounts, accepts `?months=N` (default 12, max 36)
- `/dev/buckets` page — collapsible tree grouped by realm → sub-bucket → leaf, period selector (3/6/12m)
- 647 tests passing

### Named rules — batch 2 (done ✅)
25 rules: ALDI, Woolworths, Coles, IGA, The Source, Hanaro Trading, Little Genovese, GYG, KFC, McDonald's, Old Mr Rabbit, Asian Delights, RiverCity Catering, Dicky Beach Seafood, Carina Medical Specialists, Metropol Pharmacy, Medibank Private, Carindale Vet, Target, Myer, The Reject Shop, Hubbl/Binge, Mater Lotteries, CommBank internal transfer.
Deployed: `f440220` (after fixing null byte c