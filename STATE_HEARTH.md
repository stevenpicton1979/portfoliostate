# Hearth App — Session State
_Last updated: 2026-04-29_

## What Hearth is
Personal finance app (Next.js 14 + Supabase + Xero). Tracks household transactions, categorises them, links to Xero for business bank feed. Business transactions come exclusively from Xero. Personal transactions come from CSV bank extracts only. No overlap.

## Completed this session

### Rules engine fingerprint expansion (done ✅)
- `MerchantCategoryRule` output expanded from 2 fields (`category`, `isTransfer`) to 5 fields:
  `{ category, isIncome, isTransfer, isSubscription, owner }`
- `RuleResult` matches: `{ ruleName, category, isIncome, isTransfer, isSubscription, owner }`
- `RuleContext` cleaned up: removed unused `amount` and `accountScope`; kept `isIncome`, `glAccount`, `accountOwner`
- `applyMerchantCategoryRules` now returns full fingerprint via `{ ruleName, ...rule.output }`
- All 16 rules updated with explicit `output` object covering all 5 dimensions

### Taxonomy decisions baked into rules (done ✅)
- Entertainment subscriptions on BHT card (Steam, Xbox, Spotify) → `category: 'Entertainment', owner: 'Business'`
  _(previously incorrectly mapped to category: 'Business')_
- Google One → `category: 'Technology', owner: 'Business', isSubscription: true`
- Rules that check `ctx.isIncome` in their match condition (oncore_income, crosslateral_income, invoice_income, director_loan_repayment) output `isIncome: true` or `false` explicitly — not null
- Direction-agnostic rules (ato_payments, airbnb, etc.) use `isIncome: null` = inherit from transaction amount sign

### Intentional fingerprint collisions (documented, test allows them)
| Rules | Fingerprint | Reason |
|-------|-------------|--------|
| oncore_income, crosslateral_income, invoice_income | (Business, true, false, false, Business) | Same transaction type: BHT income |
| bht_directors_loan_transfer, director_loan_repayment | (null, null, true, false, null) | Same transaction type: inter-account transfer |
| xbox, spotify | (Entertainment, null, false, true, Business) | Same subscription type on BHT card |

### is_subscription column added (done ✅)
- DB migration: `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN NOT NULL DEFAULT FALSE`
- All three upsert paths in `categoryPipeline.ts` now include `is_subscription`:
  - isTransferRow path (~line 156): `is_subscription: false`
  - ruleResult.isTransfer path (~line 195): `is_subscription: false`
  - Non-transfer path (~line 257): `is_subscription: isSubscription` (from rule result)

### New dev pages (done ✅)

**`/dev/reconcile`** — Xero data reconciliation report
- Endpoint: `GET /api/admin/reconcile`
- Pure functions in `src/lib/reconcile.ts`: `detectGapMonths`, `compareAccountCounts`, `detectExternalIdDuplicates`, `detectCsvNearDuplicates`
- Table shows per-account: Xero count, DB count, match ✓/✗, gap months, duplicate count
- ⚠️ Known bug: DB COUNT = 0 for most accounts (BHT, AmEx, NAB CC) — account ID matching is broken. See Task 14 in BACKLOG.md.

**`/dev/coverage`** — Transaction coverage inspector
- Endpoint: `GET /api/dev/coverage?unmatched=true&account=...`
- Pure functions in `src/lib/coverageReport.ts`: `buildCoverageRows`
- Table: merchant, txn count, total value, matched rule (or "no match" badge), auto category, owner, example raw_description
- Expandable rows show full per-transaction context (glAccount, isIncome, date, amount)
- ⚠️ Known limitation: no merchant name search/filter. See Task 15 in BACKLOG.md.

### Test suite
- 584 tests passing (up from 527 at start of session)
- New tests: reconcile.test.ts, reconcileRoute.test.ts, coverageRoute.test.ts
- merchantCategoryRules.test.ts: all 16 rules assert full 5-field fingerprint
- Two integrity tests added:
  - `'has no unintentional fingerprint collisions'` — uses intentionalCollisions Set
  - `'rules that match on ctx.isIncome always output an explicit isIncome value'`

### Previously completed (named merchant rules engine session)
- `src/lib/merchantCategoryRules.ts` — single source of truth for named rules
- Rules fire during Xero sync pipeline AND via backfill endpoint
- `matched_rule` column on transactions stores which rule fired (e.g. `merchant:oncore_income`)
- `/dev/rules` page lists all rules with live transaction counts
- `/api/admin/fix-mis-merchants` — backfill endpoint re-processes `matched_rule = 'merchant:xero_misc_code'` rows
- cleanXeroMerchant fix: `isXeroCode` regex now case-insensitive
- Per-account Xero pagination (up to 5,000 records per account)
- CSV/Xero dedup fix in `upsertTransactions`
- Data pipeline repeatable reset

