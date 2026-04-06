# Steve Picton — PropTech Portfolio State
Last updated: 6 April 2026

## IMPORTANT — FOR ALL CLAUDE SESSIONS
This file is the single source of truth. Rules:
- NEVER fully overwrite this file — only add or update specific sections
- ALWAYS read this file before making any changes to it
- NEVER assume a product is "working" or "complete" without checking this file
- When in doubt about a product's status, ask Steve — do not infer from code

---

## Products

### WhatCanIBuild — whatcanibuild.com.au
- Repo: stevenpicton1979/whatcanibuild
- Live: whatcanibuild.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: LIVE mode, $19.99 AUD, webhook on checkout.session.completed
- Supabase: fzykfxesznyiigoyeyed, table: wcib_reports
- Resend: sending from hello@clearoffer.com.au (temporary)
  - CANNOT verify whatcanibuild.com.au in Resend — free tier allows 1 domain only, currently used by clearoffer.com.au
- Status: LAUNCHED — posted on r/Brisbane
- Known issues:
  - ZoneIQ URL must be zoneiq-sigma.vercel.app not zoneiq.com.au (redirect issue on server-side fetch)
  - wcib_reports Supabase writes silently failing — uses NEXT_PUBLIC_SUPABASE_URL env var which is not set in production. Email delivery still works. Add to backlog.
  - Email body contains raw HTML anchor tags rendering as text — pre-existing bug in email template
- Homepage updated 6 April 2026: now a product picker with two cards — "What Can I Build?" and "Can I Subdivide?" linking to subdivide.whatcanibuild.com.au
- No active build work underway

### ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS
- Coverage: Brisbane, Gold Coast, Moreton Bay, Sunshine Coast, Ipswich, Logan, Redland = 189,751 polygons
- Overlays: flood, character, schools, bushfire, heritage, aircraft noise (ANEF), acid sulfate soils, contaminated land link-out
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- API keys: working, stored in api_keys table
- Nearest polygon fallback: plpgsql function confirmed in Supabase
- DECISIONS.md: exists in repo, documents key architectural decisions D38-D40
- Show HN: planned — NOT YET DONE
- Status: LAUNCHED on RapidAPI
- Sprint history: Sprints 1-15 all COMPLETE
- Sprint queue:
  - Usage dashboard + API tests + GitHub Actions CI: overnight session ran 6 April — verify complete
  - Sprint 16 [ ] BACKLOG: QFAO Statewide Flood Fallback (added to BACKLOG.md 6 April)
- Strategic decision (6 April 2026): ZoneIQ is infrastructure, not a standalone consumer brand. Primary value is powering WhatCanIBuild, SubdivideIQ and ClearOffer. RapidAPI is secondary.

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au + buyerside.stevenpicton.ai
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only, $99 AUD Buyer's Brief (pricing updated 6 April 2026)
- Address autocomplete: Nominatim (not Mapbox)
- Status: ON HOLD — awaiting data partner approval. Do not build features until data confirmed.
- DNS: clearoffer.com.au A record being updated to 216.150.1.1 in VentraIP (in progress as of 6 April)

- Pricing decisions (6 April 2026):
  - Buyer's Brief: $99 AUD
  - CITEC EMR/CLR contaminated land add-on: $129 AUD (pass-through)
  - Do NOT launch until comparable sales data is confirmed

- What actually works:
  - Address autocomplete via Nominatim ✅
  - Scout Report renders with ZoneIQ data (zone, flood, character, schools) ✅
  - Email gate working ✅
  - Stripe checkout (test mode) ✅
  - Claude AI Buyer's Brief generation (streaming) ✅
  - Resend email from hello@clearoffer.com.au ✅
  - Coming soon page live at clearoffer.com.au ✅
  - clearoffer_notify Supabase table capturing early access emails ✅

- What does NOT work / is mock data:
  - Domain.com.au API not connected — listings data is placeholder/mock
  - PropTechData comparable sales not connected — mock data
  - Price estimation not connected
  - Agent data not connected
  - Claude buyer's brief system prompt needs rewriting for buyer perspective
  - NOT ready for real users — significant mock data throughout

