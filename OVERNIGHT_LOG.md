# OVERNIGHT_LOG — SubdivideIQ Sprint 3 + Sprint 4
Session: 2026-04-06

## Sprint 3 tasks
- [x] S3-1: Stripe checkout (api/checkout.js)
- [x] S3-2: Stripe webhook (api/webhook.js)
- [x] S3-3: PDF report template (api/generate-pdf.js)
- [x] S3-4: Frontend update (public/index.html)
- [x] S3-5: Confirmation page (public/confirmation.html) + api/report-status.js
- [x] S3-T: Sprint 3 tests — T5/T6/T8 PASS, T1/2/3/4/7/9 manual pending

## Sprint 4 tasks
- [x] S4-1: Vercel env vars — 9 production + 9 development set
- [x] S4-2: CLAUDE.md trusted domains — verified present
- [x] S4-3: Full Brisbane data loads — BLOCKER: BCC API caps at 10k records
  - 16,115 parcels + 12,037 pipes loaded (within API cap)
  - load-all-suburbs.js written — iterates 195 suburbs, resumable
  - Run manually: node scripts/load-all-suburbs.js (~60 min, ~773k records)
- [ ] S4-4: Stripe live mode — MANUAL BLOCKER (needs real card test)
- [x] S4-5: Jest smoke tests — 6/6 passing
- [ ] S4-6: Final staging test — deployed to subdivideiq.vercel.app, manual browser test needed
- [ ] S4-7: Update portfoliostate — partially done (STATE.md updated, BACKLOG synced)

---

## Log

### 2026-04-06 — Sprint 3 started
- BACKLOG.md fully rebuilt with complete Sprint 1-2 history, test sections between sprints
- Studied buyerside/api/create-checkout.js and whatcanibuild/api/webhook.js for patterns
- PDF approach: pdfkit (pure Node.js, no Chromium, works in Vercel serverless)
- Installing: stripe@^14, @supabase/supabase-js@^2, resend@^3, pdfkit@^0.15

### 2026-04-06 — Sprint 3 COMPLETE
- S3-1: api/checkout.js — Stripe Checkout $79 AUD, metadata address/email/lat/lng
- S3-2: api/webhook.js — raw body stream, sig verify, respond immediately, async processReport, Resend PDF email, Supabase log
- S3-3: api/generate-pdf.js — pdfkit, traffic light panel, per-check sections with badges, consultant table, disclaimer
- S3-4: public/index.html — full rewrite, Mapbox GL lot boundary, locked TL preview, email capture, two-phase checkout
- S3-5: public/confirmation.html + api/report-status.js — polls every 5s, reveals traffic light + per-check on ready
- S3-T: T5 AMBER ✅ T6 PDF 5394 bytes ✅ T8 Supabase insert/fetch ✅
- Note: lotsize check requires area_m2 in body — webhook passes it from parcel lookup, frontend geocode returns it
- All Sprint 3 commits pushed: 266e1a7 → 439fb2b
- portfoliostate synced

### 2026-04-06 — Sprint 4 IN PROGRESS
- Sprint 2B inserted into BACKLOG.md (contaminated land, infrastructure charges, easements, acid sulfate)
- S4-1: Vercel env vars set via CLI — 9 production + 9 development
- S4-1 note: Preview env vars require non-main branch — not set (only main branch exists)
- S4-3: BCC API hard cap of 10k records per query discovered — full load impossible via simple pagination
- S4-3: load-all-suburbs.js written — fetches 195 Brisbane suburbs from BCC facets API, iterates each suburb, resumable via --resume N
- S4-3: Current loaded: 16,115 parcels, 12,037 pipes (includes Carindale from Sprint 1)
- S4-5: Jest installed, smoke.test.js written — 6/6 passing
- Deployed to https://subdivideiq.vercel.app (Production)
- Sprint 4 blockers: S4-4 (Stripe live mode manual), S4-6 (browser staging test manual), full suburb data load manual

---

## INFRA-2: Visual health dashboard — 2026-04-08

**Task:** Build and deploy status.whatcanibuild.com.au health dashboard.

**Completed:**
- public/index.html — dark-theme dashboard, 4 product cards, auto-refreshes every 60s, calls /api/status
- api/status.js — server-side fetch of all 4 products (WhatCanIBuild, ZoneIQ, ClearOffer, SubdivideIQ), returns status + response time
- api/health-check.js — Vercel cron */30 * * * *, state tracking via @vercel/kv (graceful degradation), Slack alerts to #claude-alerts on down/recovery
- vercel.json — cron config, output dir public
- Deployed to https://portfoliostate-status.vercel.app (Production alias: portfoliostate-status.vercel.app)
- Custom domain status.whatcanibuild.com.au added to Vercel project
- SLACK_BOT_TOKEN added to Vercel env (copied from claude-listener/.env.local — NOTE: Doppler not configured for portfoliostate, set up needed)

**Blockers / manual steps:**
- DNS: Add A record at nameserver.net.au → `status` → `76.76.21.21` (or CNAME status → cname.vercel-dns.com)
- @vercel/kv deprecated — connect Upstash Redis via Vercel integrations for recovery alert state tracking
- Set up Doppler for portfoliostate project (currently not authenticated)
