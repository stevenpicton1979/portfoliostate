# DevCheck — Sprint Backlog
Last updated: 12 April 2026

## Dependencies

DevCheck depends on PropertyData API for ALL data. No direct database or ArcGIS calls from DevCheck.
PropertyData is currently being built (see DATA_SOURCES_v2.md Phase 0–4).

DevCheck-specific fields that need adding to PropertyData are marked with (PD) below.
DevCheck-only work (frontend, AI, payments) is marked with (DC).

## Phase 0 — PropertyData foundation (prerequisite)

DevCheck cannot begin until PropertyData API is live with ClearOffer consuming it.
This is already planned as PropertyData Phase 0a/0b.

**DevCheck work starts at Phase 1.**

## Phase 1 — Lot geometry + elevation (PropertyData additions)

These are the net-new data fields that make DevCheck possible. They don't exist in PropertyData yet.

### Sprint DC-1: Lot dimension analysis
- (PD) [ ] Calculate frontage width from lot boundary polygon (shortest edge touching road)
- (PD) [ ] Calculate lot depth from polygon
- (PD) [ ] Calculate shape regularity score (convex hull ratio)
- (PD) [ ] Add fields to PropertyData response: `lot_frontage_m`, `lot_depth_m`, `lot_shape_score`
- (PD) [ ] Test: 6 Glenheaton Court (known 1,086m², irregular shape, flood-affected)
- (PD) [ ] Test: 3 regular-shaped lots in different zones

### Sprint DC-2: Elevation + slope
- (PD) [ ] Wire QLD ArcGIS ImageServer REST endpoint for elevation queries
- (PD) [ ] Sample 9-point grid across lot polygon (3×3)
- (PD) [ ] Calculate slope % = (max−min elevation) / lot dimension × 100
- (PD) [ ] Classify: FLAT <2%, MODERATE 2–10%, STEEP >10%
- (PD) [ ] Add fields: `elevation_points_ahd`, `slope_percent`, `slope_class`
- (PD) [ ] Derive: ground level vs flood immunity level (min elevation vs FPA implied level)
- (PD) [ ] Test: flat lot (Carindale), moderate lot (The Gap), steep lot (Bardon)

### Sprint DC-3: Stormwater + overland flow paths
- (PD) [ ] Download BCC stormwater pipes dataset → load into Supabase PostGIS
- (PD) [ ] Download BCC surface drains dataset (includes overland flow paths) → Supabase
- (PD) [ ] Download BCC stormwater manholes → Supabase
- (PD) [ ] ST_DWithin proximity queries: pipe <30m GREEN, 30–80m AMBER, >80m RED
- (PD) [ ] Overland flow path within 100m → flag
- (PD) [ ] Add fields: `stormwater_pipe_distance_m`, `stormwater_pipe_status`, `overland_flow_path_nearby`, `nearest_manhole_distance_m`
- (PD) [ ] Test: Glenheaton Court (known overland flow issue)

### Sprint DC-4: Zone rules extension
- (PD) [ ] Extract from BCC City Plan: max site cover % per zone code
- (PD) [ ] Extract: max building height per zone code
- (PD) [ ] Extract: front/side/rear setbacks per zone code
- (PD) [ ] Extract: plot ratio per zone code (where applicable)
- (PD) [ ] Add to zone_rules table or new table: `zone_development_controls`
- (PD) [ ] Add fields to PropertyData response: `max_site_cover_pct`, `max_height_m`, `max_height_storeys`, `setback_front_m`, `setback_side_m`, `setback_rear_m`, `plot_ratio`
- (PD) [ ] Test against manual City Plan lookup for LDR, MDR, Character zones

### Sprint DC-5: Landslide + infrastructure charges
- (PD) [ ] Wire BCC ArcGIS landslide susceptibility endpoint (confirmed accessible)
- (PD) [ ] Add field: `landslide_susceptibility` (none/low/moderate/high)
- (PD) [ ] Extract BCC infrastructure charges schedule (published PDF → static JSON)
- (PD) [ ] Add field: `infrastructure_charge_estimate_aud` (per additional lot)
- (PD) [ ] Test: Bardon (landslide-prone), Carindale (flat, flood-prone)

## Phase 2 — DevCheck MVP (frontend + AI)

### Sprint DC-6: Scaffold + address entry
- (DC) [ ] Create repo: stevenpicton1979/devcheck
- (DC) [ ] Vercel project setup, linked to repo
- (DC) [ ] Landing page: value prop, address input, CTA
- (DC) [ ] Address autocomplete (Google Places, same as ClearOffer — or G-NAF when ready)
- (DC) [ ] Wire address to PropertyData API call (tier=devcheck)
- (DC) [ ] Local dev: `vercel dev --listen 3003`
- (DC) [ ] DEVCHECK_SECRET env var in Vercel for PropertyData auth

