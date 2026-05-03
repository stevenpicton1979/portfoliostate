# Push needed — session 3 follow-up

## hearth-app (second commit — coverage regression test)

```
cd /c/dev/personal-assistant/hearth-app
git status                # confirm 4 new files: coverageRegression.test.ts, fixtures/coverageMerchants.json, fixtures/README.md, scripts/generateCoverageFixture.ts
git add -A
git commit -m "test: coverage regression suite — fixture + assertions against EXPECTED_UNMATCHED"
git push
```

## Then reprocess to pick up Batch 4 rules on production

(The earlier reprocess ran against the old ruleset because the deploy hadn't landed yet.)

```
curl -s -X POST "https://app.hearth.money/api/admin/reprocess-csv"
# Then visit https://app.hearth.money/dev/coverage — expect 6 unmatched (TFAP, TEJGON, H C KALYAN, TEAM COOPS, LASHAND, BRINCO2005)
# Visit /spending and / (dashboard) to confirm the new bucket UI renders
```

## Optional: regenerate the coverage fixture from real production data

```
cd /c/dev/personal-assistant/hearth-app
# Make sure env vars are loaded: vercel env pull .env.local
npx tsx scripts/generateCoverageFixture.ts
git add src/lib/__tests__/fixtures/coverageMerchants.json
git commit -m "test: regenerate coverage fixture from production"
git push
```

## portfoliostate

```
# If HEAD.lock is still stuck:
rm -f /c/dev/portfoliostate/.git/HEAD.lock

cd /c/dev/portfoliostate
git add STATE_HEARTH.md PUSH_COMMANDS.md
git commit -m "state: hearth session 3 — batch 4 + outcome buckets + coverage regression"
git push
```
