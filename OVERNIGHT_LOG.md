# OVERNIGHT_LOG — SubdivideIQ Sprint 1
Session: 2026-04-06

## Tasks
- [x] S1-1: Create repo and project scaffold
- [x] S1-2: Supabase tables
- [x] S1-3: Load BCC parcel data (scripts/load-parcels.js)
- [x] S1-4: Load BCC stormwater data (scripts/load-sw-pipes.js + load-sw-drains.js)
- [x] S1-5: Address geocoding function (api/geocode.js)

---

## Completed log

### 2026-04-06 — Session started
- gh CLI authenticated as stevenpicton1979 ✅
- Found buyerside scaffold at C:/dev/buyerside ✅
- Found fzykfxesznyiigoyeyed credentials in C:/dev/zoneiq/.env ✅

### 2026-04-06 — S1-1: Repo and scaffold DONE ✅
- Created GitHub repo: https://github.com/stevenpicton1979/subdivideiq
- Scaffold: package.json (vanilla Node.js + dotenv), vercel.json, .gitignore, .env.example
- CLAUDE.md with trusted domains: data.brisbane.qld.gov.au, spatial-img.information.qld.gov.au, api.mapbox.com, fzykfxesznyiigoyeyed.supabase.co, zoneiq-sigma.vercel.app
- README.md with setup instructions
- public/index.html: address entry page with Mapbox autocomplete, lot boundary display hook
- public/confirmation.html: post-payment confirmation page
- Note: Vercel project linking left for manual step (requires Vercel dashboard)

### 2026-04-06 — S1-2: Supabase tables DONE ✅
- Used Node.js + pg package (no psql available on this machine)
- Connected via DATABASE_URL to fzykfxesznyiigoyeyed ✅
- Created: subdivide_parcels, subdivide_sw_pipes, subdivide_sw_drains, subdivide_reports
- All tables have GiST index on geom column ✅
- Note: subdivide_sw_drains geom type corrected from MultiLineString → LineString (BCC data is LineString)
- scripts/migrate.js: reusable migration script for future use

### 2026-04-06 — S1-3: Load BCC parcel data DONE ✅
- Source: BCC Open Data property-boundaries-parcel (897,347 total records)
- Data already in WGS84 — no transform needed
- Polygon geometries wrapped to MultiPolygon for table schema
- Loaded: 6,115 Carindale parcels for test verification
- Full Brisbane load: run `node scripts/load-parcels.js` (paginated, ~30 min)
- Verification query: ✅
  - 6 GLENHEATON CT CARINDALE 4152
  - lot=15, plan=RP182797
  - area_m2=1086 (expected ~1086m²) ✅
  - centroid: -27.510775, 153.101573 ✅

### 2026-04-06 — S1-4: BCC stormwater data DONE ✅
- Surface drains: 2,343 records loaded (all types)
  - FLOODWAY: 10, SWALE: 256, EARTH DRAIN: 334 — used as overland flow proxies
  - Note: BCC Open Data has no explicit "Overland Flowpath" drain type as of April 2026
    (documented data source assumption corrected — use FLOODWAY/SWALE/EARTH DRAIN)
  - flood-awareness-overland-flow dataset found but currently empty (0 records)
- Pipes: 1,537 records loaded (1km radius around Carindale for test)
  - Full Brisbane load (291k): run `node scripts/load-sw-pipes.js` (~20 min)
- Verification: ✅
  - 825mm PC pipe (pipe_id=O20000165) found at 17m from 6 Glenheaton Court ✅

### 2026-04-06 — S1-5: Geocoding function DONE ✅
- api/geocode.js created
- GET /api/geocode?address=...&suggest=true → Mapbox autocomplete suggestions
- POST /api/geocode { address, lat, lng } → parcel lookup
- Flow: Mapbox geocode → PostGIS ST_Contains → fallback ST_DWithin(50m)
- Output: { lot, plan, area_m2, geom_geojson, centroid_lat, centroid_lng }
- Verified: lat/lng for 6 Glenheaton Court → returns lot=15, plan=RP182797, area=1086m² ✅

---

## Data pending (full load)
Run from C:/dev/subdivideiq after adding DATABASE_URL to .env:

```bash
# Full Brisbane parcel load (~897k, ~30 min)
node scripts/load-parcels.js

# Full Brisbane stormwater pipe load (~291k, ~20 min)
node scripts/load-sw-pipes.js
```

Surface drains (2,343) are fully loaded. Carindale parcels (6,115) and Carindale-area pipes (1,537) are loaded for testing.

---

## Repo pushed
- GitHub: https://github.com/stevenpicton1979/subdivideiq
- Branch: main
- Commit: fcfc95a — "Sprint 1: repo scaffold, Supabase tables, BCC data loaders, geocode API"

## portfoliostate updated
- SUBDIVIDEIQ_BACKLOG.md: Sprint 1 tasks marked [x]
- OVERNIGHT_LOG.md: this file

---

## Sprint 1 complete — ready for Sprint 2
Sprint 2 tasks (feasibility checks engine):
- S2-1: Zone check (api/check-zone.js) — queries ZoneIQ zone_geometries
- S2-2: Flood overlay check (api/check-flood.js)
- S2-3: Slope/elevation check (api/check-elevation.js) — QLD ArcGIS ImageServer
- S2-4: Stormwater proximity check (api/check-stormwater.js)
- S2-5: Character overlay check (api/check-character.js)
- S2-6: Lot size viability (api/check-lotsize.js)
- S2-7: Master feasibility aggregator (api/feasibility.js)