- Data partner status:
  - Domain.com.au: Listings Management Sandbox active, Agents & Listings + Price Estimation + Properties & Locations PENDING approval
  - PropTechData: emailed hello@proptechdata.com.au — no response yet
  - PriceFinder: not yet contacted
  - Outreach emails drafted 6 April — sending tomorrow

- Blockers (unresolved):
  - Comparable sales: no data partner confirmed
  - All Domain API endpoints beyond sandbox: pending
  - Stripe: must switch to live mode before launch

### SubdivideIQ — subdivide.whatcanibuild.com.au
- Repo: stevenpicton1979/subdivideiq (main branch)
- Domain: subdivide.whatcanibuild.com.au (subdomain of whatcanibuild.com.au)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Status: LAUNCHED — live at subdivide.whatcanibuild.com.au
- Stripe: LIVE mode, $79 AUD, webhook scoped to product: subdivideiq

- Sprint history:
  - Sprint 1 [x] COMPLETE: Repo scaffold, Supabase tables, BCC parcel + stormwater data loaded
  - Sprint 2 [x] COMPLETE: Feasibility checks engine (zone, flood, elevation, stormwater, character, lotsize, aggregator)
  - Sprint 3 [x] COMPLETE: Parcel boundary lookup via DCDB (server-side, CORS-safe)
  - Sprint 4 [x] COMPLETE: Full report pipeline — Stripe, Supabase, Resend, confirmation page

- Architecture decisions (DO NOT CHANGE without discussing with Steve):
  - BCC addresses: Supabase parcel lookup first, DCDB fallback
  - Non-BCC addresses: DCDB live API directly (statewide QLD coverage)
  - Stormwater: BCC Supabase data only — non-BCC returns GREY (neutral, excluded from score)
  - Flood: ZoneIQ Supabase for 7 councils — QFAO fallback planned (Sprint 16)
  - Elevation: QLD ArcGIS ImageServer (statewide)
  - Do NOT store non-BCC data locally — live API queries only (Option C)

- Vercel env vars (Production):
  - BASE_URL: https://subdivide.whatcanibuild.com.au (set interactively — no trailing \n)
  - STRIPE_SECRET_KEY: sk_live_... (set interactively)
  - STRIPE_WEBHOOK_SECRET: whsec_... (set interactively — no trailing \n)
  - STRIPE_PRICE_ID: price_1TJ7hyCE1bAuirxF3etptjgk (not used by checkout.js — uses price_data inline)
  - STRIPE_PUBLISHABLE_KEY: pk_live_... (set — not used by frontend currently)
  - SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, MAPBOX_TOKEN, ALLOWED_ORIGIN: all set

- CRITICAL env var gotcha: Never use `echo "value" | vercel env add` on Windows Git Bash — appends \n to value. Always use `vercel env add` interactively (prompts for value).

- Known bugs / backlog:
  - [ ] Confirmation page hangs after payment — report generates and emails fine, UI polling never resolves
  - [ ] UTF-8 encoding: vercel.json charset fix pushed but may not be fully resolved — recheck
  - [ ] lotsize check returns `"error": "area_m2 required"` when DCDB parcel lookup fails (address outside coverage)
  - [ ] Infrastructure charges: when council is null (zone lookup fails), defaults to BCC rates — should return generic message
  - [ ] what_to_do_next step 4 hardcoded as "Infrastructure charges (BCC)" regardless of council
  - [ ] WhatCanIBuild webhook fires for SubdivideIQ payments (both listen to same Stripe account) — currently 0% error rate on WhatCanIBuild webhook but wrong product email sent first
  - [ ] STRIPE_PRICE_ID not used — checkout.js uses price_data inline. Either remove env var or refactor to use it.

- Stripe webhooks (both active on same account):
  - subdivide-live-webhook: https://subdivide.whatcanibuild.com.au/api/webhook — 100% success after whsec fix
  - whatcanibuild-destination: https://whatcanibuild.vercel.app/api/webhook — also fires on all payments (needs scoping)

