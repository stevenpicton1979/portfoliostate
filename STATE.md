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
- Geocoder: Google Geocoding API (replaced Nominatim in Sprint 17). State-aware suffix detection (QLD/NSW/VIC/Australia). Key: GOOGLE_GEOCODING_API_KEY in Vercel env.
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- Status: LAUNCHED on RapidAPI. National coverage live (QLD SEQ + NSW Sydney + VIC Melbourne).
- API version: 2.0.0 (header: X-ZoneIQ-Version, meta.version in response body)
- DECISIONS.md: exists in repo — read before making architectural changes
- Active backlog: BACKLOG.md in zoneiq repo

#### ZoneIQ Dataset State (DB audit 9 April 2026)

**zone_geometries: 238,993 polygons across 84 councils**
- SEQ (7 councils): sunshinecoast 106,204 · goldcoast 29,537 · brisbane 26,358 · moretonbay 13,950 · logan 6,920 · redland 6,266 · ipswich 1,516
- NSW (target + fringe): central coast 2,625 · northern beaches 1,413 · sutherland shire 1,407 · blacktown 1,337 · parramatta 1,144 · canterbury-bankstown 1,128 · inner west 1,122 · blue mountains 1,024 · penrith 896 · ku-ring-gai 864 · hornsby 829 · liverpool 742 · the hills shire 724 · sydney 672 · north sydney 652 · cumberland 629 · wollondilly 620 · fairfield 612 · wollongong 589 · ryde 573 · hawkesbury 572 · georges river 542 · campbelltown 911 · randwick 411 · willoughby 441 · canada bay 340 · mosman 257 · lane cove 225 · woollahra 206 · strathfield 180 · waverley 161 · wingecarribee 134 · hunters hill 110 · burwood 90 · lithgow city 2
- VIC (target + fringe): yarra ranges 1,522 · mornington peninsula 1,252 · casey 1,072 · monash 952 · bayside 945 · knox 879 · darebin 801 · kingston 783 · whitehorse 783 · boroondara 749 · cardinia 748 · wyndham 703 · stonnington 690 · brimbank 680 · merri-bek 665 · banyule 640 · frankston 628 · yarra 627 · greater geelong 597 · whittlesea 596 · hume 574 · maroondah 568 · nillumbik 552 · greater dandenong 531 · hobsons bay 516 · manningham 508 · melbourne 443 · port phillip 400 · glen eira 395 · maribyrnong 382 · moonee valley 361 · melton 339 · macedon ranges 262 · bass coast 218 · moorabool 207 · queenscliffe 73 · french-elizabeth-sandstone islands 29 · port of melbourne 22 · surf coast 6 · murrindindi 89 · mitchell 91
- Note: fringe councils (cardinia, casey, wyndham, wingecarribee etc.) crept in from bounding boxes — no matching zone_rules, will return partial responses. Not a functional problem.

**zone_rules: 222 total**
- brisbane: 18 (CF, CR, DC, HDR, IN, IND1, LDR, LMDR, LMR, MDR, MU, MU1, NCR, PC, PDA, SBCA, SP, SR)
- goldcoast: 24 · ipswich: 56 · logan: 16 · moretonbay: 14 · redland: 22 · sunshinecoast: 22
- NSW_standard: 29 (R1, R2, R3, R4, B4, IN1, RE1 + others)
- VIC_standard: 21 (GRZ, NRZ, RGZ, MUZ, C1Z, IN1Z, PPRZ + others)

**flood_overlays: 196,403 total**
- goldcoast: 159,950 · redland: 23,700 · brisbane_river: 5,102 · overland_flow: 2,000
- Vicmap_Planning (VIC — LSIO/FO/SBO): 1,742 · sunshinecoast: 1,561 · moretonbay: 1,000
- NSW_EPI: 540 · logan: 520 · ipswich: 288

**school_catchments: 2,206 total**
- 1,724 primary + 482 secondary
- QLD + NSW + VIC records present
- Note: no council column on this table — cannot filter by LGA without schema change
- suburb column null for all QLD records

**noise_overlays: 18 rows**
- BRISBANE: ANEF 20, 25, 30, 35 (3 polygons at 35)
- ARCHERFIELD: ANEF 20, 25, 30
- GOLD_COAST: ANEF 20, 25, 30, 35, 40
- MELBOURNE: ANEF 20, 25 (Tullamarine only — Essendon absent)
- Western Sydney Airport: ANEF 20-25, 25-30, 30-35, 35-40
- ABSENT: Sydney Kingsford Smith — manual acquisition required

**heritage_overlays: 3,657** — State QLD-wide (1,800) + local Brisbane (1,857)
**bushfire_overlays: 132,000** — 13 SEQ LGAs
**api_usage: wired** — telemetry active since Sprint 18 (partial, overlays_returned columns confirmed)
**character_overlays: 14,164** — Brisbane only

