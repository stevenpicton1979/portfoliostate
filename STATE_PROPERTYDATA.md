# PropertyData — internal data aggregation layer
- Repo: stevenpicton1979/propertydata (master branch)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Port: 3002 (local dev)
- Auth: PROPERTYDATA_SECRET in Authorization header
- Supabase: shares fzykfxesznyiigoyeyed with ZoneIQ (Decision D2)
- Status: LIVE (deployed to Vercel + local) — Sprint 1+2+3+3.5+3.6+3.7+3.8+3.9+4.1+4.2+4.2.2+4.2.3+4.8+4.9 complete. ClearOffer switched over, data audit done, free report polished + aligned. PDF report endpoint live. Launch-grade test coverage (9 test files, 4 new test layers).
- Dashboard: 4-tab test UI (Report Preview, Data Quality, Raw Fields, Methodology) with satellite imagery, BCC flood/overlay layers. Download PDF button added to results.
- Free Report: light professional theme, Property Score 0-100 gauge (SVG ring + shared module api/lib/property-score.js), value-driven copy, Street View image, ICSEA scores on school cards, suburb stats timestamp, paid tier CTA, Inter font, responsive. Flood section leads with colour-coded risk headline. Australian language + planning framing throughout.
- PDF: POST /api/report-pdf — A4 PDF via pdfkit with all 13 sections. Same-origin Referer auth bypass. "Download PDF Report" button in UI. Score Rocklea=67 (flood-heavy), Ascot=93 (clean), Carindale=75 (medium).
- CI: GitHub Actions on push/PR to master. 9 test files now: adapter contracts (41), golden response schema (20), field registry (13), ICSEA (13), renderer alignment (5), suburb stats (14), golden snapshots (158), property score (82), cross-field consistency (406). Total: 752 passing, 0 failing, 14 soft warnings. Adapter coverage: 16/16. Accuracy test: 30 addresses (up from 13).
- Vercel: DEPLOYED to production (propertydata.vercel.app) — env vars set: PROPERTYDATA_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, GOOGLE_GEOCODING_API_KEY. RAPIDAPI_PROXY_SECRET not set (not in .env.local — not needed for core flow).

## PropertyData Architecture
- Single POST endpoint: /api/lookup { address, tier: "free"|"paid" }
- New PDF endpoint: POST /api/report-pdf { address, fields } — A4 PDF, pdfkit, same auth
- Field registry: 64 fields defined. Property Score extracted to api/lib/property-score.js (shared by PDF + frontend)
- 15 source adapters: bcc-cadastre, bcc-flood, bcc-overlays, bcc-infrastructure, bcc-amenity, zoneiq, icsea, suburb-stats, qps-crime, google-streetview, sa2-geocoder, abs-demographics, suburb-momentum, ai-neighbourhood, suburb-context
- Execution: cadastre first (gets polygon), then all others in parallel, ICSEA last (needs school names)
- Every field carries metadata: source, status, description, updated_at
- Dashboard: Report Preview (ClearOffer buyer view), Data Quality (coverage, source health), Raw Fields (grouped table + JSON)
- Map: Esri World Imagery satellite base + BCC Flood Awareness MapServer overlay + lot polygon. Layer controls for base/overlays. CORS proxy fallback via L.tileLayer.wms with custom getTileUrl (fixes {bbox} template issue). Nominatim geocoding fallback for non-cadastre addresses. Google Geocoding spatial fallback for unit addresses.
- DECISIONS.md in repo — read before architectural changes

