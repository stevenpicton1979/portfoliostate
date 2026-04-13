# DevCheck — Product Brief
Last updated: 12 April 2026

## Origin Story

Steve Picton attempted to subdivide 6 Glenheaton Court, Carindale in 2024.
- First contact: town planner said "should be possible", advised land survey as next step
- Engaged: town planner, land surveyor (Cornerstone Surveys), hydraulics engineer (Storm Water Consulting — full TUFLOW/URBS report, RPEQ-signed)
- Total spend: ~$7,500 over 6–9 months
- Outcome: abandoned when hydraulics engineer confirmed flood overlay constraints made rear lot build form commercially unviable
- The pain: nobody surfaced upfront that the hydraulics report was mandatory, expensive, and likely to produce constraints that killed the project

12 months later: attempted a home extension instead. Builder recommended DA on stilts. DA approved. Steve pulled out — never sure if groundworks could have avoided stilts, but finding out required another full DA process. More money lost.

Two projects. Two failures. Both killed by information that was freely available in public datasets but hidden behind a $5,000–$15,000 consultant paywall.

Core insight: **The system forces you to spend $5,000–$15,000 to answer a yes/no question.**
DevCheck's job: **Answer that question for $79–149 before anyone spends a dollar.**

## What DevCheck Is

A comprehensive development feasibility engine for property owners, small investors, and developers. Enter any Brisbane address — every development check runs automatically, and AI explains each result in plain English with traffic lights, cost implications, required consultants, and ordered next steps.

DevCheck covers the full development spectrum:
- **Subdivision** — can the lot split? What overlays affect each potential lot?
- **Knockdown rebuild** — can you demolish? What build form is required?
- **Renovation / extension** — what's the remaining site cover budget? What design constraints apply?
- **Granny flat / secondary dwelling** — is it permitted? What's the estimated rental return?
- **Dual occupancy** — code-assessable or impact-assessable? What are the lot minimums?

One address. Every scenario. Every check. Plain English.

**One-sentence value prop:**
"Every development check on your property — explained in plain English before you spend a dollar on consultants."

## What DevCheck Is NOT

- Not a replacement for a town planner, hydraulics engineer, or surveyor
- Not engineering or legal advice
- Not certifying anything
- Not a building approval
- Not an AVM or property valuation tool (that's ClearOffer's territory)

Analogy: A pre-purchase building inspection vs a structural engineering report. DevCheck is the inspector — tells you whether to bother paying the engineer, and which engineer to call first.

## Target Customers

### Segment A — Homeowner ($79–149 one-off)
- Brisbane homeowner on a large suburban lot (600m²+)
- Has thought about subdividing, extending, or adding a granny flat
- Not yet engaged a town planner, surveyor, or builder
- Pain: doesn't know what they don't know, has heard horror stories about council
- Willingness to pay: $79–149 for certainty before spending thousands
- The SubdivideIQ origin customer — expanded to all development types

### Segment B — Small investor ($79–149 one-off)
- Looking at a property to buy with development upside
- Wants to know: can I subdivide and sell the rear lot? Can I add a granny flat for rental income?
- Needs the answer BEFORE making an offer, not after settlement
- Pain: currently relies on agent claims ("great development potential!") with no independent verification

### Segment C — Developer / town planner ($149–299/month subscription)
- Runs 10–20 site feasibility checks per month
- Currently does this manually: pulls up City Plan online, checks each overlay, reads zone tables
- DevCheck automates 2 hours of manual lookup into 60 seconds
- Subscription = unlimited reports, API access (future), priority support

## The Intercept Moment

**Homeowner path today:**
Idea → town planner ($500 initial) → surveyor ($2,000) → hydraulics ($3,000–8,000) → DA ($5,000+) → maybe abandon

**Homeowner path with DevCheck:**
Idea → [DevCheck — 60 seconds, $79–149] → GREEN/AMBER/RED per scenario → calls the RIGHT consultant first with eyes open

