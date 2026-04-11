# ClearOffer — Data Sources
Last updated: 11 April 2026

## Data Source Registry

### SOURCE: ZoneIQ (zoneiq-sigma.vercel.app)
Base URL:   https://zoneiq-sigma.vercel.app
Auth:       Internal — same Vercel account (no API key required)
CORS:       Server-side only — do not call from browser
Coverage:   Brisbane metro (expanding to all QLD)
Cost:       Internal — portfolio infra
Notes:      Returns zone code, planning rules, flood overlay, character overlay,
            school catchments, noise overlay. ClearOffer uses this for noise
            (ANEF contours) and school catchment discovery. BCC ArcGIS overrides
            flood/bushfire/heritage/character with authoritative lot-boundary data.
            IMPORTANT: Always call zoneiq-sigma.vercel.app NOT zoneiq.com.au —
            zoneiq.com.au has a redirect issue on server-side fetches.

---

### SOURCE: BCC ArcGIS Open Data
Base URL:   https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services
Auth:       None — public open data, no API key
CORS:       Open — works server-side and browser-side
Coverage:   Brisbane City Council (BCC) area only
Cost:       Free
Notes:      Authoritative source for all BCC CityPlan overlays.
            Uses two query modes:
              Polygon intersection (area overlays):
                geometryType=esriGeometryPolygon, spatialRel=esriSpatialRelIntersects
                Passes full lot boundary polygon — more accurate than point-in-polygon.
              Centroid + distance buffer (line overlays):
                geometryType=esriGeometryPoint, distance=50, units=esriSRUnit_Meter
                Used for road hierarchy and HV powerlines (line features have no area).
            Layers in use:
              Property_boundaries_Parcel       — LOTPLAN, LOT_AREA, polygon geometry
              Flood_overlay_Creek_waterway_flood_planning_area
              Flood_overlay_Brisbane_River_flood_planning_area
              Flood_Awareness_Overland_Flow
              Flood_Awareness_Brisbane_River_Creek_Storm_Tide_1percent_Annual_Chance
              Flood_Awareness_Historic_Brisbane_River_and_Creek_Floods_Feb2022
              Flood_Awareness_Historic_Brisbane_River_Floods_Jan2011
              Bushfire_overlay
              Heritage_overlay
              Traditional_building_character_overlay
              Dwelling_house_character_overlay
              Biodiversity_areas_overlay_Koala_habitat_areas
              City_Plan_2014_PotentialAndActual_acid_sulfate_soils_overlay
              Biodiversity_areas_overlay_Biodiversity_areas
              Waterway_corridors_overlay_Waterway_corridors
              Wetlands_overlay
              Regional_infrastructure_corridors_and_substations_overlay_High_voltage_easements
              Regional_infrastructure_corridors_and_substations_overlay_Petroleum_pipelines
              Roads_hierarchy_overlay_Road_hierarchy  (line layer — centroid buffer)
              Regional_infrastructure_corridors_and_substations_overlay_High_voltage_powerline (line layer)

---

### SOURCE: Google Places API
Base URL:   https://maps.googleapis.com/maps/api/place
Auth:       API key (GOOGLE_MAPS_API_KEY in Vercel env)
Coverage:   National / Global
Cost:       Pay-per-use (free tier sufficient for current volume)
Notes:      Used exclusively for address autocomplete UX in index.html.
            After user selects an address, GNAF (Addressr) is used for authoritative
            geocoding. Google Places retained because it provides location-aware
            suggestions, suburb/city context, and better UX than GNAF search.

---

### SOURCE: Addressr (GNAF API)
Base URL:   https://api.addressr.io
Auth:       None — free, no API key, no documented rate limits
CORS:       Open — works from browser and server
Coverage:   National — 15.9M addresses, all states and territories
Update:     Quarterly (follows GNAF release cycle)
Cost:       Free (open source, Apache 2.0)
Notes:      Two-call pattern:
              1. GET /addresses?q={address}  → returns [{ sla, pid, score }]
              2. GET /addresses/{pid}        → returns geocoding.geocodes[].lat/lng
            Property centroid from land registry — more accurate than Google
            geocoding interpolation for lot boundary spatial queries.
            Response time 212–455ms — run in parallel with BCC parcel fetch,
            no added wall-clock latency.
            Google Places retained for autocomplete UX (location-aware, faster).
            GNAF PID is Australia's authoritative address identifier.

