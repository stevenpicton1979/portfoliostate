# SubdivideIQ — Product Brief
Last updated: 6 April 2026

## Origin Story
Steve Picton attempted to subdivide 6 Glenheaton Court, Carindale in 2024.
- First contact: town planner said "should be possible", advised land survey as next step
- Engaged: town planner, land surveyor (Cornerstone Surveys), hydraulics engineer (Storm Water Consulting — full TUFLOW/URBS report, RPEQ-signed)
- Total spend: ~$7,500 over 6-9 months
- Outcome: abandoned when hydraulics engineer confirmed flood overlay constraints made rear lot build form commercially unviable
- The pain: nobody surfaced upfront that the hydraulics report was mandatory, expensive, and likely to produce constraints that killed the project
- 12 months later: attempted a home extension instead. Builder recommended DA on stilts. DA approved. Steve pulled out (lost more money) — never sure if groundworks could have avoided stilts, but finding out required another full DA process

Core insight: The system forces you to spend $5,000–$15,000 to answer a yes/no question.
SubdivideIQ's job: Answer that question for $49–99 before anyone spends a dollar.

## What SubdivideIQ Is NOT
- Not a replacement for a hydraulics report (RPEQ-signed, legally required, cannot be automated)
- Not a replacement for a cadastral survey
- Not a replacement for a town planner
- Not giving engineering or legal advice
- Not certifying anything

Analogy: A pre-purchase building inspection vs a structural engineering report. SubdivideIQ is the inspector — tells you whether to bother paying the engineer.

## What SubdivideIQ IS
A pre-screen intelligence tool for homeowners considering subdivision. Delivers a traffic light feasibility report in under 60 seconds, surfacing the constraints that consultants either don't tell you upfront or charge thousands to discover.

One sentence value prop:
"We check what town planners don't tell you upfront — and what it'll actually cost you to find out."

## Target Customer — Stage 1
- Brisbane homeowner (expanding to SEQ)
- Owns a large suburban lot (800m²+)
- Has thought about subdividing — not yet engaged a town planner or surveyor
- Not a developer — this is their family home
- Pain: doesn't know what they don't know
- Willingness to pay: $49–99 for certainty before spending thousands

## The Intercept Moment
Homeowner has idea → [SubdivideIQ — 60 seconds, $49–99] → GREEN/AMBER/RED → calls town planner with eyes open

Currently: idea → town planner → $$$. SubdivideIQ inserts a filter.

## Competitive Landscape
- Archistar: closest competitor. Targets professional developers at $200+/month. Overwhelmingly complex for homeowners. Does not translate overlay presence into plain-English cost/time consequences.
- Feastudy, ArgusEstateMaster: financial modelling tools for developers. Not relevant to homeowners.
- No product exists that serves the homeowner pre-screen market with consequence translation.

## Stage 1 — Launch Product

### Traffic Light Checks
1. Zone & minimum lot size — both new lots must meet zone minimum
2. Flood overlay category + coverage % — triggers hydraulics report flag
3. Overland flow — mapped + unmapped proximity flag
4. Slope from LiDAR — flat/moderate/steep + earthworks flag
5. Stormwater infrastructure proximity — pipe distance, overland flow path proximity
6. Character overlay — demolition controls on existing dwelling
7. Lot dimensions — frontage width, battle-axe viability

### Traffic Light Logic
- GREEN: zone OK, lot sizes viable, no major overlays
- AMBER: viable but flags present — each with plain-English explanation + cost/time implication
- RED: one or more hard blockers — specific reason + what it would cost to confirm

### Report Output
- PDF (Stripe → Resend → Supabase, same as WhatCanIBuild)
- Lot boundary map image
- Traffic light result (large, clear)
- Section per check: result + plain English + cost/time implication
- "What to do next": which consultants, in what order, realistic cost ranges
- Consultant cost reference table
- Disclaimer: not engineering or legal advice

### Pricing
- $79 AUD (between impulse-buy $49 and commitment-signal $99 — test at launch)

## Data Sources
See SUBDIVIDEIQ_DATA_SOURCES.md for full investigation.

Summary:
- Zone + overlays: ZoneIQ (already built) ✅
- Flood overlays: ZoneIQ (already built) ✅
- Lot boundaries: BCC Open Data DCDB — free GeoJSON API ✅
- Elevation/slope: QLD ArcGIS ImageServer REST API — free, no download needed ✅
- Stormwater pipes + overland flow: BCC Open Data — free GeoJSON download ✅
- Sewer: Urban Utilities — NOT publicly available, workaround in report ❌

## Stack
- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel serverless Node.js
- Database: Supabase fzykfxesznyiigoyeyed (new tables)
- Payments: Stripe (same account)
- Email/PDF: Resend
- Domain: TBD — buy at launch

## Convergence Note
WhatCanIBuild and SubdivideIQ share the same ZoneIQ data engine and answer related questions. Future convergence likely — naming TBD. "WhatCanIBuild" brand doesn't scale to subdivision. "SubdivideIQ" brand doesn't cover building works. Unified product ("PropertyIQ"?) is a future consideration.

## Future Ideas Parking Lot
- Building works pre-screen: "Can I extend/renovate and what form will it take?" — directly addresses Steve's extension/stilts experience
- Groundworks vs stilts calculator: lot elevation vs flood immunity level
- Unmapped overland flow detection: proximity to BCC stormwater pipe network + LiDAR low points
- Infrastructure charge estimator: BCC per-lot charge schedules
- DA precedent layer: nearby subdivision approvals/refusals scraped from BCC PD Online
- SEQ expansion: Gold Coast, Moreton Bay, Sunshine Coast (ZoneIQ data already exists)
- Professional/town planner tier: $149/month, pre-populated site data reports
- Real estate agent tier: identify subdivision potential before listing
- RapidAPI listing: same model as ZoneIQ
- Contaminated land, acid sulfate soils, powerline easements, aircraft noise overlays

## Open Questions
1. Can BCC sewer connection data be obtained via data sharing agreement with Urban Utilities?
2. Is BCC PD Online (DA decisions) structured enough to scrape reliably?
3. Separate product or feature inside WhatCanIBuild?
4. Pricing: $49 vs $79 vs $99?
5. Free preview (lot boundary + traffic light only) vs full report behind paywall?