### Sprint DC-7: Free preview report
- (DC) [ ] Property summary card: address, lot area, zone, aerial (Mapbox when available in PD)
- (DC) [ ] Lot boundary overlay on map
- (DC) [ ] Traffic light per development scenario (GREEN/AMBER/RED) — logic engine
- (DC) [ ] Traffic light logic: zone + lot size + overlays → feasibility per scenario
- (DC) [ ] Teaser: "3 constraints found — unlock full analysis"
- (DC) [ ] Email gate for free preview access
- (DC) [ ] Responsive design — mobile-first (homeowners on phones)

### Sprint DC-8: Traffic light logic engine
- (DC) [ ] Define rules per scenario:
  - Subdivision: lot area > 2× zone minimum, frontage > 2× minimum OR battle-axe viable, no heritage, flood check
  - KDR: no heritage hard block, character overlay → design constraint, flood → build form
  - Renovation: remaining site cover budget > 0, setback clearance, character constraints
  - Granny flat: zone permits secondary dwelling, lot > 450m², access to rear
  - Dual occupancy: zone permits, lot meets dual occ minimum, infrastructure charges
- (DC) [ ] Each rule contributes GREEN/AMBER/RED with a reason string
- (DC) [ ] Aggregate per scenario: worst single check determines overall traffic light
- (DC) [ ] Unit tests for traffic light logic with known properties

### Sprint DC-9: AI synthesis — paid report
- (DC) [ ] Sonnet prompt engineering: property data → per-scenario analysis
- (DC) [ ] Prompt receives: all PropertyData fields + traffic light results + scenario rules
- (DC) [ ] Output structure: feasibility verdict, key constraints, consultant sequence, council pathway, timeline, warnings, next steps
- (DC) [ ] Test with 5 known properties across different constraint profiles
- (DC) [ ] Iterate prompt until output quality matches the "hydraulics before surveyor" standard
- (DC) [ ] Cost tracking: estimate Sonnet cost per report

### Sprint DC-10: Payments + delivery
- (DC) [ ] Stripe product + price: $99 AUD one-off
- (DC) [ ] Stripe checkout flow (same pattern as ClearOffer/WCIB)
- (DC) [ ] Webhook: checkout.session.completed → generate full report
- (DC) [ ] Report page: interactive web view with expandable scenario cards
- (DC) [ ] PDF generation: downloadable version for consultants
- (DC) [ ] Resend: email report link to buyer
- (DC) [ ] Supabase table: devcheck_reports (address, email, tier, stripe_session, created_at, report_json)

### Sprint DC-11: Polish + launch prep
- (DC) [ ] Purchase devcheck.com.au domain (VentraIP)
- (DC) [ ] DNS → Vercel
- (DC) [ ] Meta tags, OG image, favicon
- (DC) [ ] Disclaimer page (not engineering/legal advice)
- (DC) [ ] Privacy policy, terms
- (DC) [ ] Mobile testing across devices
- (DC) [ ] Smoke test: 10 addresses across different zones and constraint profiles
- (DC) [ ] Analytics: Vercel Analytics or simple Supabase event logging

## Phase 3 — Post-launch iteration

### Sprint DC-12: WhatCanIBuild sunset
- (DC) [ ] Redirect whatcanibuild.com.au → devcheck.com.au
- (DC) [ ] Email existing WCIB customers about DevCheck (if email list exists)
- (DC) [ ] Archive whatcanibuild repo

### Sprint DC-13: Interactive Q&A (Ask Panel equivalent)
- (DC) [ ] Haiku-powered Q&A on free preview: "Ask about this property"
- (DC) [ ] Context-aware chips: "Can I subdivide?", "What about the flood overlay?", "Granny flat feasible?"
- (DC) [ ] Chips driven by property data (only show subdivision chip if lot > 600m²)
- (DC) [ ] Conversion driver: complex questions → "Get the full DevCheck report for $99"

### Sprint DC-14: Subscription tier
- (DC) [ ] Stripe subscription product: $199/month
- (DC) [ ] Login system (Supabase Auth or simple API key)
- (DC) [ ] Dashboard: recent reports, saved properties
- (DC) [ ] Unlimited report generation for subscribers
- (DC) [ ] Usage tracking + analytics

### Sprint DC-15: SEQ expansion — Gold Coast
- (PD) [ ] Map GCCC overlay ArcGIS endpoints
- (PD) [ ] Add GCCC source adapters to PropertyData
- (DC) [ ] Extend traffic light logic for Gold Coast zone codes
- (DC) [ ] Test with 5 Gold Coast properties

### Future sprints
- Moreton Bay expansion
- Sunshine Coast expansion
- PropTechData integration (AVM, comps — when unblocked)
- InfoTrack integration (title, easements — when unblocked)
- DA precedent layer (commercial provider)
- Nearmap AI for building age estimation
- API access for subscription tier
