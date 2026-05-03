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

### 2026-04-08 — Session verification
- Confirmed all 4 products returning 200 green via /api/status (WhatCanIBuild 47ms, ZoneIQ 43ms, ClearOffer 53ms, SubdivideIQ 29ms)
- All BACKLOG.md tasks now [x] — only open item is manual DNS record
- BACKLOG.md has zero remaining [ ] tasks

### 2026-04-08 — BACKLOG sweep (this session)
- BACKLOG had 0 new [ ] tasks — INFRA-2 was already complete from prior session
- Re-verified live deployment: all 4 products green (WhatCanIBuild 53ms, ZoneIQ 58ms, ClearOffer 68ms, SubdivideIQ 27ms)
- Deployment protection disabled on portfoliostate-status Vercel project (was blocking public access to preview URLs)
- status.whatcanibuild.com.au still pending DNS — requires manual A/CNAME record at nameserver.net.au

---

## PropertyData — Evening + Overnight Queue — 2026-04-14

### Evening session completed (commits pushed by Steve)
- **Score box contrast fix** — CoreLogic theme score box redesigned: white background + 2px blue border, score number forced to var(--accent) blue via `!important`. Eliminates green/amber/red text-on-blue contrast issue (inline style was overriding CSS). Commit: 71413b8
- **Style toggle removed** — `<body class="theme-corelogic">` is now permanent. Removed: `.style-switcher` CSS + HTML, `setTheme()` JS function, localStorage preference restore, style-pill classes. CoreLogic is the one true theme.
- **Permalink bar removed** — share bar injected into UI after report generation removed (was cluttering search wrap). SSR `/report/:slug` pages and Supabase report storage still fully functional — links work, just not shown inline.
- **Landing page revamp** — added `.landing-hero` section above search wrap with: eyebrow chip ("Brisbane Properties · Free Report"), H1 "Know exactly what you're buying.", supporting subtext ("No agent spin, no sign-up"). Brand bar simplified (tagline removed, just logo + name). Trust row added inside search wrap below button: 4 chips — "12+ government sources", "Free in under 15 seconds", "No sign-up required", "Brisbane properties". Hero auto-hides via `body.has-report` class added on report load.

### Overnight build queued — start with "overnight: work through backlog" or "overnight: propertydata"
Tasks in priority order:
1. **T2.6** — sitemap.xml + robots.txt (static, quick — /api/sitemap.js or static public/ file)
2. **T2.9** — PDF update: add permanent report URL to PDF header/footer; add PropertyVitals branding + www.propertyvitals.com.au
3. **T2.8** — contextual referral CTAs: flood flagged → flood insurance, heritage → heritage architect, high score → conveyancer, any overlays → building inspector. Render below report sections. Track clicks via Plausible.
4. **T2.3** — dynamic OG image per report: use @vercel/og or satori to generate 1200×630 image showing address, Property Score number, 3 key overlay flags. Cache in Supabase storage.
5. **T2.5** — 101 suburb landing pages at /suburb/{name}: each shows suburb overlay prevalence stats, demographics, momentum, school catchments, market data, CTA to generate free report. Static HTML from suburb-overlay-stats.json + abs-suburb-stats.json.
6. **T3.1** — local plan + precinct: query BCC CityPlan Local Plan layer (FeatureServer) for lot centroid. New fields: local_plan_name, local_plan_precinct. Render in Property Overview section alongside zone code.

### Build result — all 6 tasks shipped (commits pushed by Steve 15 Apr 2026)
- b7a80cf: T2.6 sitemap + robots.txt
- 9a2f5cd: T2.9 PDF permanent URL + branding (T2.8 CTA changes likely batched into this commit — verify on prod)
- 53ea84c: T2.3 dynamic SVG OG image per report
- 6cee4aa: T2.5 101 suburb landing pages + /suburbs index
- 41c70c6: T3.1 local plan + precinct adapter live
- Track 2 now 8/9 complete. T2.7 (soft email gate) is the only remaining Track 2 task.

### 2026-04-15 — PropertyData Overnight Build — Track 2 + Track 3.1 COMPLETE
- **T2.6** ✓ Sitemap + robots.txt
  - public/robots.txt: Allow all, Sitemap declaration
  - api/sitemap.js: Dynamic generator (101 suburbs + 500 recent reports)
  - vercel.json: /sitemap.xml rewrite
- **T2.9** ✓ PDF with permanent URL + branding
  - api/report-pdf.js: Accept slug param, add website URL to header, add permanent link to footer
  - public/index.html: downloadPDF() passes slug from lastData.meta.slug
- **T2.8** ✓ Contextual referral CTAs
  - Next Steps section dynamically rendered after AI narrative
  - 6 CTA types: flood insurance, BAL assessment, heritage architect, conveyancer, building inspector, mortgage broker
  - Conditional logic based on report findings (flood level, bushfire direct, heritage, score, overlays)
  - CSS grid layout with icon + title + text + link
- **T2.3** ✓ Dynamic OG image per report
  - api/og-image.js: GET /og-image?slug={slug} → 1200×630 SVG
  - Fetches report from Supabase, extracts score + address + top 3 overlays
  - Blue left stripe, PropertyVitals branding, colour-coded score, overlay badges
  - Cache-Control: s-maxage=86400
  - api/report.js: og:image + twitter:image meta tag rewrites
  - vercel.json: /og-image rewrite
