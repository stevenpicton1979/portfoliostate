# Hearth App — Session State
_Last updated: 2026-05-03 (session 3)_

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
Deployed: `f440220` (after fixing null byte corruption from batch 2 commit — see git notes).

### Named rules — batch 3 + supplement (done ✅)
63 new rules across two commits (`9ec59db`, `6372b2e`):
- **Fuel**: Freedom Fuels, Shell Coles Express, BP, Ampol → Transport
- **Retail**: Kmart, Bunnings, TK Maxx, Spotlight, Super Cheap Auto, The Trail Co, Reebelo, Carindale Mega, Etsy, 2XU, Fast Times, The Lush Lily → Shopping
- **Entertainment**: Event Cinemas, Birch Carroll, Tatts Online, Plaster Fun House → Entertainment
- **Healthcare**: Specsavers, Burst Health, Scope Psychology, Queensland X-Ray, Mater Misericordiae, MH Carindale, LS Link Vision → Healthcare
- **Personal Care**: Zen Hair Skin & Body → Personal Care _(new category added to `categories.ts`)_
- **Health & Fitness**: Gold Coast Aquatics, Diving Queensland → Health & Fitness
- **Transport**: Secure Parking → Transport
- **Travel**: Hotel at Booking.com → Travel
- **Eating Out**: Liquorland, Hurrikane, Bloom Salad, Bloom Canteen, Bar Merlo, Blackbird Bar, Hana Sushi, Curryville, Red Galanga, Mr Edwards Alehouse, Brooklyn Standard, Punch Espresso, Jimmys, Tomcat Bar, Satay Boss, Thai Antique, Sitar, The Archive, Bellissimo Coffee, Food Odyssey → Eating Out
- **Catch-alls**: `sq_eating_out` (Square terminal SQ*), `zlr_eating_out` (Zeller terminal ZLR*), `ls_eating_out` (Lightspeed LS prefix cafes)
- **Food & Groceries**: Bakers Delight, Andy's Bakery, Kenrose Bakery, Just Bun, Nextra → Food & Groceries
- **Education**: Department of Education QLD → Education
- **Income**: Budget Direct rebate → Insurance/income; MCARE Benefits → Healthcare/income
Coverage after reprocess (end of session 2): **101 → 15 unmatched** (852 CSV transactions)

### Named rules — batch 4 (done ✅, session 3)
9 rules covering bank fees, utilities, and confirmed local PTY LTDs:
- **Bank Fees** _(new category in `categories.ts`)_: `cba_annual_fee` (anchored `^annual fee$`), `cba_interest_cash_adv`, `cba_cash_adv_fee` (matches "cash adv fee"). All Joint, isSubscription: false.
- **Utilities**: `momentum_energy` ("MOMENTUM" / "MOMENTUM ENERGY") → Utilities, Joint
- **Eating Out**: `crisp_on_creek`, `north_burleigh_surf_club`, `hanaichi_sushi`, `hira_bhana_sons`, `river_city_corporation` → Eating Out, Joint
- 16 new rule tests added; 2 new intentional fingerprint collisions (Bank Fees/Joint, Utilities/Joint)
- 760 tests passing after Batch 4

### Remaining unmatched (6) — too ambiguous, deferred
TFAP PTY LTD (4), TEJGON PTY LTD (3), H C KALYAN PTY LTD (2), TEAM COOPS PTY LTD (2), LASHAND INVESTMENTS (1), BRINCO2005 PTY LTD (1). Steven did not have context for these — to be classified manually via `/mappings` UI when transactions accumulate. _(Was 15 unmatched at start of session 3 — Batch 4 cleared the bank fees, MOMENTUM, and 5 confirmed local merchants.)_

### Task 18 Steps 3–4 — outcome buckets wired into main UI (done ✅, session 3)
- New `src/lib/bucketAggregation.ts` — `aggregateBuckets()` (groups txns by outcome bucket, skips transfers) + `summariseByRealm()` (rolls up to realm × direction). Pure functions, fully unit tested (8 tests).
- **`/spending`** now renders a hierarchical "Spending by Outcome Bucket" tree below the existing month/category summary. New client component: `src/app/spending/SpendingBuckets.tsx`. Scoped to household-personal accounts (matches existing /spending filter).
- **`/dashboard`** now renders an "Outcome Buckets" card showing per-realm Income vs Expenses + net for the current month, across all accounts (business + household). New server component: `src/app/dashboard/OutcomeBucketsCard.tsx`. Card includes a "Detail" link to `/dev/buckets` for the full hierarchical view.
- Existing `/dev/buckets` page kept as the deep-dive view.
- 768 tests passing after this work