#### ZoneIQ Sprint History
- Sprints 1–15: Complete (SEQ zone geometries, overlays, RapidAPI launch)
- Sprint 16: COMPLETE — QFAO fallback architecture wired. QFAO endpoint not publicly available — graceful null returned. Update QFAO_URL in lib/zone-lookup.ts when QRA publishes queryable FeatureServer.
- Sprint 17: COMPLETE — ZONE_NOT_SEEDED gate removed, SEQ bounding box guard, Google geocoder, .vercelignore fix (data/ dir was 1.3GB)
- Sprint 17b: COMPLETE — Brisbane zone rules seeded (LMR, SP, MU, CF, IN, SR confirmed present, total Brisbane rules = 18)
- Sprint 18: COMPLETE — ClearOffer response shape validated, api_usage telemetry wired (12 rows confirmed)
- Sprint 19: COMPLETE — 25,242 NSW zone polygons, 29 NSW_standard rules, geocoder NSW support
- Sprint 20: COMPLETE — 540 NSW EPI flood polygons
- Sprint 21: COMPLETE — 920 NSW school catchments, Western Sydney Airport ANEF (4 contours). Sydney KSF absent.
- Sprint 22: COMPLETE — 22,254 VIC zone polygons, 1,742 LSIO/FO/SBO flood overlays, 21 VIC_standard rules
- Sprint 23: COMPLETE — 888 VIC school zones, Melbourne ANEF20 + ANEF25 (Tullamarine). Essendon absent.
- Sprint 24: COMPLETE — SEQ flood gap fill: GC 159,950 · Redland 23,700 · SC 1,561 · MBRC 1,000 · Logan 520 · Ipswich 288
- Sprint 25: COMPLETE — National geocoder (lat -44 to -10, lng 112 to 154), state-aware suffix, API v2.0.0, 10-address national smoke test passed

#### ZoneIQ Known Gaps (manual action required)
- Sydney Kingsford Smith ANEF: not publicly available as open data — manual acquisition required
- Essendon Airport ANEF: not ingested — check VIC planning portal again
- QFAO endpoint: awaiting QRA publication — update QFAO_URL in lib/zone-lookup.ts when live
- RapidAPI listing: needs updating to reflect NSW + VIC national coverage
- zoneiq.com.au marketing page: needs updating to reflect national coverage
- school_catchments: no council column — add if LGA filtering needed in future
- Fringe councils in zone_geometries have no zone_rules — return partial responses (by design)

#### ZoneIQ Architecture Notes
- Strategic role: infrastructure API — powers WhatCanIBuild, ClearOffer, SubdivideIQ
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au (redirect issue)
- Partial responses: HTTP 200 with rules: null and meta.partial: true when zone not seeded
- ST_Contains(polygon, point) used for spatial queries — GiST index confirmed on zone_geometries
- QFAO fallback: QLD only, live query, not ingested into Supabase
- NSW flood: queried from flood_overlays where source = 'NSW_EPI'
- VIC flood: queried from flood_overlays where source = 'Vicmap_Planning'

### ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only
- Status: HOLDING — waiting Domain API + PropTechData approvals
- ZoneIQ integration: Sprint 18 complete — response shape validated, overlays.flood/bushfire/heritage/noise/character/schools all wired. Disclaimer shown when meta.partial = true.

### SubdivideIQ — pre-launch
- Repo: stevenpicton1979/subdivideiq (to be created)
- Domain: TBD — will buy at launch
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Status: IN DESIGN — product brief, backlog and data sources in portfoliostate repo
- See: SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## Infrastructure
- Supabase project: fzykfxesznyiigoyeyed (Pro tier, 8GB — estimated 2–3GB used)
- Tables: zone_geometries, zone_rules, flood_overlays, character_overlays, school_catchments, bushfire_overlays, wcib_reports, api_keys, api_usage, heritage_overlays, noise_overlays
- Vercel team: stevenpicton1979s-projects
- VentraIP domains: zoneiq.com.au, whatcanibuild.com.au, clearoffer.com.au
- Stripe: same account, WhatCanIBuild live, ClearOffer test
- Resend: clearoffer.com.au verified (free tier, 1 domain limit)
- RapidAPI: ZoneIQ listed, public, Basic/Pro/Ultra tiers — description needs updating for national coverage
- Google Cloud: Geocoding API enabled, key in Vercel env as GOOGLE_GEOCODING_API_KEY

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
- Sydney Kingsford Smith ANEF: not available as open data — manual acquisition required
- Essendon Airport ANEF: check planning.vic.gov.au again
- QFAO (QLD rural fallback): endpoint not publicly available — awaiting QRA publication

## Portfolio state repo
- Repo: stevenpicton1979/portfoliostate
- Purpose: meta-repo for cross-product docs only — no product code
- Contains: STATE.md, SUBDIVIDEIQ.md, SUBDIVIDEIQ_BACKLOG.md, SUBDIVIDEIQ_DATA_SOURCES.md

## How to start a new Claude chat with full context
Open new chat at claude.ai and paste:
"Read my current project state from GitHub before we start: https://raw.githubusercontent.com/stevenpicton1979/portfoliostate/main/STATE.md — I'm Steve, building a PropTech portfolio with Claude Code. Once you've read it confirm you're up to speed."