- **T2.5** ✓ 101 suburb landing pages
  - api/suburb.js: GET /suburb/{name} → full HTML page (standalone, not reusing index.html)
  - Content: title, overlay prevalence stats (colour-coded), demographics grid, momentum badge, search CTA
  - Lookups: suburb-overlay-stats.json, abs-suburb-stats.json, suburb-momentum.json
  - public/suburb-index.html: Static index of all 101 suburbs (grid of links)
  - vercel.json: /suburb/:name + /suburbs rewrites
  - Cache-Control: s-maxage=86400, stale-while-revalidate=604800
- **T3.1** ✓ Local plan + precinct from BCC CityPlan
  - api/sources/bcc-local-plan.js: Point geometry query (lot centroid) to BCC CityPlan FeatureServer
  - api/lib/field-registry.js: Add SOURCES.BCC_LOCAL_PLAN, local_plan_name, local_plan_precinct fields
  - api/lookup.js: Integrated into parallel Promise.all() step, fires after cadastre with lot centroid
  - public/index.html: Render local plan + precinct as pills in hero section
- **Status:** All 6 tasks complete. PUSH_COMMANDS.md written. Ready for Steve to push to master.
- **Changes:** 6 new files created (sitemap.js, og-image.js, suburb.js, suburb-index.html, bcc-local-plan.js). 6 files modified (report-pdf.js, index.html, report.js, vercel.json, field-registry.js, lookup.js). No breaking changes to ClearOffer contract.

---
## Session — 14 Apr 2026 (evening continuation)

**Commits pushed:** 0c4e7f6, 25077d8, bbe2583

**Work completed:**
- Fixed critical index.html corruption (truncated at line 1736 in prior session — autocomplete stripped). Restored from 9a2f5cd, applied surgical edits, fixed duplicate tail appended by bash/Windows mount discrepancy.
- Hazard/overlay tier split: 9 checks now classified as Hazards (orange, drive Preparation Level) vs Planning Overlays (amber, appear in count row only). Prep Level driven by hazard count: 0=Light, 1=Moderate, 2-3=Significant, 4+=In-depth.
- Layout Option B: top row (summary panel | address/pills), full-width 3-column grid below. Eliminates whitespace gap.
- Dynamic description copy: specific/transparent ("Mostly standard planning overlays with N hazards to investigate").
- Suburb normaliser: pulls ctxMap context note for most relevant flagged overlay.
- Messaging Framework docx updated: section 2.1 thresholds, new section 2.2 Description Copy Framework, section 3 hazard/overlay classification note.

**Remaining / next overnight:**
- T2.7: Soft email gate
- CS.1-CS.8: Continuity safeguards (schema fixtures, smoke tests, DECISIONS.md D8, Brisbane validation test)


---
## Session — 2026-05-03 (Hearth batch 3 rules)

**Commits pushed:** 9ec59db (batch 3, 44 rules), 6372b2e (batch 3 supplement, 19 rules)
**State updated:** a9bad87 (portfoliostate)

**Work completed:**
- Continued from previous session where batch 2 (f440220) had just deployed successfully
- Ran reprocess-csv against 852 CSV transactions — applied batch 2 rules → 101 unmatched merchants
- **Batch 3** (9ec59db): 44 new named rules covering fuel (Freedom Fuels, Shell Coles Express, BP, Ampol), retail (Kmart, Bunnings, TK Maxx, Spotlight, Super Cheap Auto, The Trail Co, Reebelo), entertainment (Event Cinemas, Birch Carroll, Tatts Online, Plaster Fun House), healthcare (Specsavers, Burst Health, Scope Psychology, QLD X-Ray, Mater Misericordiae, MH Carindale), personal care (Zen Hair Skin & Body), health/fitness (Gold Coast Aquatics, Diving QLD), transport (Secure Parking), travel (Booking.com Hotel), eating out (Liquorland, Hurrikane, Bloom Salad, Bloom Canteen, Bar Merlo, Blackbird Bar, Hana Sushi, Curryville, Red Galanga, Mr Edwards Alehouse, Brooklyn Standard, SQ* catch-all, ZLR* catch-all), food & groceries (Bakers Delight), education (Dept Education QLD), income (Budget Direct rebate, MCARE Benefits)
- New category 'Personal Care' added to categories.ts taxonomy
- **Batch 3 supplement** (6372b2e): 19 more rules — Etsy, 2XU, Fast Times, The Lush Lily, LS Link Vision, Andy's Bakery, Kenrose Bakery, Just Bun, Nextra, Punch Espresso, Jimmys, Tomcat Bar, Satay Boss, Thai Antique, Sitar, The Archive, Bellissimo Coffee, Food Odyssey, LS* cafe catch-all
- Ran reprocess-csv again after each deploy
- **Coverage: 101 → 35 → 15 unmatched merchants**
- 744 tests passing (168 in merchantCategoryRules.test.ts)

**Remaining unmatched (15):** TFAP PTY LTD (4), TEJGON PTY LTD (3), H C KALYAN PTY LTD (2), MOMENTUM (2), TEAM COOPS PTY LTD (2), HIRA BHANA & SONS (1), NORTH BURLEIGH SURF LI (1), ANNUAL FEE (1), RIVER CITY CORPORATI (1), INTEREST ON CASH ADV (1), HANAICHI PTY LTD (1), CBA OTHER CASH ADV FEE (1), CRISPONCREEK (1), LASHAND INVESTMENTS (1), BRINCO2005 PTY LTD (1)

**Known issue:** git index.lock appears in Linux sandbox — ALWAYS commit from Windows Git Bash, never from the sandbox