## PropertyData Sprints
- Sprint 1: COMPLETE — 12/12 tasks, 11/11 smoke tests. All 34 live fields extracted from ClearOffer. 5 Brisbane addresses verified.
- Sprint 2: COMPLETE — ClearOffer switchover. zone-lookup.js (713→38 lines). buyers-brief.js uses PropertyData paid tier. 17/17 ClearOffer smoke tests pass. Zero direct BCC/ZoneIQ calls.
- Sprint 3: COMPLETE — 10/10 tasks. Landslide overlay, crime data, street view metadata, map proxy, ClearOffer branding, plain-English risk explanations, QA pass.
- Sprint 3.5: COMPLETE — Light theme, Property Score gauge, value callout ($300-800 lawyer comparison), 9 risk cards with cost-impact copy, section value statements, paid tier CTA, infrastructure tag fix (check boolean props not object truthiness), road type cleanup.
- Sprint 3.6: COMPLETE — 6/6 tasks. Fixed 7 field key mismatches (heritage, noise, overland flow, acid sulfate, biodiversity, school names). Fixed ICSEA object→number extraction. Street View image live (GCP API enabled). Suburb stats timestamp. 45 unit tests + GitHub Actions CI.
- Sprint 3.7 (Accuracy Testing): COMPLETE — 13-address accuracy test suite (49P/0F/15W). Bushfire buffer vs direct hazard regex fix (buffer=amber, direct=red). Flood badge cascade fix (creek→river→overland→AEP). Chapel Hill landslide test case added. CI accuracy workflow (.github/workflows/accuracy.yml) with GitHub secrets. Diagnostic scripts: check-carindale-character.js, find-landslide-address.js.
- Sprint 3.8 (Free Report UX Polish): COMPLETE — tooltips, Property Score ring, map lock, contextual data. Every non-green risk card has source tooltip + paid tier hook. Score ring SVG renders cleanly. Map scroll-zoom disabled with reset button.
- Sprint 3.8.5 (Testing Strategy): COMPLETE — Three-layer testing framework. Layer 1: 41 adapter contract tests (fixture-based, CI, $0). Layer 2: 20 golden response schema tests (CI, $0). Layer 3: API health check script (manual, ~8 API calls). Schemas for all 14 adapters. 29 fixture files (happy path + null per adapter + golden response). TESTING.md documentation. CI workflow updated.
- Sprint 3.9 (Demographic Layer + Suburb Momentum + Amenity Proximity): COMPLETE — 9/9 tasks. 5 new adapters (sa2-geocoder, abs-demographics, suburb-momentum, bcc-amenity, ai-neighbourhood) with schemas + fixtures. 11 new fields (6 free, 5 paid). Pre-computed data files: suburb-sa2.json, abs-suburb-stats.json, suburb-momentum.json. New report sections: Suburb Profile (income/owner-occ/SEIFA/momentum), Neighbourhood Amenities (bus stops/parks), Neighbourhood Character (AI narrative, paid only). All 14 adapters pass adapter coverage enforcement gate.
- Sprint 4.1+4.2 (Suburb Overlay Stats + Context Enrichment): COMPLETE — Precomputed suburb overlay prevalence for 101 suburbs × 11 overlay types using BCC ArcGIS returnCountOnly. New suburb-context adapter compares lot overlays against suburb prevalence — generates context notes when lot is clear but suburb has ≥5% prevalence. Data quality analysis revealed flood_overland BROKEN (67/101 suburbs >100% raw ratio), bushfire DEGRADED (10/101), all others RELIABLE. Added LAYER_RELIABILITY tiers to exclude broken layers, caveat degraded. New Methodology tab in UI. Decision D7 in DECISIONS.md documents tier criteria for future LGA builds. 15 adapters, 106 tests passing, golden response re-recorded.
- Sprint 4.2.1 (Overlay Data Quality Fix): COMPLETE — apostrophe syntax fix, record script auth fix (Referer header for same-origin bypass), lot_plan removed from free-tier critical keys snapshot.
  - Sprint 4.2.2 (Enhanced Flood Data): COMPLETE — 3 new BCC Flood Awareness layers (Overall Risk, Creek Risk, Storm Tide) via ArcGIS FeatureServer. Enhanced overland flow from boolean to object with risk level. Added extractWorstRisk() + floodPlainEnglish() helpers. 4 new fields: flood_risk_overall, flood_creek_risk, flood_storm_tide, flood_summary. Report renders colour-coded risk headline + plain-English summary. Property Score flood penalty scales by risk (High=-20, Medium=-15, Low=-8, Very Low=-4). Methodology tab updated with AEP classification table and 10-layer flood detail table. 106 tests passing, golden response re-recorded (49 fields, 44 with data).
  - Sprint 4.2.3 (Language, Scoring & Map Reliability): COMPLETE — 9 changes across index.html, bcc-cadastre.js, schemas.js. (1) Map proxy CORS fallback: replaced broken L.tileLayer {bbox} template with L.tileLayer.wms + custom getTileUrl. (2) Stale map state fix: reset mapLayers={} in renderFallbackMap(). (3) Nominatim fallback popup: informative message when lot boundary unavailable. (4) Google Geocoding spatial fallback in bcc-cadastre.js for unit/apartment addresses (DCDB stores parent lot only). (5) Australian language: "Neighbourhood" → "Suburb" for non-planning contexts (kept "Neighbourhood centre" as official zone name, kept "Neighbourhood Character" as BCC planning term). (6) Reframed "risk categories" → "planning overlays" / "planning assessment". (7) Heritage/character made score-neutral (impact: 0, was -5/-3). (8) Score verdict text: "risk factors" → "hazard exposure"/"hazard factors". (9) Score tooltip updated to explain planning overlay neutrality. Tests: 106 passing (schemas.js rewritten, fixtures updated).