- Post-launch backlog (add to subdivideiq BACKLOG.md):
  - [ ] Fix confirmation page polling / hang
  - [ ] Fix lotsize error when area_m2 missing
  - [ ] Fix infrastructure charge defaulting to BCC when council is null
  - [ ] Fix what_to_do_next BCC hardcoding
  - [ ] Scope Stripe webhooks by product (use metadata or separate Stripe accounts)
  - [ ] Reddit post: r/Brisbane + r/AusPropertyChat (NOT YET POSTED)

---

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays,
  school_catchments, bushfire_overlays, wcib_reports, api_keys, api_usage,
  subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports,
  clearoffer_notify
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- VentraIP DNS — UPDATED 6 April 2026:
  - whatcanibuild.com.au: A record → 216.198.79.1 (working — do not change)
  - www.whatcanibuild.com.au: CNAME → cname.vercel-dns.com
  - subdivide.whatcanibuild.com.au: CNAME → 7790b6a12b5ffc56.vercel-dns-017.com (Vercel token CNAME — NOT standard cname.vercel-dns.com)
  - clearoffer.com.au: A record update to 216.150.1.1 in progress
  - NOTE: Vercel now recommends token-based CNAMEs (vercel-dns-017.com format) not generic cname.vercel-dns.com
- Vercel outbound IP (for API allowlisting): 216.150.1.1 (confirmed April 2026)
- Stripe: same account for all products
  - WhatCanIBuild: live mode, $19.99 AUD
  - SubdivideIQ: live mode, $79 AUD + GST
  - ClearOffer: test mode, $99 AUD
- Resend: clearoffer.com.au verified (free tier, 1-domain limit)
  - WhatCanIBuild and SubdivideIQ send from hello@clearoffer.com.au
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers
- Nominatim: address autocomplete in ClearOffer (not Mapbox)

---

## Overnight build system
- Each product repo has BACKLOG.md — Claude Code reads and executes autonomously
- Start: claude --dangerously-skip-permissions in repo terminal
- Brief: "Read BACKLOG.md and work through every [ ] task. Do not stop. Mark [x] when done. Move to next task automatically."
- OVERNIGHT_LOG.md created per session with timestamps
- Trusted domains added to CLAUDE.md to avoid fetch permission prompts

---

## Key gotchas
- Always use $func$ not $$ for Supabase SQL
- Never combine cd and git in same command
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au (redirect issue)
- Gold Coast zone codes are full words not abbreviations
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed)
- Gold Coast: required ST_Transform from EPSG:28356
- Supabase v2: use try/catch not .catch() chaining
- buyerside repo uses main branch not master
- Vercel preview deployments need test Stripe keys scoped to Preview environment
- SubdivideIQ uses Option C — live API queries, not local data storage (see SubdivideIQ section)
- DCDB (QLD cadastral parcel API) has CORS restrictions — always call server-side, never from browser
- Claude Code bash variable substitution: use $(cat file) not $(<file) — angle-bracket form unreliable in some shells
- QSCF (QLD Spatial Community Framework) is the undocumented DCDB endpoint — not in official QLD docs
- NEVER use `echo "value" | vercel env add` on Windows Git Bash — appends \n to value, breaks Stripe and URL env vars
- Vercel domain token CNAMEs: some subdomains require token-format CNAME (7790b6a12b5ffc56.vercel-dns-017.com) not generic cname.vercel-dns.com — check Vercel dashboard DNS Records tab for exact value
- WhatCanIBuild wcib_reports Supabase writes failing silently — uses NEXT_PUBLIC_SUPABASE_URL (not set in prod)

---

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains: STATE.md + product docs for anything in development
- Rule: backlogs live in each product repo, NOT here

---

## Product priority order (current — 6 April 2026)
1. SubdivideIQ — LAUNCHED today. Post Reddit (r/Brisbane + r/AusPropertyChat) — NOT YET DONE
2. ZoneIQ — verify overnight session complete, then Sprint 16 (QFAO flood fallback)
3. ClearOffer — ON HOLD until data partner confirmed
4. WhatCanIBuild — live, minor bugs in backlog, no active work needed

---

## How to start a new Claude chat with full context
Paste this into claude.ai:
"Read my current project state from GitHub before we start:
https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md
I'm Steve, building a PropTech portfolio with Claude Code.
Once you've read it confirm you're up to speed.
IMPORTANT: Do not modify STATE.md without my explicit instruction to do so."
