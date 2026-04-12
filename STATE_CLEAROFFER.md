# ClearOffer — clearoffer.com.au
- Repo: stevenpicton1979/buyerside (main branch, not master)
- Live: clearoffer.com.au (coming-soon mode — COMING_SOON env var controls root route)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Stripe: test mode only — switch to live before launch
- Status: READY TO LAUNCH — pending Domain API approval + PropTechData terms confirmation
- Rebuilt from scratch: 10 April 2026. Full rebuild in Claude.ai chat, then deployed via Claude Code.

## ClearOffer Architecture (post-rebuild)
- 26 files: 11 API routes, 5 HTML pages, CSS, client config, SQL, smoke tests
- All user-visible strings in two config files — rename is a 5-minute job:
  - api/config.js (server-side: PRODUCT.NAME, PRICING, DISCLAIMER)
  - public/js/config.js (client-side: all copy strings, CTAs, locked section labels)
- COMING_SOON env var: true = serves coming-soon.html, false = serves index.html (launch switch)
- vercel.json: / routes to api/home.js which reads COMING_SOON. All other routes rewrite to /public/$1
- Local dev: vercel dev --listen 3001. Never npm run dev (recursive invocation error).

## ClearOffer Data Layer (Sprint 2: PropertyData switchover complete)
- All property data now flows through PropertyData API (localhost:3002 / TBD prod)
- zone-lookup.js is a thin wrapper: POST to PropertyData, map response to ClearOffer shape
- buyers-brief.js calls PropertyData with tier: 'paid' (replaces direct ZoneIQ call)
- ClearOffer makes ZERO direct calls to BCC ArcGIS or ZoneIQ
- Free Scout Report (target: under $0.15/lookup):
  - All overlays via PropertyData (free tier): flood, bushfire, heritage, character, noise, schools, koala, acid sulfate, biodiversity, road, HV, pipeline, waterway, wetlands
  - Suburb stats: via PropertyData (static lookup, ~100 Brisbane suburbs)
  - AVM teaser: derived ±8% of suburb median
  - Verdict: Claude Haiku (~$0.02)
  - Listing data: PENDING Domain API approval
- Paid Buyer's Brief ($149):
  - Generation: Claude Sonnet streaming (~$0.05–0.10)
  - All overlays + lot plan + ICSEA via PropertyData (paid tier)
  - AVM + comparables: PropTechData STUBBED — pending terms confirmation
  - Offer recommendation + negotiation script: Claude
- PropTechData constraint: NEVER called on free report. Paid report only.

## ClearOffer Supabase (project: dqzqqfcepsqhaxovneen)
- Tables: scout_reports, suburb_stats_cache
- scout_reports: id, email, address, created_at, report_data, followup_sent, converted_to_paid
- suburb_stats_cache: populated monthly from PropTechData (once terms confirmed)
- SQL: scripts/create-tables.sql — run in Supabase SQL editor if tables missing
- One free Scout Report per email address (globally, not per address). Waitlist entries use address='__waitlist__' and are excluded from this check.

## ClearOffer Stripe
- Test mode — do NOT switch to live until Steve confirms
- Checkout: $149 AUD one-time, price_data (dynamic, no pre-created price ID needed)
- Webhook: checkout.session.completed → sets converted_to_paid: true
- Payment verification in buyers-brief.js: checks Supabase first, then Stripe direct (session_id fallback for local dev without webhook forwarder)
- bodyParser: false on stripe-webhook.js (required for signature verification)

## ClearOffer Env Vars (Vercel project: buyerside)
- Development: BASE_URL=http://localhost:3001, ALLOWED_ORIGIN=http://localhost:3001, COMING_SOON=true
- Production: BASE_URL=https://clearoffer.com.au, ALLOWED_ORIGIN=https://clearoffer.com.au, COMING_SOON=true (set false when ready to launch)
- All environments: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY (test), STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, PROPERTYDATA_URL, PROPERTYDATA_SECRET, ZONEIQ_URL=https://zoneiq-sigma.vercel.app (legacy — PropertyData calls ZoneIQ internally), RESEND_API_KEY, GOOGLE_GEOCODING_API_KEY
- Pending (blank until approved): DOMAIN_CLIENT_ID, DOMAIN_CLIENT_SECRET, PROPTECH_DATA_API_KEY, CRON_SECRET
- Note: Google key needs Places API enabled on GCP project (not just Geocoding API) for autocomplete to work

## ClearOffer Sprints (post-rebuild)
- Sprint 1: COMPLETE — smoke tests passing (17/17), local dev verified
- Sprint 2: COMPLETE — autocomplete UX polish, keyboard nav, loading indicator, mobile
- Sprint 3: COMPLETE — Scout Report overlay QA across 5 Brisbane addresses
- Sprint 4: COMPLETE — email gate + Supabase integration tested
- Sprint 5: COMPLETE — Stripe checkout integration tested
- Sprint 6: COMPLETE — Buyer's Brief generation tested, markdown rendering fixed, fake header removed
- Sprint 7: COMPLETE — follow-up email job tested
- Sprint 8: COMPLETE — mobile QA pass
- Sprint 9: BLOCKED — Domain API approval pending (api@domain.com.au — chaser sent 9 April)
- Sprint 10: BLOCKED — PropTechData VG licence + pricing confirmation pending
- Sprint 11: BLOCKED — launch prep, awaiting Steve's go signal

