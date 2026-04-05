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
- Repo: stevenpicton1979/subdivideiq ✅
- Deployed: https://subdivideiq.vercel.app ✅
- Domain: TBD at launch
- Stack: Vanilla HTML/CSS/JS + Vercel serverless + Supabase fzykfxesznyiigoyeyed
- Pricing: $79 AUD
- Sprint 1: COMPLETE
- Sprint 2: COMPLETE — 6 feasibility checks + aggregator
- Sprint 2B: COMPLETE — contaminated land (AMBER stub, no public QLD API), infrastructure charges ($28,730/lot urban), powerline easements (live ArcGIS BCC City Plan), acid sulfate soils (live ArcGIS). All 4 integrated into feasibility aggregator, PDF, email, confirmation page.
- Sprint 3: COMPLETE — Stripe checkout, webhook (raw body, sig verify, async), pdfkit PDF, Mapbox GL frontend, confirmation page with polling
- Sprint 4: MOSTLY COMPLETE — Vercel env vars ✅ CLAUDE.md ✅ suburb loader ✅ Jest 6/6 ✅ deployed ✅
- Sprint 4 remaining: S4-4 Stripe live mode (MANUAL — needs real card test), S4-6 full staging test (MANUAL), S4-7 final sync
- Data: 16,115 parcels + 12,037 pipes loaded; suburb-by-suburb loader written for full 773k (run manually ~60 min)
- BCC API limitation: 10k record cap per query — load-all-suburbs.js iterates 195 suburbs
- Status: LAUNCH READY — pending Stripe live mode confirmation + full data load
- Production fix (2026-04-05): ALLOWED_ORIGIN Vercel env var had trailing newline → ERR_INVALID_CHAR on all endpoints. Fixed with .trim() in all 7 API files. Deployed commit 8d002b1.
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
