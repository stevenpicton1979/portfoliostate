# Steve Picton — PropTech Portfolio State
Last updated: 6 April 2026
State management: Each product repo contains its own BACKLOG.md as source of truth.
This file is the portfolio overview only — one section per product.

---

## Products

### WhatCanIBuild — whatcanibuild.com.au
- Repo: stevenpicton1979/whatcanibuild
- Live: whatcanibuild.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: LIVE mode, $19.99 AUD
- Supabase: fzykfxesznyiigoyeyed, table: wcib_reports
- Resend: hello@clearoffer.com.au
- Status: LAUNCHED — posted on r/Brisbane
- Known issues: calls zoneiq-sigma.vercel.app not zoneiq.com.au (server-side redirect issue)
- Backlog: stevenpicton1979/whatcanibuild — BACKLOG.md

### ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS
- Coverage: Brisbane, Gold Coast, Moreton Bay, Sunshine Coast, Ipswich (S11), Logan (S12 — 6,920 polygons), Redland (S13 — 6,266 polygons)
- Total polygons: 189,751 (175,049 original SEQ + 14,702 Ipswich/Logan/Redland)
- Overlays: flood, character, schools, bushfire, heritage, aircraft noise (BNE + Archerfield + Gold Coast, 14 polygons)
- RapidAPI: listed and public, Basic/Pro/Ultra tiers
- Status: LAUNCHED — Sprints 1–13 complete, Sprint 14 in progress (contaminated land API investigation)
- Backlog: stevenpicton1979/zoneiq — BACKLOG.md

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch)
- Live: clearoffer.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only
- Status: HOLDING — waiting Domain API + PropTechData approvals
- Backlog: stevenpicton1979/buyerside — BACKLOG.md

### SubdivideIQ — subdivideiq.vercel.app (pre-launch)
- Repo: stevenpicton1979/subdivideiq
- Live: https://subdivideiq.vercel.app (domain not purchased yet)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Supabase: fzykfxesznyiigoyeyed — tables: subdivide_parcels (partial Brisbane), subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports
- Stripe: TEST mode — sandbox confirmed working end-to-end, live keys not yet configured
- Resend: hello@clearoffer.com.au
- Feasibility checks: zone, flood, elevation, stormwater, character, lotsize, contaminated, infrastructure, easements, acid sulfate (10 checks, all working)
- Status: PIPELINE CONFIRMED WORKING (6 April 2026) — pre-launch
- Pending: ARCH-1 cadastral API decision, domain purchase, live Stripe, launch
- Backlog: stevenpicton1979/subdivideiq — BACKLOG.md

---

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays, school_catchments, bushfire_overlays, heritage_overlays, noise_overlays, wcib_reports, api_keys, api_usage, subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- Stripe: one account — WhatCanIBuild live, SubdivideIQ test, ClearOffer test
- Resend: clearoffer.com.au verified (free tier, 1 domain limit)
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers

---

## Key gotchas
- Always use $func$ not $$ for Supabase SQL
- Never combine cd and git in same command — use git -C /path instead
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au
- Gold Coast zone codes are full words not abbreviations
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed)
- Gold Coast: required ST_Transform from EPSG:28356
- Supabase v2: use try/catch not .catch() chaining
- buyerside repo uses main branch not master
- SubdivideIQ webhook must await processReport before res.json() (25s race timeout)
- Vercel env vars set via CLI pipe can have \n corruption — always verify after setting
- MAPBOX_TOKEN fetched from /api/config endpoint — not injected at build time
- Vercel preview deployments need test Stripe keys scoped to Preview environment

---

## Overnight build system
- Start Claude Code: claude --dangerously-skip-permissions in repo terminal
- Brief: "Read BACKLOG.md and work through every [ ] task. Do not stop. Mark [x] when done. Move to next task automatically."
- Each session creates/updates OVERNIGHT_LOG.md in the product repo with timestamps
- Trusted domains listed in CLAUDE.md per repo

---

## State management
- This file (STATE.md) = portfolio overview only — one-liner status per product
- Each product repo BACKLOG.md = source of truth for that product's tasks
- No duplicate backlog files in portfoliostate
- Update STATUS line in this file after each significant session

---

## How to start a new Claude chat with full context
"Read my current project state from GitHub before we start:
https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md
— I'm Steve, building a PropTech portfolio with Claude Code. Once you've read it confirm you're up to speed."