## ClearOffer Known Issues
- Autocomplete: requires Places API enabled on GCP project. If not enabled, users can still type full address and press enter.
- Verdict prompt: occasionally generates meta text instead of a sharp one-liner when no listing data available (Domain API not yet connected). Acceptable until Domain API approved.
- COMING_SOON: currently set to true on all Vercel environments — set to false in Production when ready to launch.

## Upstream dependency: PropertyData

```
DEPENDENCY FINDING:
Mechanism: HTTP POST to PropertyData /api/lookup endpoint (PROPERTYDATA_URL env var, default localhost:3002). Auth via Bearer token (PROPERTYDATA_SECRET). Single bridge module: buyerside/api/lib/propertydata-client.js
ClearOffer consumes: POST /api/lookup { address, tier: "free"|"paid" } → flat fields array. Fields used: zone_code, zone_name, flood_creek_fpa, flood_river_fpa, flood_overland_flow, flood_aep_1pct, flood_2011, flood_2022, school_primary, school_secondary, school_primary_icsea, school_secondary_icsea, bushfire_hazard, heritage_listing, character_overlay, koala_habitat, acid_sulfate, biodiversity, waterway_corridor, wetlands, petroleum_pipeline, road_hierarchy, hv_powerline, hv_easement, aircraft_noise_anef, lot_plan, lot_area, derived_road_type
Contract document: C:\dev\propertydata\DATA_SOURCES_v2.md (Section 4: Architecture, response shape definition)
Risk — PropertyData changing ClearOffer: Renaming any field key (e.g. flood_creek_fpa → flood_creek), changing value types (e.g. boolean → object for flood_overland_flow), removing fields, or changing the fields array structure would silently break ClearOffer's propertydata-client.js mapping
Risk — ClearOffer assuming wrong shape: ClearOffer hardcodes field key names and value types in propertydata-client.js. If PropertyData adds new flood fields (as in Sprint 4.2.2) but ClearOffer's mapping isn't updated, the new data is silently dropped. ClearOffer also assumes council is always null and state is always QLD.
```

### Contract snapshot

PropertyData API: `POST /api/lookup`

**Request:** `{ "address": "<full address string>", "tier": "free" | "paid" }`

**Response shape:**
```json
{
  "address": "6 Glenheaton Court, Carindale QLD 4152",
  "tier": "free",
  "timestamp": "2026-04-11T14:30:00Z",
  "fields": [
    { "key": "<field_key>", "label": "<display label>", "value": <any>, "source": "<source_id>", "status": "live|blocked|missing", "description": "<text>", "updated_at": "<ISO timestamp>" }
  ],
  "meta": {
    "sources_called": ["bcc_arcgis", "zoneiq_db", ...],
    "sources_blocked": ["proptech_data", "domain_api"],
    "sources_failed": [],
    "duration_ms": 1240
  }
}
```

**Fields ClearOffer depends on (mapped in buyerside/api/lib/propertydata-client.js):**

| Field key | Expected value type | Used in |
|-----------|-------------------|---------|
| zone_code | string | zone.code |
| zone_name | string | zone.name |
| flood_creek_fpa | string[] | overlays.flood.categories |
| flood_river_fpa | string[] | overlays.flood.categories |
| flood_overland_flow | boolean | overlays.flood.overlandFlow |
| flood_aep_1pct | boolean | overlays.flood.within1PctAEP |
| flood_2011 | boolean | overlays.flood.floodedJan2011 |
| flood_2022 | boolean | overlays.flood.floodedFeb2022 |
| school_primary | string | overlays.schools.primary.name |
| school_secondary | string | overlays.schools.secondary.name |
| school_primary_icsea | number | overlays.schools.primary.icsea |
| school_secondary_icsea | number | overlays.schools.secondary.icsea |
| bushfire_hazard | object | overlays.bushfire |
| heritage_listing | object | overlays.heritage |
| character_overlay | object | overlays.character |
| koala_habitat | object | overlays.koala |
| acid_sulfate | object | overlays.acidSulfateSoils |
| biodiversity | object | overlays.biodiversity |
| waterway_corridor | object | overlays.waterwayCorridor |
| wetlands | object | overlays.wetlands |
| petroleum_pipeline | object | overlays.petroleumPipeline |
| road_hierarchy | object | overlays.roadHierarchy |
| hv_powerline | object | highVoltage.powerlineNearby |
| hv_easement | object | highVoltage.easementOnLot |
| aircraft_noise_anef | boolean | overlays.noise.affected |
| lot_plan | string | parcel.lotPlan |
| lot_area | number | parcel.lotAreaM2 |
| derived_road_type | string | derivedRoadType |

### Guardrails for ClearOffer agents
- Before assuming a PropertyData field exists, check STATE_PROPERTYDATA.md for recent changes
- Do not call PropertyData endpoints that are not listed in the contract snapshot above
- If you need a field that is missing from the contract, log it as a blocker — do not work around it silently
