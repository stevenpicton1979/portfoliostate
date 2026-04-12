# Portfolio — cross-product summary

## SubdivideIQ — pre-launch
- Repo: stevenpicton1979/subdivideiq (to be created)
- Domain: TBD — will buy at launch
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Status: IN DESIGN — product brief, backlog and data sources in portfoliostate repo
- See: SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed (Pro tier, 8GB — estimated 2–3GB used)
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays, school_catchments, bushfire_overlays, wcib_reports, api_keys, api_usage, heritage_overlays, noise_overlays
- ClearOffer Supabase project: dqzqqfcepsqhaxovneen, tables: scout_reports, suburb_stats_cache
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- Stripe: same account, WhatCanIBuild live, ClearOffer test
- Resend: clearoffer.com.au verified (free tier, 1 domain limit)
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers — low priority, not actively promoted
- Google Cloud: Geocoding API + Places API enabled, key in Vercel env as GOOGLE_GEOCODING_API_KEY

## Overnight build system
- Each product repo has BACKLOG.md — Claude Code reads and executes tasks autonomously
- Start: claude --dangerously-skip-permissions in repo terminal
- Slack keywords: zoneiq, subdivideiq, clearoffer, whatcanibuild, portfolio
- Single sprint: "sprint: zoneiq [N]" to #claude-tasks
- All remaining: "overnight: zoneiq" to #claude-tasks
- Brief: "Read BACKLOG.md and work through sprint [N]. Mark [x] tasks when done. Do not stop within a sprint. Log to OVERNIGHT_LOG.md with timestamps."
- OVERNIGHT_LOG.md created per session with timestamps
- Trusted domains added to CLAUDE.md to avoid fetch permission prompts
- Slack listener: running 24/7 via Task Scheduler at C:/dev/claude-listener

## Key gotchas
- ClearOffer: always check zoneiq-sigma.vercel.app/api/openapi before wiring new overlay fields — field names differ by state
- ClearOffer: PropTechData NEVER on free report — paid report only, currently stubbed
- ClearOffer: vercel dev --listen 3001 only. Never npm run dev.
- ClearOffer: COMING_SOON env var controls root — true=coming-soon, false=live app
- Always use func not $$ for Supabase SQL
- Never combine cd and git in same command
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au
- Gold Coast zone codes are full words not abbreviations
- Gold Coast: ST_Transform from EPSG:28356 required
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed)
- VIC (Vicmap): GDA94 VicGrid EPSG:3111 — ST_Transform required (same pattern as Gold Coast)
- NSW ePlanning: check CRS per layer — may need reprojection to WGS84
- Supabase v2: use try/catch not .catch() chaining
- DCDB API has CORS restrictions — always call server-side
- Claude Code bash: use $(cat file) not $(<file)
- buyerside repo uses main branch not master
- Vercel preview deployments need test Stripe keys scoped to Preview environment
- data/ directory in zoneiq repo is 1.3GB — excluded via .vercelignore (do not remove)
- ST_Contains(polygon, point) uses GiST index correctly — do not use ST_Within(point, polygon)
- Google geocoder appends state suffix — state detection uses NSW/VIC/QLD keywords in address string
- school_catchments has no council column — cannot filter by LGA
- noise_overlays has no source column — airport name is the identifier
- Fringe VIC/NSW councils in zone_geometries have no zone_rules — partial responses expected

## National data sources (ingested)
- NSW zoning: mapprod3.environment.nsw.gov.au ePlanning Planning_Portal_LEP MapServer
- NSW flood: mapprod3.environment.nsw.gov.au Planning/Hazard MapServer/1 (source='NSW_EPI')
- NSW schools: data.nsw.gov.au catchments.zip
- VIC zoning + flood: data-planvic.opendata.arcgis.com (Vicmap Planning, source='Vicmap_Planning')
- VIC schools: discover.data.vic.gov.au Victorian Government School Zones 2024
- VIC ANEF: planning.vic.gov.au airport spatial information (Tullamarine ANEF20+25 only)
- Western Sydney Airport ANEF: ingested (4 contours, range bands)

## National data sources (not yet ingested)
- Sydney Kingsford Smith ANEF: confirmed not open data — manual contact required
- Essendon Airport ANEF: confirmed not in VIC Airport Environs MapServer — manual required
- Avalon Airport ANEF: queryable layers found in Sprint 28 — to be scheduled
- QFAO (QLD rural fallback): endpoint not publicly available — awaiting QRA publication

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains: STATE.md (deprecated), STATE_PROPERTYDATA.md, STATE_ZONEIQ.md, STATE_CLEAROFFER.md, STATE_WHATCANIBUILD.md, STATE_PORTFOLIO.md, SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## How to start a new session with full context

**Single product session** (e.g. PropertyData work):
Open a new chat, select C:\dev\portfoliostate, and say:
"Read STATE_PROPERTYDATA.md before we start. I'm Steve, building a PropTech portfolio."

Replace the filename with whichever product you're working on:
- PropertyData  → STATE_PROPERTYDATA.md
- ZoneIQ        → STATE_ZONEIQ.md
- ClearOffer    → STATE_CLEAROFFER.md
- WhatCanIBuild → STATE_WHATCANIBUILD.md

**Cross-product session** (e.g. infra, state management, portfolio-level planning):
"Read STATE_PORTFOLIO.md and all STATE_*.md files in this folder. I'm Steve, building a PropTech portfolio."

**Claude Code overnight sessions** read CLAUDE.md in each repo automatically — no paste needed.