**Developer path today:**
Drive suburbs → pull up BCC City Plan Online → check 9 overlays manually → calculate lot split → 2 hours per site

**Developer path with DevCheck:**
Enter address → every check in 60 seconds → move to next site or engage consultants

## Competitive Landscape

| Capability | Archistar | Landchecker | BCC City Plan Online | DevCheck |
|-----------|:---------:|:-----------:|:-------------------:|:--------:|
| Overlay data display | Yes ($200+/mo) | Yes ($99–199/mo B2B) | Yes (free, manual) | Yes |
| Overlay → plain English impact | No | No | No | **Yes** |
| Multi-scenario feasibility | Partial (developer focus) | No | No | **Yes** |
| Lot split analysis | Yes (developer tool) | No | No | **Yes** |
| Elevation / slope from LiDAR | Yes | No | No | **Yes** |
| Stormwater infrastructure proximity | No | No | No | **Yes** |
| Consultant cost & sequencing | No | No | No | **Yes** |
| Council pathway (code vs impact) | No | No | No | **Yes** |
| Homeowner-accessible pricing | No ($200+/mo) | No ($99+/mo B2B) | Free but incomprehensible | **$79–149 one-off** |
| Brisbane-specific depth | Generic national | Generic national | Authoritative but raw | **Authoritative + interpreted** |

**The moat:**
1. BCC lot-boundary polygon intersection — same authoritative data town planners use
2. AI consequence translation — not "FPA 4" but "this means a $3,000–$8,000 hydraulics report is mandatory"
3. Multi-scenario analysis — nobody else checks subdivision + KDR + renovation + granny flat in one report
4. Consultant sequencing — "engage hydraulics BEFORE surveyor" saves $2,000 in wasted spend
5. Brisbane depth over national breadth — 37+ live data fields specific to BCC planning scheme

## The Checks

Every address triggers every applicable check. Results are grouped by category, then synthesised per development scenario by AI.

### Zone & Entitlements
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Zone code + name | PropertyData (ZoneIQ DB) | LIVE | Base entitlement for everything |
| Permitted uses | PropertyData (zone_rules) | LIVE | What the zone allows by right |
| Minimum lot size | PropertyData (zone_rules) | LIVE | Gate check for subdivision |
| Maximum site cover % | BCC City Plan zone tables | TO BUILD | Determines remaining build footprint |
| Maximum building height | BCC City Plan zone tables | TO BUILD | Storey limit for KDR and extensions |
| Front/side/rear setbacks | BCC City Plan zone tables | TO BUILD | Constrains building envelope |
| Plot ratio | BCC City Plan zone tables | TO BUILD | Total GFA limit |
| Code-assessable vs impact-assessable threshold | BCC City Plan | TO BUILD | Determines council pathway + cost + timeline |

### Lot Geometry
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Lot area (m²) | PropertyData (BCC DCDB) | LIVE | |
| Lot plan number | PropertyData (BCC DCDB) | LIVE | |
| Lot boundary polygon | PropertyData (BCC DCDB) | LIVE | |
| Frontage width | Calculated from polygon | TO BUILD | Critical for subdivision + battle-axe viability |
| Lot depth | Calculated from polygon | TO BUILD | |
| Shape regularity score | Calculated from polygon | TO BUILD | Irregular lots = harder to split |
| Indicative subdivision line | Calculated from polygon + zone minimums | TO BUILD | Shows where the lot could split |
| Battle-axe access viability | Calculated from frontage + lot shape | TO BUILD | 3.5m minimum access strip in BCC |

### Terrain & Elevation
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Elevation profile (9-point grid) | QLD ArcGIS ImageServer | TO BUILD | Free, live REST query, no download |
| Slope classification (flat/moderate/steep) | Derived from elevation | TO BUILD | <2% flat, 2–10% moderate, >10% steep |
| Cut/fill implications | Derived from slope + flood level | TO BUILD | Steep + flood = expensive earthworks |
| Ground level vs flood immunity | Derived from elevation + FPA | TO BUILD | Slab vs stilts decision — Steve's extension story |