## Current rules in `merchantCategoryRules.ts`
| Rule name | Trigger | Category | isIncome | isTransfer | isSub | owner |
|-----------|---------|----------|----------|------------|-------|-------|
| `ato_payments` | merchant ∋ "ato" | Government & Tax | null | false | false | null |
| `airbnb` | merchant ^= "airbnb" | Travel | null | false | false | null |
| `uber` | merchant ^= "uber" | Transport | null | false | false | null |
| `bell_partners` | merchant ∋ "bell partners" | Business | null | false | false | Business |
| `invoice_income` | merchant = "INVOICE" + isIncome | Business | true | false | false | Business |
| `oncore_income` | merchant ∋ "oncore" + isIncome | Business | true | false | false | Business |
| `crosslateral_income` | merchant ∋ "crosslateral" + isIncome | Business | true | false | false | Business |
| `superannuation_payable` | glAccount ∋ "superannuation payable" | Payroll Expense | null | false | false | Business |
| `income_tax_provision` | glAccount ∋ "income tax" | Government & Tax | null | false | false | Business |
| `xero_misc_code` | merchant = "MIS" (legacy) | Business | null | false | false | null |
| `google_one` | merchant ∋ "google one" | Technology | null | false | true | Business |
| `steam_games` | merchant ∋ "steamgames" | Entertainment | null | false | false | Business |
| `xbox` | merchant ∋ "xbox" | Entertainment | null | false | true | Business |
| `spotify` | merchant ∋ "spotify" | Entertainment | null | false | true | Business |
| `bht_directors_loan_transfer` | glAccount ∋ "directors loan" | null (transfer) | null | true | false | null |
| `director_loan_repayment` | merchant ∋ "steven/nicola picton" + isIncome | null (transfer) | null | true | false | null |

## Repeatable reset runbook
```bash
curl -s -X POST "https://app.hearth.money/api/admin/wipe-business-transactions?confirm=true"
curl -s -X POST "https://app.hearth.money/api/xero/sync?full=true"
curl -s -X POST "https://app.hearth.money/api/admin/fix-mis-merchants"
```

## Key files
| File | Purpose |
|------|---------|
| `src/lib/merchantCategoryRules.ts` | Named rules engine — add all new categorisation rules here |
| `src/lib/categoryPipeline.ts` | `processBatch` + `upsertTransactions` — 3 upsert paths, all include is_subscription |
| `src/lib/reconcile.ts` | Pure reconciliation functions (detectGapMonths etc.) |
| `src/lib/coverageReport.ts` | Pure coverage aggregation functions (buildCoverageRows) |
| `src/lib/xeroCategories.ts` | `cleanXeroMerchant`, `composeXeroRawDescription`, `mapXeroAccountToCategory` |
| `src/lib/xeroApi.ts` | Xero API client — token refresh, per-account pagination |
| `src/app/api/xero/sync/route.ts` | Main Xero sync — `?full=true` for deep sync |
| `src/app/api/admin/reconcile/route.ts` | Reconciliation endpoint |
| `src/app/api/dev/coverage/route.ts` | Coverage inspector endpoint |
| `src/app/dev/reconcile/page.tsx` | Reconciliation UI |
| `src/app/dev/coverage/page.tsx` | Coverage inspector UI |
| `src/app/api/admin/wipe-business-transactions/route.ts` | Full business data wipe |
| `src/app/api/admin/fix-mis-merchants/route.ts` | Backfill named rules on MIS rows |
| `src/lib/__tests__/merchantCategoryRules.test.ts` | Rule tests — all 16 rules, all 5 output fields |

## DB schema notes
- `transactions.external_id` — unique, nullable. Xero: BankTransactionID. CSV: null.
- `transactions.matched_rule` — which named rule fired, e.g. `merchant:oncore_income`
- `transactions.gl_account` — Xero chart-of-accounts name, e.g. "Superannuation Payable"
- `transactions.is_subscription` — BOOLEAN NOT NULL DEFAULT FALSE
- `transactions.raw_description` — TEXT nullable. Xero: pipe-separated context fields. CSV: original bank description.
- `transactions.source` — 'xero' or 'csv'
- Business accounts: `institution = 'Xero'` OR `scope = 'business'`
- Personal accounts: `scope = 'household'`, CSV only

## Outstanding backlog items
- **Task 14**: Fix reconciliation page — DB count = 0 for most accounts (account ID matching broken)
- **Task 15**: Coverage inspector — add merchant name search/filter

## Git state
- Repo: `C:\dev\personal-assistant\hearth-app` | Branch: main | All pushed
- 584 tests passing
- Production: https://app.hearth.money
