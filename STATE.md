# Steve Picton — PropTech Portfolio State
Last updated: 9 April 2026

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

### ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq (main branch)
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS (Pro tier, 8GB)
- Geocoder: Google Geocoding API (replaced Nominatim in Sprint 17). Appends state suffix to all queries. Key in Vercel env as GOOGLE_GEOCODING_API_KEY.
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- Status: LAUNCHED on RapidAPI. National expansion in progress (NSW + VIC).
- Active backlog: ZONEIQ_BACKLOG.md in zoneiq repo. Sprints 17b–25 queued.
- DECISIONS.md: exists in repo — read before making architectural changes

#### ZoneIQ Dataset State (from DATASET_AUDIT.md, 8 April 2026)
- zone_geometries: 190,751 polygons across 7 SEQ councils
- zone_rules: 166 total — Brisbane only 12 before Sprint 17b seed (LMR/SP/MU/CF/IN/SR pending Supabase recovery)
- flood_overlays: 7,102 — Brisbane ONLY. Gold Coast, Moreton Bay, Sunshine Coast, Ipswich, Logan, Redland = zero (Sprint 24 fixes this)
- character_overlays: 14,164 — Brisbane ONLY
- school_catchments: 398 — Brisbane ONLY
- bushfire_overlays: 132,000 — 13 SEQ LGAs (best coverage)
- heritage_overlays: 3,657 — State QLD-wide (1,800) + local Brisbane (1,857)
- noise_overlays: 14 — Brisbane Airport, Archerfield, Gold Coast Airport
- api_usage: 0 rows — telemetry unwired (Sprint 18 fixes this)

#### ZoneIQ Sprint History
- Sprints 1–15: Complete (SEQ zone geometries, overlays, RapidAPI launch)
- Sprint 16: QFAO flood fallback (complete)
- Sprint 17: API delivery bug fixes — ZONE_NOT_SEEDED gate removed, SEQ bounding box guard, Google geocoder, .vercelignore fix. COMPLETE except Task 4 (Brisbane zone seed — pending Supabase recovery)
- Sprint 17b–25: Queued in ZONEIQ_BACKLOG.md

#### ZoneIQ Key Architecture Notes
- Strategic role: infrastructure API, not consumer brand — powers WhatCanIBuild, ClearOffer, SubdivideIQ
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au (redirect issue on server-side fetch)
- ST_Contains(polygon, point) used for spatial queries — index verified on GiST
- Partial responses: when zone rules not seeded, returns HTTP 200 with rules: null and meta.partial: true (Sprint 17)
- National expansion target: NSW (Sydney) and VIC (Melbourne) — data sources identified, ingest sprints queued

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only
- Status: HOLDING — waiting Domain API + PropTechData approvals
- ZoneIQ integration: calls zoneiq-sigma.vercel.app. Response shape validation queued in Sprint 18.

### SubdivideIQ — pre-launch
- Repo: stevenpicton1979/subdivideiq (to be created)
- Domain: TBD — will buy at launch
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Status: IN DESIGN — product brief, backlog and data sources in portfoliostate repo
- See: SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed (Pro tier, 8GB limit, ~1–2GB used)
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays, school_catchments, bushfire_overlays, wcib_reports, api_keys, api_usage, heritage_overlays, noise_overlays
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- Stripe: same account, WhatCanIBuild live, ClearOffer test
- Resend: clearoffer.com.au verified (free tier, 1 domain limit)
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers
- Google Cloud: Geocoding API enabled, key in Vercel env

## Overnight build system
- Each product repo has BACKLOG.md — Claude Code reads and executes tasks autonomously
- Start: claude --dangerously-skip-permissions in repo terminal
- Slack keywords to trigger: zoneiq, subdivideiq, clearoffer, whatcanibuild, portfolio
- Overnight trigger: send "overnight: zoneiq" to #claude-tasks
- Sprint trigger: send "sprint: zoneiq sprint 18" to #claude-tasks (runs single sprint)
- Brief: "Read ZONEIQ_BACKLOG.md and work through sprint [N]. Do not stop. Mark [x] when done."
- OVERNIGHT_LOG.md created per session with timestamps
- Trusted domains added to CLAUDE.md to avoid fetch permission prompts
- Slack listener: running 24/7 via Task Scheduler at C:/dev/claude-listener

## Key gotchas
- Always use func not $$ for Supabase SQL (func keyword, not dollar-quoting)
- Never combine cd and git in same command
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au
- Gold Coast zone codes are full words not abbreviations
- Gold Coast: required ST_Transform from EPSG:28356
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed)
- VIC (Vicmap): GDA94 VicGrid projection EPSG:3111 — ST_Transform required (same pattern as Gold Coast)
- NSW ePlanning: GDA94 EPSG:4283 — check each layer, may need reprojection
- Supabase v2: use try/catch not .catch() chaining
- DCDB API has CORS restrictions — always call server-side
- Claude Code bash: use $(cat file) not $(<file)
- buyerside repo uses main branch not master
- Vercel preview deployments need test Stripe keys scoped to Preview environment
- data/ directory in zoneiq repo is 1.3GB — excluded via .vercelignore (do not remove)
- ST_Contains(polygon, point) uses GiST index correctly — do not use ST_Within(point, polygon)
- Google geocoder appends state suffix — must detect state from address string for NSW/VIC (Sprint 25)

## National expansion data sources (identified, not yet ingested)
- NSW zoning: https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_LEP/MapServer
- NSW flood: https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1
- NSW schools: https://data.nsw.gov.au/data/dataset/8b1e8161-7252-43d9-81ed-6311569cb1d7
- VIC zoning + flood: https://data-planvic.opendata.arcgis.com/ (Vicmap Planning)
- VIC schools: https://discover.data.vic.gov.au/dataset/victorian-government-school-zones-2024
- VIC ANEF (Melbourne + Essendon): https://www.planning.vic.gov.au/guides-and-resources/guides/all-guides/airports/airport-spatial-information
- All national ANEF: state planning portals (not Airservices direct — no licence required)

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains: STATE.md, SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## How to start a new Claude chat with full context
Open new chat at claude.ai and paste:
"Read my current project state from GitHub before we start: https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md — I'm Steve, building a PropTech portfolio with Claude Code. Once you've read it confirm you're up to speed."
