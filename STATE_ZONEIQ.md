# ZoneIQ — zoneiq.com.au
- Repo: stevenpicton1979/zoneiq (main branch)
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Stack: Next.js 14 + Vercel + Supabase PostGIS (Pro tier, 8GB)
- Geocoder: Google Geocoding API (replaced Nominatim in Sprint 17). State-aware suffix detection (QLD/NSW/VIC/Australia). Key: GOOGLE_GEOCODING_API_KEY in Vercel env.
- RapidAPI: listed and public, proxy auth working, RAPIDAPI_PROXY_SECRET in Vercel env
- Status: LAUNCHED on RapidAPI. National coverage live (QLD SEQ + NSW Sydney + VIC Melbourne).
- API version: 2.0.0 (header: X-ZoneIQ-Version, meta.version in response body)
- OpenAPI spec: live at zoneiq-sigma.vercel.app/api/openapi (updated Sprint 26, v2.0.0 — full response shape, all overlays, national coverage)
- Marketing page: updated Sprint 27 — "Australia's planning zone API", 84 councils, all 6 overlay types, national demo addresses
- DECISIONS.md: exists in repo — read before making architectural changes
- Active backlog: BACKLOG.md in zoneiq repo — Sprint 29 added 10 April 2026 (QLD land valuation)

## ZoneIQ Dataset State (DB audit 9 April 2026)

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
- MELBOURNE: ANEF 20, 25 (Tullamarine only — Essendon confirmed absent from VIC Airport Environs MapServer)
- Western Sydney Airport: ANEF 20-25, 25-30, 30-35, 35-40
- ABSENT: Sydney Kingsford Smith — confirmed not in any NSW public ArcGIS service. Manual acquisition required.
- ABSENT: Essendon — confirmed not in VIC Airport Environs MapServer
- NOTE: Avalon Airport has queryable ANEF layers — added to ideas to spec

**heritage_overlays: 3,657** — State QLD-wide (1,800) + local Brisbane (1,857)
**bushfire_overlays: 132,000** — 13 SEQ LGAs
**api_usage: wired** — telemetry active since Sprint 18 (partial, overlays_returned columns confirmed)
**character_overlays: 14,164** — Brisbane only

## ZoneIQ Sprint History
- Sprints 1–28: COMPLETE — see previous STATE.md entries

## ZoneIQ Known Gaps
- Sydney Kingsford Smith ANEF: confirmed not available as open data — manual contact required
- Essendon Airport ANEF: confirmed not in VIC Airport Environs MapServer — manual acquisition required
- QFAO endpoint: awaiting QRA publication — update QFAO_URL in lib/zone-lookup.ts when live
- RapidAPI listing: low priority — not actively promoted, no external users yet
- Land valuation: QLD statutory values (QLD Globe / VG) — Sprint 29 backlog, not yet ingested

## ZoneIQ Architecture Notes
- OpenAPI spec live at https://zoneiq-sigma.vercel.app/api/openapi — authoritative reference for all field names, overlay shapes per state, partial response handling
- Strategic role: infrastructure API — powers WhatCanIBuild, ClearOffer, SubdivideIQ
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au (redirect issue)
- Partial responses: HTTP 200 with rules: null and meta.partial: true when zone not seeded
- ST_Contains(polygon, point) used for spatial queries — GiST index confirmed on zone_geometries
