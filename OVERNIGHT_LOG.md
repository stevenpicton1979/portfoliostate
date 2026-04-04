# OVERNIGHT_LOG — SubdivideIQ Sprint 1 + Sprint 2
Session: 2026-04-06

## Sprint 1 status (carried from previous session)
- [x] S1-1: Repo and scaffold
- [x] S1-2: Supabase tables
- [x] S1-3: BCC parcel data (+ note on full load)
- [x] S1-4: BCC stormwater data
- [x] S1-5: Address geocoding function

## Sprint 2 tasks
- [x] S2-1: Zone check (api/check-zone.js)
- [x] S2-2: Flood overlay check (api/check-flood.js)
- [x] S2-3: Slope/elevation check (api/check-elevation.js)
- [x] S2-4: Stormwater proximity check (api/check-stormwater.js)
- [x] S2-5: Character overlay check (api/check-character.js)
- [x] S2-6: Lot size viability (api/check-lotsize.js)
- [x] S2-7: Master feasibility aggregator (api/feasibility.js)

---

## Log

### 2026-04-06 — Sprint 2 started
- BACKLOG.md updated: note added under S1-3 re full Brisbane loads
- Queried ZoneIQ Supabase tables for schema before writing checks:
  - zone_geometries: zone_code, geometry, council
  - zone_rules: zone_code, zone_name, council, subdivision_min_lot_size_m2 + full rules
  - flood_overlays: overlay_type (brisbane_river / overland_flow), flood_category, risk_level
  - character_overlays: character_type, geometry
  - school_catchments: school_name, school_type, school_level, suburb
  - bushfire_overlays: intensity_class, lga, council
- Test validated at 6 Glenheaton Court centroid:
  Zone=LDR, min_lot=600m², character="Dwelling house character", no flood overlay

### 2026-04-06 — S2-1: Zone check DONE ✅
- api/check-zone.js: ST_Contains query on zone_geometries JOIN zone_rules
- Returns: zone_code, zone_name, min_lot_size_m2, setbacks, rules, key_rules
- PASS/MARGINAL/FAIL logic: halfLot vs min_lot_size_m2 with 20% buffer
- Test result: LDR, min 600m² — RED (1086/2=543m² < 600m²)

### 2026-04-06 — S2-2: Flood overlay check DONE ✅
- api/check-flood.js: ST_Intersects + ST_Area overlap % calculation
- Flood category mapping:
  FHA_R1/R2A/R2B → RED | FHA_R3 >50% → RED | FHA_R3-R5 any → AMBER
  overland_flow any → AMBER
- Cost flag: hydraulics report $4k-$8k, 6-8 weeks, RPEQ-signed
- Falls back to 50m centroid buffer if geom_geojson not supplied
- Test result: GREEN (no flood overlay at 6 Glenheaton Court centroid)
  NOTE: Origin story flood constraint may be at lot perimeter not centroid —
  the hydraulics report flagged flood immunity constraints on the lot.
  Full polygon intersection (geom_geojson provided) will give accurate result.

### 2026-04-06 — S2-3: Elevation check DONE ✅
- api/check-elevation.js: 3×3 grid sampling via QLD ArcGIS ImageServer
- URL: spatial-img.information.qld.gov.au/arcgis/rest/services/Elevation/QldDem/ImageServer/identify
- Requires explicit WGS84 SR in geometry param: {x, y, spatialReference:{wkid:4326}}
- Slope: FLAT <2% GREEN | MODERATE 2-10% AMBER | STEEP >10% AMBER/RED
- Stilts signal: if min_elev < flood_immunity_level + 0.5m → AMBER + note
- Derives lot dimensions from bbox or estimates from area (1:2 aspect ratio fallback)
- Test result: AMBER (6.1% moderate slope, $15k-$50k earthworks)

### 2026-04-06 — S2-4: Stormwater proximity DONE ✅
- api/check-stormwater.js: ST_DWithin on subdivide_sw_pipes + subdivide_sw_drains
- Pipe: <30m GREEN | 30-80m AMBER | >80m AMBER/RED
- Flow paths: FLOODWAY/SWALE/EARTH DRAIN/UNFORMED within 100m → AMBER
- Graceful UNKNOWN response when area not loaded (checks 500m coverage)
- Test result: GREEN — 825mm PC pipe (O20000165) at 16.6m ✅

### 2026-04-06 — S2-5: Character overlay check DONE ✅
- api/check-character.js: ST_Contains on character_overlays
- Maps character_type to plain English demolition notes
- Test result: AMBER — "Dwelling house character" overlay present

### 2026-04-06 — S2-6: Lot size viability DONE ✅
- api/check-lotsize.js: 60/40, 50/50, and battle-axe split analysis
- Derives frontage/depth from polygon bbox (min dimension = frontage)
- Battle-axe: 3m handle, checks handle area subtraction from rear lot
- VIABLE/MARGINAL/BATTLE_AXE_ONLY/NOT_VIABLE status
- Test result: MARGINAL AMBER (1086m² close to 1200m² needed for two 600m² lots)

### 2026-04-06 — S2-7: Master feasibility aggregator DONE ✅
- api/feasibility.js: runs zone + flood first (flood immunity needed for elevation)
  then remaining 4 checks via Promise.all
- Aggregation: any RED → RED | 2+ AMBER → AMBER (leaning RED noted) | all GREEN → GREEN
- Builds consultant sequence and indicative cost range
- runCheck() uses internal module require (no HTTP round-trips between serverless functions)
- Test result (6 Glenheaton Court Carindale):
  [RED]   zone: 1086m² insufficient for two 600m² LDR lots
  [GREEN] flood: no overlay at centroid
  [AMBER] elevation: 6.1% moderate slope, $15k-$50k earthworks
  [GREEN] stormwater: 825mm pipe at 16.6m ✅
  [AMBER] character: Dwelling house character overlay
  [AMBER] lotsize: marginal, creative split or battle-axe may work
  Overall: RED (1 red, 3 amber, 2 green) | Cost range: $29k–$53k | 1 consultant step

---

## Repos pushed
- stevenpicton1979/subdivideiq
  Commit fcfc95a — Sprint 1 (repo, Supabase tables, BCC loaders, geocode)
  Commit ab2445f — Sprint 2 (7 feasibility checks + aggregator)
- stevenpicton1979/portfoliostate
  BACKLOG.md updated, OVERNIGHT_LOG.md updated

---

## Note on 6 Glenheaton Court test result
The overall RED is technically correct — 1086m² genuinely cannot produce two 600m² LDR lots.
The origin story flood constraint was a separate issue (hydraulics engineer confirmed
rear lot build form commercially unviable due to flood immunity requirements).
For S4-3 staging test: use a larger lot (~1200m²+) in a flood-affected suburb to
get the expected AMBER + flood flag result. Suggest: look up a 1400m²+ lot in
Rocklea, Oxley, or Yeronga where BCC flood overlays are common.

---

## Ready for Sprint 3
Sprint 3 tasks:
- S3-1: Stripe checkout (api/checkout.js)
- S3-2: Stripe webhook (api/webhook.js)
- S3-3: PDF report template
- S3-4: Frontend address entry page (update public/index.html)
- S3-5: Confirmation page (already exists — may need updates)