### Flood
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Creek/waterway FPA 1–5 | PropertyData (BCC ArcGIS) | LIVE | All categories via polygon intersection |
| Brisbane River FPA 1–5 | PropertyData (BCC ArcGIS) | LIVE | |
| Overland flow | PropertyData (BCC ArcGIS) | LIVE | The "unmapped" flow that killed Steve's subdivision |
| 1% AEP combined extent | PropertyData (BCC ArcGIS) | LIVE | |
| Flooded January 2011 | PropertyData (BCC ArcGIS) | LIVE | Historic event flag |
| Flooded February 2022 | PropertyData (BCC ArcGIS) | LIVE | Historic event flag |
| Hydraulics report required? | Derived from FPA category | TO BUILD | FPA 1–4 = mandatory. This is the $3K–$8K flag |
| Flood immunity level (AHD) | BCC Flood Awareness maps | TO INVESTIGATE | May be derivable from FPA + elevation |

### Environmental & Heritage
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Heritage overlay | PropertyData (BCC ArcGIS) | LIVE | Hard gate: cannot demolish |
| Character overlay (TBC) | PropertyData (BCC ArcGIS) | LIVE | Traditional building character — strict design rules |
| Character overlay (DHC) | PropertyData (BCC ArcGIS) | LIVE | Dwelling house character — less strict |
| Bushfire hazard area | PropertyData (BCC ArcGIS) | LIVE | Triggers BAL assessment requirement |
| Koala habitat | PropertyData (BCC ArcGIS) | LIVE | May constrain tree removal / site clearing |
| Acid sulfate soils | PropertyData (BCC ArcGIS) | LIVE | Triggers soil management plan if excavation |
| Biodiversity area | PropertyData (BCC ArcGIS) | LIVE | May restrict clearing |
| Waterway corridor / wetlands | PropertyData (BCC ArcGIS) | LIVE | Setback buffers apply |
| Landslide susceptibility | BCC ArcGIS | PIVOT (confirmed accessible) | Hilly suburb flag — Bardon, Paddington, Red Hill |

### Infrastructure
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| Stormwater pipe proximity | BCC Open Data | TO BUILD | <30m GREEN, 30–80m AMBER, >80m RED |
| Mapped overland flow paths | BCC Open Data (surface drains) | TO BUILD | BCC mapped paths in public data |
| Stormwater manhole proximity | BCC Open Data | TO BUILD | Connection point indicator |
| HV powerline easement | PropertyData (BCC ArcGIS) | LIVE | Hard constraint on building envelope |
| Petroleum pipeline | PropertyData (BCC ArcGIS) | LIVE | Setback buffer |
| Road hierarchy | PropertyData (BCC ArcGIS) | LIVE | Access and noise implications |
| Sewer connection | Urban Utilities | BLOCKED | Not public — flag in report with UU enquiry link |

### Aircraft Noise
| Check | Source | Status | Notes |
|-------|--------|--------|-------|
| ANEF contour | PropertyData (BCC ArcGIS) | LIVE | Noise insulation requirements if ANEF 20+ |

## AI Synthesis — Per-Scenario Output

For EACH development scenario applicable to the property, AI generates:

### 1. Feasibility Verdict
Traffic light: GREEN / AMBER / RED
One-sentence summary: "Subdivision is AMBER — viable lot split but FPA 4 flood overlay triggers mandatory hydraulics report ($3,000–$8,000)."

### 2. Key Constraints
Ordered list of constraints that affect this scenario, each with:
- What the constraint IS (plain English, not planning jargon)
- What it MEANS for this specific scenario
- What it COSTS to resolve (consultant fee, report cost, timeline)
- Whether it's a HARD BLOCK or a MANAGEABLE HURDLE

