# SubdivideIQ — Data Sources Investigation
Last updated: 6 April 2026

## Summary

### 1. Lot Boundaries (DCDB)
Status: FREE, API accessible, buildable now

BCC Open Data: data.brisbane.qld.gov.au/explore/dataset/property-boundaries-parcel/
- GeoJSON API available
- Combines DCDB with BCC council property info
- Returns: lot polygon, lot/plan number, area m²

QLD State DCDB via QSpatial ArcGIS REST — covers all SEQ for future expansion.

Note: DCDB transitioning to Queensland Spatial Cadastral Fabric (QSCF) in 2026. DCDB remains available throughout 2026. Build against DCDB now, migrate to QSCF later.

How to use:
- Geocode address → find matching lot polygon
- Calculate area from polygon geometry
- Render lot boundary on map in report
- Calculate indicative split line + new lot sizes

### 2. Elevation / Slope (LiDAR)
Status: FREE, two access paths

Option A — QLD ArcGIS ImageServer (RECOMMENDED for production):
https://spatial-img.information.qld.gov.au/arcgis/rest/services/Elevation/QldDem/ImageServer
- Query elevation at any lat/lng via REST — no file download
- Returns AHD elevation in metres
- Perfect for Vercel serverless functions

Option B — ELVIS Portal (bulk pre-processing):
- Free download, CC-BY 4.0, 1m resolution for Brisbane/SEQ
- Use to pre-process slope tiles into Supabase if Option A too slow

How to use:
- Sample 9 points across lot (3x3 grid)
- Calculate slope % = (max-min elevation) / lot width × 100
- Classify: FLAT <2%, MODERATE 2-10%, STEEP >10%
- Compare lot min elevation vs flood immunity level → groundworks vs stilts signal

### 3. BCC Stormwater Network
Status: FREE, GeoJSON download, load into Supabase

Four datasets on BCC Open Data:
- Stormwater Pipes: data.brisbane.qld.gov.au/explore/dataset/stormwater-pipe-existing/
- Surface Drains (includes Overland Flowpath type): data.brisbane.qld.gov.au/explore/dataset/stormwater-surface-drain-existing/
- Manholes: data.brisbane.qld.gov.au/explore/dataset/stormwater-manhole-existing/
- End Structures: data.brisbane.qld.gov.au/explore/dataset/stormwater-end-structures-existing/

Critical: Surface Drains dataset includes "Overland Flowpath" as a drain type — BCC mapped overland flow paths are in public data.

How to use:
- Load into Supabase PostGIS (same pattern as flood/zone data)
- ST_DWithin queries for proximity
- Pipe within 30m → GREEN (drainage viable)
- Pipe 30-80m → AMBER (higher connection cost)
- Mapped overland flow path within 100m → AMBER flag

### 4. Flood Overlays
Status: ALREADY BUILT in ZoneIQ ✅
BCC Creek/Waterway planning areas 1-5 + overland flow already in Supabase PostGIS.

### 5. Zone Rules + Minimum Lot Sizes
Status: ALREADY BUILT in ZoneIQ ✅

### 6. Character Overlay
Status: ALREADY BUILT in ZoneIQ ✅

### 7. Sewer (Urban Utilities)
Status: NOT PUBLICLY AVAILABLE ❌
Workaround: flag in report, direct user to Urban Utilities free property enquiry tool.
Future: explore data sharing agreement with Urban Utilities.

### 8. DA Precedent
Status: POSSIBLE but complex — Stage 2
BCC PD Online is public but requires scraping + geocoding. Defer.

## Data Source Summary Table

| Data | Source | Cost | In Supabase? | Priority |
|------|---------|------|--------------|----------|
| Zone + overlays | ZoneIQ | Free | Yes | Use now |
| Flood overlays | ZoneIQ | Free | Yes | Use now |
| Character overlay | ZoneIQ | Free | Yes | Use now |
| Lot boundaries | BCC Open Data | Free | Load needed | Sprint 1 |
| Elevation/slope | QLD ImageServer | Free | Query live | Sprint 2 |
| Stormwater pipes | BCC Open Data | Free | Load needed | Sprint 2 |
| Overland flow paths | BCC Open Data | Free | Load needed | Sprint 2 |
| Sewer | Urban Utilities | N/A | Blocked | Workaround |
| DA precedent | BCC PD Online | Free (scrape) | Complex | Stage 2 |

## Technical Notes for Claude Code

1. BCC Open Data API: Opendatasoft platform — use where= parameter for proximity queries
2. QLD Elevation REST query format:
   ImageServer/identify?geometry={"x":lng,"y":lat}&geometryType=esriGeometryPoint&returnGeometry=false&f=json
3. DCDB lot area: calculate from polygon using PostGIS ST_Area(ST_Transform(geom, 28356)) for accurate m²
4. Coordinate systems: confirm EPSG and transform to WGS84 for display
5. Supabase proximity: use ST_DWithin (faster than ST_Distance for index hits)
