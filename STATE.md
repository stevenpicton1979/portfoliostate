# Steve Picton — PropTech Portfolio State
Last updated: 6 April 2026

## Products

### WhatCanIBuild — whatcanibuild.com.au
- Repo: stevenpicton1979/whatcanibuild
- Live: whatcanibuild.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: LIVE mode, $19.99 AUD, webhook on checkout.session.completed
- Supabase: fzykfxesznyiigoyeyed, table: wcib_reports
- Resend: sending from hello@clearoffer.com.au (temporary)
- Status: LAUNCHED — posted on r/Brisbane
- Known issues: ZoneIQ URL must be zoneiq-sigma.vercel.app not zoneiq.com.au (redirect issue on server-side fetch)
- Testing task added to BACKLOG.md

### ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS
- Coverage: Brisbane, Gold Coast, Moreton Bay, Sunshine Coast = 175,049 polygons
- Overlays: flood, character, schools, bushfire, heritage ✅
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- Status: LAUNCHED on RapidAPI
- Sprints 1–8: complete
- Sprint 9: COMPLETE — QLD State Heritage Register (1,800 polygons) + BCC Local Heritage Area (1,857 polygons) = 3,657 total. API returns heritage object.
- Sprints 10–15: running overnight (aircraft noise, Ipswich, Logan, Redland, contaminated land, acid sulfate)
- CLAUDE.md updated with permissions/interrupts rules (never pause, log errors and continue)
- Branch note: main branch created and synced with master — use main going forward

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only
- Status: HOLDING — waiting Domain API + PropTechData approvals
- Testing task added to BACKLOG.md

### SubdivideIQ — pre-launch
- Repo: stevenpicton1979/subdivideiq ✅ created
- Domain: TBD at launch
- Stack: Vanilla HTML/CSS/JS + Vercel serverless + Supabase fzykfxesznyiigoyeyed
- Pricing: $79 AUD confirmed
- Sprint 1: COMPLETE — S1-1 scaffold, S1-2 Supabase tables, S1-3 parcel data, S1-4 stormwater data, S1-5 geocode API
- Full Brisbane data loads: scripts written and tested, need manual run (~50 min total)
- Sprint 2: COMPLETE — zone, flood, elevation, stormwater, character, lotsize checks + feasibility aggregator
- Sprint 3: COMPLETE — Stripe checkout ($79 AUD), webhook (raw body + sig verify + async processReport), pdfkit PDF, frontend rewrite (Mapbox GL lot boundary, locked TL preview), confirmation page (polling + traffic light reveal), report-status API
- Sprint 3 tests: T5 feasibility AMBER ✅ T6 PDF valid ✅ T8 Supabase ✅ — T1/2/3/4/7/9 manual pending
- Sprint 4: PENDING — Vercel env vars, full Brisbane data loads, Stripe live mode, Jest tests, staging test
- Status: IN BUILD — Sprint 4 (launch prep) remaining
- BACKLOG.md lives in subdivideiq repo (copy in portfoliostate as SUBDIVIDEIQ_BACKLOG.md)

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays, school_catchments, bushfire_overlays, heritage_overlays, noise_overlays (in progress), wcib_reports, api_keys, api_usage, subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- Stripe: same account, WhatCanIBuild live, ClearOffer test
- Resend: clearoffer.com.au verified (free tier, 1 domain limit)
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers

## Overnight build system
- Each product repo has BACKLOG.md — Claude Code reads and executes tasks autonomously
- Start: claude --dangerously-skip-permissions in repo terminal
- Brief: "Read BACKLOG.md and work through every [ ] task. Do not stop. Mark [x] when done. Move to next task automatically."
- OVERNIGHT_LOG.md created per session with timestamps
- Trusted domains added to CLAUDE.md to avoid fetch permission prompts
- CLAUDE.md permissions/interrupts rules: never pause, log errors to OVERNIGHT_LOG.md and continue

## Key gotchas
- Always use $func$ not $$ for Supabase SQL
- Never combine cd and git in same command
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au
- Gold Coast zone codes are full words not abbreviations
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed)
- Gold Coast: required ST_Transform from EPSG:28356
- Supabase v2: use try/catch not .catch() chaining
- buyerside repo uses main branch not master
- zoneiq repo: main branch now created and synced — use main going forward
- Vercel preview deployments need test Stripe keys scoped to Preview environment

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains STATE.md + product docs + backlog copies for anything in development

## How to start a new Claude chat with full context
Open new chat at claude.ai and paste:
"Read my current project state from GitHub before we start: https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md — I'm Steve, building a PropTech portfolio with Claude Code. Once you've read it confirm you're up to speed. I want to continue building [PRODUCT] — also read [relevant .md files]."

Relevant .md files by product:
- ZoneIQ: ZONEIQ_BACKLOG.md
- SubdivideIQ: SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md
- ClearOffer: CLEAROFFER.md, CLEAROFFER_BACKLOG.md