## Outstanding backlog items
- **Next session deploy steps**:
  1. From Windows Git Bash (NOT sandbox — git lock issue): `git add -A && git commit -m "feat: batch 4 rules + outcome buckets in /spending and dashboard" && git push`
  2. Wait for Vercel deploy
  3. `curl -s -X POST "https://app.hearth.money/api/admin/reprocess-csv"` to re-apply rules
  4. Check `/dev/coverage` to confirm unmatched count drops from 15 → ~6
  5. Visit `/spending` and `/` (dashboard) to verify the new bucket UI renders
- **Future**: Manual `/mappings` pass for the 6 remaining truly-ambiguous PTY LTDs as transactions accumulate
- **Operational notes**:
  - git lock file (`index.lock`) keeps appearing in Linux sandbox — always commit from Windows Git Bash, not the sandbox
  - Edit/Write tools corrupt files (silent truncation + occasional null bytes) — always use bash + python heredoc + verify with `python3 -c "open(f,'rb').read().count(b'\x00')"` before commit. Truncation can also remove existing content, so always check `git diff --stat` after edits and confirm no unexpected line losses.

## Git state
- Repo: `C:\dev\personal-assistant\hearth-app` | Branch: main | **UNCOMMITTED** changes pending Steven's manual commit/push
- HEAD: `c51c454` (batch 4 + outcome buckets, pushed mid-session-3)
- 772 tests passing (28 new this session: 16 batch-4 rule tests + 8 bucket aggregation tests + 4 coverage regression tests)
- Production: https://app.hearth.money

## Files changed this session (session 3)
**Modified:**
- `BACKLOG.md` — Tasks 10–17 marked `[x]` (housekeeping; they were shipped in session 2 but not checkbox-updated)
- `src/lib/categories.ts` — added 'Bank Fees' to CATEGORIES
- `src/lib/merchantCategoryRules.ts` — added 9 Batch 4 rules
- `src/lib/__tests__/merchantCategoryRules.test.ts` — added 16 tests + 2 intentional collisions
- `src/app/spending/page.tsx` — fetches bucket data + renders SpendingBuckets
- `src/app/dashboard/page.tsx` — fetches bucket data + renders OutcomeBucketsCard

**Added:**
- `src/lib/bucketAggregation.ts` — pure aggregation helpers (aggregateBuckets, summariseByRealm)
- `src/lib/__tests__/bucketAggregation.test.ts` — 8 tests
- `src/app/spending/SpendingBuckets.tsx` — hierarchical tree client component
- `src/app/dashboard/OutcomeBucketsCard.tsx` — realm-summary card server component

### Coverage regression test (done ✅, session 3 follow-up)
After Steven asked "why didn't the tests catch this?", added a snapshot test that runs the rule pipeline against a fixture of real merchant strings and asserts unmatched ⊆ EXPECTED_UNMATCHED. Catches:
- Regex mismatches against real production strings (the unit tests use synthetic input)
- Rule ordering bugs (an earlier catch-all eating a later specific rule)
- Coverage regressions when adding rules
- Stale exemptions (merchant in EXPECTED_UNMATCHED but a rule now matches it)

**Files:**
- `src/lib/__tests__/coverageRegression.test.ts` — 4 tests (incl. one informational coverage stat reporter)
- `src/lib/__tests__/fixtures/coverageMerchants.json` — hand-seeded with the 15 from /dev/coverage screenshot + 16 known-matched canaries; needs regeneration from production
- `src/lib/__tests__/fixtures/README.md` — workflow + the SQL to regenerate
- `scripts/generateCoverageFixture.ts` — automated regenerator (needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env)

**To make it really useful:** Steven should run `npx tsx scripts/generateCoverageFixture.ts` at some point to replace the hand-seeded fixture with the real production set. Until then the test catches regressions on the seeded sample only.

**Result:** 772 tests passing (4 new). 25/31 fixture merchants matched, 6 in EXPECTED_UNMATCHED, 0 unexpectedly unmatched.