- Sprint 4.8 (PDF Report Generation): COMPLETE — api/lib/property-score.js extracted as shared CommonJS module. api/report-pdf.js: POST /api/report-pdf → A4 PDF (pdfkit) with 13 sections: header, Property Score with factors, property overview, flood risk, bushfire, landslide, heritage/character, environmental overlays, infrastructure, school catchments, crime, suburb profile, AI insights, data sources, disclaimer. "Download PDF Report" button in UI (shown post-lookup, triggers browser download). vercel.json rewrite added. pdfkit added to dependencies. PDFs validated for Rocklea (67, flood-heavy), Ascot (93, clean), Carindale (75, medium).
- Sprint 4.9 (Pre-Launch Test Confidence): COMPLETE — 4 new test layers, all CI-safe ($0, <1s each): (1) 15 golden snapshot fixtures (tests/golden/*.json) + tests/golden-snapshots.test.js (158 tests); (2) tests/property-score.test.js (82 tests — determinism + exact synthetic scores); (3) tests/cross-field-consistency.test.js (406 tests — 25 rules × 15 fixtures); (4) accuracy-test.js expanded from 13 to 30 addresses. Total CI: 9 test files, 752 tests, 0 failures, 14 soft warnings. Accuracy matrix: 30 addresses covering all overlay profiles.

## PropertyData Data Audit (11 April 2026)
- Full audit in PropertyData_Audit.xlsx (5 sheets: Field Inventory, Gap Analysis, Accuracy Assessment, Product Completeness, Roadmap)
- Accuracy: 6/7 sources rated High or Very High (all BCC data authoritative). suburb-stats is STATIC — critical credibility risk.
- Product completeness: ~72% of a complete buyer report. Property identity, zoning, flood, overlays, infrastructure, schools, noise all 100%. Crime, demographics, amenities now live (Sprint 3.5 + 3.9). Valuation, listing, title still 0% (blocked on external APIs).
- Free report launch blockers (Sprint 3 resolved): suburb stats %, road hierarchy display, plain-English, crime, street view, landslide, map proxy, branding. Remaining: Vercel deploy, live suburb stats API
- See Gap Analysis sheet for full P0–P3 prioritisation

## PropertyData Known Gaps
- GNAF resolution: not yet implemented (centroid override for line-layer queries)
- ANEF detail: only returns boolean affected, not contour number or airport name
- ICSEA bootstrap: ~80 schools in data/icsea-scores.json — full dataset needs scripts/fetch-icsea.js
- Deployment: local only — not yet deployed to Vercel
- Suburb stats: STATIC TABLE — drifts monthly. Must replace with live API (PropTrack/CoreLogic) before any public launch
- Blocked on external APIs: PropTechData (AVM), Domain (listing), InfoTrack (title)
- Bushfire badge label: FIXED — buffer categories now show "Buffer zone" in detail text, score factor label, and synthesis paragraph
- RAPIDAPI_PROXY_SECRET: not in propertydata .env.local — accuracy tests work without it (ZoneIQ only needs it for external callers)
- Bardon landslide: soft assertion only — BCC overlay has 7 polygons, none on residential lots. May never pass as hard assert.

## Downstream dependency: ClearOffer

```
DEPENDENCY FINDING:
Mechanism: HTTP POST to PropertyData /api/lookup endpoint (PROPERTYDATA_URL env var, default localhost:3002). Auth via Bearer token (PROPERTYDATA_SECRET). Single bridge module: buyerside/api/lib/propertydata-client.js
ClearOffer consumes: POST /api/lookup { address, tier: "free"|"paid" } → flat fields array. Fields used: zone_code, zone_name, flood_creek_fpa, flood_river_fpa, flood_overland_flow, flood_aep_1pct, flood_2011, flood_2022, school_primary, school_secondary, school_primary_icsea, school_secondary_icsea, bushfire_hazard, heritage_listing, character_overlay, koala_habitat, acid_sulfate, biodiversity, waterway_corridor, wetlands, petroleum_pipeline, road_hierarchy, hv_powerline, hv_easement, aircraft_noise_anef, lot_plan, lot_area, derived_road_type
Contract document: C:\dev\propertydata\DATA_SOURCES_v2.md (Section 4: Architecture, response shape definition)
Risk — PropertyData changing ClearOffer: Renaming any field key (e.g. flood_creek_fpa → flood_creek), changing value types (e.g. boolean → object for flood_overland_flow), removing fields, or changing the fields array structure would silently break ClearOffer's propertydata-client.js mapping
Risk — ClearOffer assuming wrong shape: ClearOffer hardcodes field key names and value types in propertydata-client.js. If PropertyData adds new flood fields (as in Sprint 4.2.2) but ClearOffer's mapping isn't updated, the new data is silently dropped. ClearOffer also assumes council is always null and state is always QLD.
```

### Guardrails for PropertyData agents
- Before changing any response shape, field name, or removing a field, check STATE_CLEAROFFER.md
- If a change would break the contract snapshot above, log it as a breaking change in OVERNIGHT_LOG.md and do not proceed without human review
- Treat DATA_SOURCES_v2.md as a shared contract — do not modify field definitions without noting the ClearOffer impact