### 3. Required Consultants — In Order
"Based on this property's constraints, engage consultants in this order:
1. Hydraulics engineer — $3,000–$8,000, 6–8 weeks (do this FIRST — if flood constraints kill the project, you've saved $5,000+ in surveyor and planner fees)
2. Land surveyor — $2,000–$3,500, 2–3 weeks
3. Town planner — $3,000–$6,000 for DA preparation"

This ordering is the core value. Steve's subdivision failed because nobody told him to get the hydraulics report BEFORE spending $2,000 on a survey.

### 4. Council Pathway
- Code-assessable: faster, cheaper, no public notification
- Impact-assessable: 3–6 months, $5,000+ in council fees, neighbour notification
- Full DA: 6–12 months, significant cost, discretionary decision

### 5. Estimated Timeline & Budget
Realistic ranges for the full process from DevCheck → DA approval:
- Best case (GREEN, code-assessable): 3–4 months, $8,000–$15,000
- Typical case (AMBER): 6–9 months, $15,000–$30,000
- Complex case (RED): 12+ months, $30,000+, with identified risk of abandonment

### 6. Warning Flags
Things that could kill the project, ordered by probability:
"⚠️ FPA 4 flood overlay covers 40% of your lot. In Steve's experience at this address, the hydraulics report confirmed flood constraints that made the rear lot commercially unviable. Budget for this report FIRST."

### 7. Next Steps
Ordered actions the user should take NOW:
1. "Download this report and take it to your first consultant meeting"
2. "Call a hydraulics engineer — here's what to ask for: [specific scope]"
3. "Do NOT engage a surveyor until hydraulics clears"

## Report Output

### Format
- Web-based interactive report (primary) — shareable URL
- PDF download option (secondary) — for printing / taking to consultants
- Same Stripe → Resend → Supabase pattern as WhatCanIBuild and ClearOffer

### Structure
1. **Property Summary** — address, lot area, zone, aerial image, lot boundary overlay
2. **Development Scenarios** — expandable cards, one per scenario, each with traffic light + AI synthesis
3. **All Checks** — full data table, every check that ran, every result, every source
4. **Consultant Guide** — who to call, in what order, realistic cost ranges
5. **Disclaimer** — not engineering or legal advice, not a substitute for professional certification

### Free Preview vs Paid Report
- **Free preview (no payment, email gate):** Property summary + traffic lights per scenario (GREEN/AMBER/RED) + "3 constraints found" teaser. Enough to know if it's worth $79–149.
- **Paid report:** Full AI synthesis, all constraint details, consultant sequencing, cost estimates, next steps, PDF download.

## Pricing

### One-off (homeowners, small investors)
- **$99 AUD** — single property, full report, PDF download
- Test at launch. If conversion is strong, test $149. If weak, test $79.
- Stripe checkout, same pattern as existing products.

### Subscription (developers, town planners) — Phase 2
- **$199/month** — unlimited reports, priority support
- **$299/month** — unlimited reports + API access (when ready)
- Build subscription tier AFTER one-off is validated. Don't complicate launch.

## Data Architecture

```
DevCheck (presentation + AI synthesis)
    │
    ▼
PropertyData API (POST /api/lookup, tier=devcheck)
    │
    ├── BCC ArcGIS (37+ overlay fields) ── LIVE
    ├── ZoneIQ DB (zone geometries, zone rules, schools) ── LIVE
    ├── QLD LiDAR ImageServer (elevation) ── TO BUILD
    ├── BCC Open Data (stormwater, overland flow) ── TO BUILD
    ├── BCC City Plan tables (setbacks, site cover, height) ── TO BUILD
    └── PropTechData (AVM, comps — future, paid tier) ── BLOCKED
```

DevCheck is a presentation + AI layer. It does NOT query data sources directly. Everything goes through PropertyData API. This means every new field added to PropertyData (for ClearOffer or any other product) automatically becomes available to DevCheck.

### New PropertyData fields needed for DevCheck
| Field | Source | Effort | Blocker |
|-------|--------|--------|---------|
| Frontage width | Calculated from lot polygon | 0.5 sprint | None |
| Lot depth | Calculated from lot polygon | 0.5 sprint | None |
| Elevation grid (9 points) | QLD ImageServer REST | 1 sprint | None |
| Slope classification | Derived from elevation | 0.5 sprint | Elevation must exist |
| Stormwater pipe proximity | BCC Open Data → Supabase | 1 sprint | Data load needed |
| Overland flow path proximity | BCC Open Data → Supabase | 0.5 sprint | Same data load as pipes |
| Max site cover % | BCC City Plan zone tables | 1 sprint | Manual extraction from City Plan |
| Max building height | BCC City Plan zone tables | 0.5 sprint | Same source as site cover |
| Setbacks (front/side/rear) | BCC City Plan zone tables | 0.5 sprint | Same source |
| Plot ratio | BCC City Plan zone tables | 0.5 sprint | Same source |
| Code vs impact threshold | BCC City Plan assessment tables | 1 sprint | Complex — varies by zone + use |
| Landslide susceptibility | BCC ArcGIS | 0.5 sprint | Confirmed accessible |
| Infrastructure charges estimate | BCC published schedules | 0.5 sprint | Static data, annual update |

## Stack

- **Repo:** `stevenpicton1979/devcheck`
- **Frontend:** Vanilla HTML/CSS/JS (same as all products)
- **Backend:** Vercel serverless Node.js
- **Data:** PropertyData API (`POST /api/lookup` with tier=devcheck)
- **Database:** Supabase fzykfxesznyiigoyeyed (PropertyData's instance — DevCheck has no direct DB access)
- **AI:** Sonnet for report synthesis, Haiku for interactive Q&A
- **Payments:** Stripe (same account)
- **Email/PDF:** Resend
- **Domain:** devcheck.com.au (to be purchased at launch)
- **Local dev:** `vercel dev --listen 3003`

## Relationship to Other Products

| Product | Status | Relationship to DevCheck |
|---------|--------|--------------------------|
| **PropertyData API** | Building | DevCheck's data engine. All data flows through PropertyData. |
| **ClearOffer** | Live (building) | Separate product, separate audience (buyers vs developers/owners). Both consume PropertyData. No overlap in value prop. |
| **WhatCanIBuild** | Live | **SUNSET.** Redirect whatcanibuild.com.au to devcheck.com.au. DevCheck subsumes all WCIB functionality. |
| **SubdivideIQ** | Design only | **ABSORBED.** SubdivideIQ becomes one scenario inside DevCheck. No separate product. |
| **ZoneIQ** | Live (legacy) | Data now served via PropertyData. ZoneIQ repo becomes legacy. RapidAPI listing can stay. |

## SEQ Expansion Path

Brisbane-first. Then:
1. **Gold Coast** — ZoneIQ already has zone geometries + zone rules. Need GCCC overlay endpoints (different ArcGIS org).
2. **Moreton Bay** — ZoneIQ already has zone geometries. MBRC overlay endpoints needed.
3. **Sunshine Coast** — Same pattern.
4. **National** — PropertyData's architecture supports adding council adapters. Each council is a new source, not a restructure.

## Open Questions

1. Domain: is devcheck.com.au available? Fallback: devcheck.au, devcheckiq.com.au
2. Pricing: $99 vs $79 vs $149 for one-off? Test at $99.
3. Free preview: email gate or fully open? Email gate = lead capture for subscription upsell.
4. How much of BCC City Plan zone tables (site cover, height, setbacks) can be extracted programmatically vs manual entry?
5. Can infrastructure charges be estimated accurately enough to include, or is this a "contact council" flag?
6. Subscription tier: build at launch or validate one-off first? Recommendation: validate one-off first.
7. PDF generation: same Resend approach as ClearOffer, or richer PDF with maps and diagrams?
