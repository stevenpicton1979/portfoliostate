# Hearth App — Session State
_Last updated: 2026-04-26_

## What Hearth is
Personal finance app (Next.js 14 + Supabase + Xero). Tracks household transactions, categorises them, links to Xero for business bank feed.

## What was completed this session

### external_id stable upsert key (done ✅)
- Renamed `basiq_transaction_id` → `external_id` throughout codebase
- DB migration already run: `ALTER TABLE transactions RENAME COLUMN basiq_transaction_id TO external_id`
- Unique index on `external_id` already exists
- Composite unique constraint changed to **partial index** (only enforces uniqueness WHERE `external_id IS NULL`) — migration run in Supabase:
  ```sql
  ALTER TABLE transactions DROP CONSTRAINT transactions_account_id_date_amount_description_key;
  CREATE UNIQUE INDEX transactions_account_id_date_amount_description_key
    ON transactions (account_id, date, amount, description) WHERE external_id IS NULL;
  ```
- `upsertTransactions` splits rows: `external_id` rows upsert on `external_id` conflict; rows without use composite key fallback
- Backfill step: before upserting, matches existing null-`external_id` rows by (account_id, date, amount) and stamps external_id
- Xero sync passes `external_id: xTx.BankTransactionID` on every transaction
- Basiq sync updated: `basiq_transaction_id` → `external_id`
- All 347 tests passing

### Xero sync performance (done ✅)
- `export const maxDuration = 300` on the xero sync route
- Parallel page fetches: 2 concurrent (reduced from 5 after hitting 429)
- 500ms pause between page batches
- 429 retry with `Retry-After` backoff (up to 3 retries per page)
- HTTP status code included in all Xero error messages

### File truncation crisis (resolved ✅)
Files were committed truncated due to Write tool bug. All restored. Prevention: always write via Python file.write() to Linux mount, verify wc -l + tail -5 before committing.

## Known remaining bugs (next session)

1. **Xero sync 429 rate limit** — hitting 429 on page 5. Daily cap 5000 calls. Try incremental sync after a few minutes wait.

2. **Full re-sync not yet tested** — external_id backfill has never run successfully against real data. Need to verify no duplicates, confirmed categories not overwritten, backfilled count > 0.

3. **Other bugs** — user said "there are more bugs" but didn't specify before ending session.

## Key files

| File | Purpose |
|------|---------|
| `src/lib/xeroApi.ts` | Xero API client — token refresh, bank transactions (paginated), accounts |
| `src/app/api/xero/sync/route.ts` | Main Xero sync endpoint (POST) |
| `src/lib/categoryPipeline.ts` | processBatch + upsertTransactions |
| `src/lib/__tests__/categoryPipeline.test.ts` | 347-line test suite |
| `src/lib/xeroTransferRules.ts` | Rule engine for SPEND-TRANSFER |
| `src/lib/directorIncome.ts` | Classifies wage/director income credits |
| `src/lib/salaryLinker.ts` | Links salary transactions |
| `vercel.json` | Cron: daily sync at 0 16 * * * (UTC) |

## DB schema notes
- `transactions.external_id` — unique, nullable. Xero: BankTransactionID. Basiq: transaction ID. CSV: null.
- Composite unique index is now partial (WHERE external_id IS NULL)
- `xero_connections` — access_token, refresh_token, expires_at, tenant_id, last_synced_at
- `merchant_mappings` — auto-populated by processBatch

## Git state
- Repo: `C:\dev\personal-assistant\hearth-app` | Branch: main | All pushed
- Latest commits:
  - fix: reduce Xero fetch concurrency to 2, add 429 retry with Retry-After backoff
  - fix: include HTTP status code in Xero API error messages
  - fix: restore truncated merchant-examples, strip null bytes from training-labels
  - fix: restore truncated xero sync and seed-training routes
  - fix: correct truncated training page (remove duplicate closing block)