---

### SOURCE: Anthropic Claude API
Base URL:   https://api.anthropic.com
Auth:       API key (ANTHROPIC_API_KEY in Vercel env)
Coverage:   Global
Cost:       Pay-per-use — ~$0.50–$2.00 per Buyer's Brief generation
Notes:      Streaming generation of Buyer's Brief. Model: claude-sonnet-4-6.
            buyerside/api/buyers-brief.js builds the prompt from all zone/overlay
            data and streams the response directly to the browser.

---

### SOURCE: Stripe
Base URL:   https://api.stripe.com
Auth:       Secret key (STRIPE_SECRET_KEY in Vercel env)
Coverage:   Global
Cost:       2.5% + 30c per transaction
Notes:      $149 AUD Buyer's Brief checkout. Currently in TEST MODE.
            Must switch to live key before launch.

---

### SOURCE: Resend
Base URL:   https://api.resend.com
Auth:       API key (RESEND_API_KEY in Vercel env)
Coverage:   Global
Cost:       Free tier (sufficient for current volume)
Notes:      Scout Report confirmation email with Buyer's Brief upsell.
            Sending domain: hello@clearoffer.com.au

---

## Field Inventory — Currently in product

| # | Field | Used in | Source | Coverage |
|---|-------|---------|--------|----------|
| 1 | Zone code | Scout Report, Brief | ZoneIQ | Brisbane |
| 2 | Zone name | Scout Report, Brief | ZoneIQ | Brisbane |
| 3 | Council name | Internal | ZoneIQ | Brisbane |
| 4 | Flood overlay (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 5 | Flood categories (FPA1–5) | Brief | BCC ArcGIS | Brisbane |
| 6 | Overland flow (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 7 | Within 1% AEP (yes/no) | Brief | BCC ArcGIS | Brisbane |
| 8 | Flooded Jan 2011 (yes/no) | Brief | BCC ArcGIS | Brisbane |
| 9 | Flooded Feb 2022 (yes/no) | Brief | BCC ArcGIS | Brisbane |
| 10 | Bushfire overlay | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 11 | Bushfire category | Brief | BCC ArcGIS | Brisbane |
| 12 | Heritage listed (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 13 | Heritage categories | Brief | BCC ArcGIS | Brisbane |
| 14 | Character overlay (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 15 | Character type | Brief | BCC ArcGIS | Brisbane |
| 16 | ANEF noise contour | Scout Report, Brief | ZoneIQ | Brisbane |
| 17 | Primary school name | Scout Report, Brief | ZoneIQ | Brisbane |
| 18 | Primary school ICSEA | Scout Report, Brief | ICSEA static JSON | National |
| 19 | Secondary school name | Scout Report, Brief | ZoneIQ | Brisbane |
| 20 | Secondary school ICSEA | Scout Report, Brief | ICSEA static JSON | National |
| 21 | Lot plan number | Internal | BCC ArcGIS | Brisbane |
| 22 | Lot area (m²) | Brief | BCC ArcGIS | Brisbane |
| 23 | Koala habitat (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 24 | Acid sulfate soils (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 25 | Biodiversity overlay (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 26 | Biodiversity categories | Brief | BCC ArcGIS | Brisbane |
| 27 | Waterway corridor (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 28 | Wetlands overlay (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 29 | Road on arterial (yes/no) | Brief | BCC ArcGIS | Brisbane |
| 30 | Road type / route type | Brief | BCC ArcGIS | Brisbane |
| 31 | Derived road type | Brief | BCC ArcGIS | Brisbane |
| 32 | HV powerline nearby (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 33 | HV easement on lot (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 34 | Petroleum pipeline (yes/no) | Scout Report, Brief | BCC ArcGIS | Brisbane |
| 35 | Listing price | Scout Report, Brief | Domain API (BLOCKED) | National |
| 36 | Days on market | Scout Report, Brief | Domain API (BLOCKED) | National |
| 37 | Agent name | Scout Report | Domain API (BLOCKED) | National |
| 38 | GNAF PID | Internal / Brief traceability | Addressr | National |
| 39 | Property centroid lat/lng (GNAF) | BCC line-layer queries | Addressr | National |
