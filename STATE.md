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
- Known issues: ZoneIQ URL must be zoneiq-sigma.vercel.app not zoneiq.com.au (redirect issue on server-side fetch)
- No active work underway

### ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS
- Coverage: Brisbane, Gold Coast, Moreton Bay, Sunshine Coast, Ipswich, Logan, Redland = 189,751 polygons
- Overlays: flood, character, schools, bushfire (Sprint 8 complete), heritage (Sprint 9 — verify complete)
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- API keys: working, stored in api_keys table
- Nearest polygon fallback: plpgsql function confirmed in Supabase
- DECISIONS.md: exists in repo, documents key architectural decisions D38-D40
- Show HN: planned after RapidAPI listing — NOT YET DONE
- Status: LAUNCHED on RapidAPI
- Current: Sprint 14 IN PROGRESS
- Sprint history: Sprints 11-13 (Ipswich, Logan, Redland) [x] COMPLETE
- Sprint queue: Sprint 14 [ ] in progress, Sprint 10 aircraft noise still to do

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au + buyerside.stevenpicton.ai
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only, $149 AUD Scout Report product
- Address autocomplete: Nominatim (not Mapbox)
- Status: HOLDING — lower priority, will revisit after SubdivideIQ

- What actually works:
  - Address autocomplete via Nominatim ✅
  - Scout Report renders with ZoneIQ data (zone, flood, character, schools) ✅
  - Email gate working ✅
  - Stripe checkout ($149 AUD, test mode) ✅
  - Claude AI Buyer's Brief generation (streaming) ✅
  - Resend email from hello@clearoffer.com.au ✅

- What does NOT work / is mock data:
  - Domain.com.au API not connected — listings data is placeholder/mock
  - PropTechData comparable sales not connected — mock data
  - Price estimation not connected
  - Agent data not connected
  - NOT ready for real users — significant mock data throughout

- Blockers (unresolved):
  - Domain API: Listings Management Sandbox active, full API access PENDING approval
  - PropTechData: credentials pending (emailed hello@proptechdata.com.au)
  - Stripe: must switch to live mode before launch

- Next steps when prioritised:
  - Wire Domain Agents & Listings API
  - Wire Domain Price Estimation
  - Wire PropTechData comparable sales
  - Replace all mock data
  - Thorough testing and validation
  - Switch Stripe to live mode
  - Launch

### SubdivideIQ — in development
- Repo: stevenpicton1979/subdivideiq (created, Sprint 1 complete)
- Domain: TBD — will buy at launch (do not buy yet)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Status: ACTIVE DEVELOPMENT — highest current priority after ZoneIQ Sprint 14
- Product docs: SUBDIVIDEIQ.md, SUBDIVIDEIQ_DATA_SOURCES.md in portfoliostate repo
- Backlog: BACKLOG.md in subdivideiq repo

- Sprint 1 [x] COMPLETE:
  - Repo scaffold created
  - Supabase tables created (subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports)
  - BCC parcel data loaded
  - BCC stormwater data loaded
  - Address geocoding function built

- Next: Sprint 2 — feasibility checks engine
  - S2-1: Zone check (api/check-zone.js)
  - S2-2: Flood overlay check (api/check-flood.js)
  - S2-3: Slope/elevation check (api/check-elevation.js)
  - S2-4: Stormwater proximity check (api/check-stormwater.js)
  - S2-5: Character overlay check (api/check-character.js)
  - S2-6: Lot size viability (api/check-lotsize.js)
  - S2-7: Master feasibility aggregator (api/feasibility.js)

- DATA ARCHITECTURE — Option C (DO NOT CHANGE without discussing with Steve):
  - External APIs called at query time — do NOT download and store BCC/QLD datasets locally
  - Lot boundaries: BCC Open Data API (live query)
  - Elevation/slope: QLD ArcGIS ImageServer REST (live query)
    URL: https://spatial-img.information.qld.gov.au/arcgis/rest/services/Elevation/QldDem/ImageServer
  - Stormwater: BCC Open Data API (live query)
  - Flood/zone data: ZoneIQ Supabase (already stored — only exception to Option C)

- Product background:
  - Steve spent $7.5k on failed subdivision at 6 Glenheaton Court, Carindale
  - Hydraulics report (Storm Water Consulting, RPEQ-signed) confirmed flood overlay constraints
  - SubdivideIQ pre-screens viability before homeowners engage any consultants
  - Traffic light report: GREEN/AMBER/RED, $79 AUD
  - See SUBDIVIDEIQ.md for full product brief

---

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays,
  school_catchments, bushfire_overlays, wcib_reports, api_keys, api_usage,
  subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- VentraIP DNS pattern for all products: A record → 76.76.21.21, CNAME → cname.vercel-dns.com
- Stripe: same account, WhatCanIBuild live, ClearOffer test, SubdivideIQ not yet set up
- Resend: clearoffer.com.au verified (free tier, 1-domain limit — blocks other domain verification)
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

---

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains: STATE.md + product docs for anything in development
- Rule: backlogs live in each product repo, NOT here

---

## Product priority order (current)
1. ZoneIQ Sprint 14 — complete first
2. SubdivideIQ Sprint 2 onwards — active build
3. ClearOffer — revisit after SubdivideIQ launches
4. WhatCanIBuild — live, no active work needed

---

## How to start a new Claude chat with full context
Paste this into claude.ai:
"Read my current project state from GitHub before we start:
https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md
I'm Steve, building a PropTech portfolio with Claude Code.
Once you've read it confirm you're up to speed.
IMPORTANT: Do not modify STATE.md without my explicit instruction to do so."
