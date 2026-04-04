# ClearOffer — Backlog
Last updated: 6 April 2026

## How to run overnight builds
Terminal: C:\dev\buyerside
Command: claude --dangerously-skip-permissions
Prompt: "Read BACKLOG.md and work through every [ ] task in Sprint N. Do not stop between tasks. Mark [x] when done. Commit after each sprint. Push at the end."

Note: repo branch is main not master.

## Critical rules for Claude Code
- Never combine cd and git in same command
- Use $func$ not $$ for Supabase SQL
- Always call zoneiq-sigma.vercel.app not zoneiq.com.au for server-side ZoneIQ fetches
- Supabase v2: use try/catch not .catch() chaining
- Max 6 commits per sprint

---

## SPRINT 4 — Stripe Live Mode + Supabase Storage
Priority: HIGH — must complete before launch

- [ ] Switch Stripe to live mode
  - Update STRIPE_SECRET_KEY in Vercel env (live key from Stripe dashboard)
  - Update STRIPE_PUBLISHABLE_KEY in Vercel env (live key)
  - Verify webhook is registered in live mode (not just test mode)
  - Test with real card after switching
- [ ] Create Supabase table for Scout Report sessions
  ```sql
  CREATE TABLE clearoffer_sessions (
    id uuid primary key default gen_random_uuid(),
    address text not null,
    lat numeric,
    lng numeric,
    email text,
    zone_code text,
    council text,
    zoneiq_data jsonb,
    created_at timestamptz default now(),
    expires_at timestamptz default now() + interval '90 days'
  );
  ```
- [ ] Create Supabase table for Buyer's Brief purchases
  ```sql
  CREATE TABLE clearoffer_briefs (
    id uuid primary key default gen_random_uuid(),
    stripe_session_id text unique not null,
    address text not null,
    customer_email text,
    brief_content text,
    status text default 'pending',
    created_at timestamptz default now(),
    expires_at timestamptz default now() + interval '90 days'
  );
  ```
- [ ] Store Scout Report session in Supabase on email submit
- [ ] Store Buyer's Brief in Supabase on Stripe webhook completion
- [ ] Add /api/get-brief endpoint to retrieve stored brief by token
- [ ] Commit: "Sprint 4: Stripe live mode + Supabase storage"

---

## SPRINT 5 — ZoneIQ Overlay Expansion
Priority: MEDIUM — adds depth to Scout Report
Dependency: ZoneIQ must have bushfire overlay live (Sprint 8 complete per STATE.md ✅)

- [ ] Add bushfire overlay to Scout Report
  - Call ZoneIQ for bushfire data (already in zoneiq-sigma.vercel.app response)
  - Display bushfire overlay status in Scout Report alongside flood/character
  - Smart placeholder if not in overlay: "No bushfire overlay identified"
- [ ] Add "Coverage" notice to Scout Report when address is Gold Coast or Moreton Bay
  - ZoneIQ covers GC and Moreton Bay — ClearOffer should accept these addresses too
  - Update address validation to accept GC and Moreton Bay postcodes
  - Update Scout Report header to show council name
- [ ] Verify heritage overlay integration when ZoneIQ Sprint 9 completes
  - Add heritage overlay section to Scout Report
  - INTEGRATION TASK: monitor ZoneIQ Sprint 9 completion in STATE.md
- [ ] Commit: "Sprint 5: ZoneIQ overlay expansion — bushfire + multi-council"

---

## SPRINT 6 — Domain API Integration
Priority: HIGH — core product gap
Blocker: Domain API approval required first

- [ ] BLOCKED: Domain API approval pending
  - Follow up: email developer-support@domain.com.au
  - Include: sandbox client ID, use case description
  - When approved: proceed with tasks below
- [ ] Wire Address Suggestions API to autocomplete (replace Nominatim for property addresses)
- [ ] Wire Agents & Listings API to Scout Report
  - Display: listing price, days on market, agent name, agency
  - Replace placeholder dashes with real data
  - Handle: not-for-sale properties (show "Not currently listed")
- [ ] Wire Price Estimation API to Scout Report
  - Display: estimated value range
  - Add confidence indicator
- [ ] Update data-notice banner to hidden when Domain data available
- [ ] Commit: "Sprint 6: Domain API integration — listings and price estimate"

---

## SPRINT 7 — PropTechData Integration
Priority: HIGH — comparable sales is key Buyer's Brief input
Blocker: PropTechData credentials required first

- [ ] BLOCKED: PropTechData credentials pending
  - Follow up: hello@proptechdata.com.au
  - When approved: proceed with tasks below
- [ ] Wire comparable sales to Scout Report
  - Display: 3-5 recent comparable sales in suburb
  - Show: address, sale price, sale date, bed/bath/car, land size
- [ ] Wire comparable sales into Buyer's Brief AI prompt
  - Include comparable sales data in Claude prompt for offer reasoning
  - "Based on comparables showing X, Y, Z recently sold at..."
- [ ] Wire AVM price estimate into Buyer's Brief
  - Use as anchor for offer recommendation
- [ ] Commit: "Sprint 7: PropTechData integration — comparable sales + AVM"

---

## SPRINT 8 — Buyer's Brief Quality Improvement
Priority: MEDIUM — improves conversion and word of mouth

- [ ] Improve Buyer's Brief AI prompt
  - Add ZoneIQ planning rules explicitly to prompt context
  - Add flood overlay consequences to prompt (not just yes/no)
  - Add character overlay implications to prompt
  - Add school catchment quality signal (ICSEA if available)
  - Prompt should reference: "Based on Brisbane City Plan 2014, this property is zoned X which means..."
- [ ] Add suburb market context to Buyer's Brief
  - Use Domain free API for: median price trend, days on market trend, auction clearance rate
  - Include in Buyer's Brief "suburb outlook" section
- [ ] Add "negotiation leverage" section improvements
  - Days on market > 60: strong buyer leverage signal
  - Price reductions: flag if listing price has dropped
  - Time of year: auction vs private treaty seasonal patterns
- [ ] Improve Scout Report layout
  - Add suburb summary card (median price, clearance rate, trend)
  - Visual flood overlay map thumbnail
  - School catchment with ICSEA score if available
- [ ] Commit: "Sprint 8: Buyer's Brief prompt quality + Scout Report layout"

---

## SPRINT 9 — Cross-Product Integration
Priority: MEDIUM — portfolio coherence

- [ ] INTEGRATION TASK: Add SubdivideIQ cross-sell to ClearOffer
  - Detect: if zone allows subdivision AND lot size likely > 600m², show SubdivideIQ CTA
  - "This property may be subdivisible. Check feasibility at SubdivideIQ."
  - Link to subdivideiq.com.au when live
- [ ] INTEGRATION TASK: Add WhatCanIBuild cross-sell to ClearOffer
  - Show at bottom of every Scout Report and Buyer's Brief
  - "Want to know what you can build at this address? $19.99 at WhatCanIBuild."
  - Link to whatcanibuild.com.au with address pre-filled if possible
- [ ] INTEGRATION TASK: Share ZoneIQ data lookup with SubdivideIQ
  - When SubdivideIQ launches, it should call zoneiq-sigma.vercel.app same as ClearOffer
  - No duplication of planning data — single source of truth
- [ ] Add referral tracking
  - UTM parameters on cross-product links
  - Track which product drove which conversion in Supabase
- [ ] Commit: "Sprint 9: Cross-product integration — SubdivideIQ + WhatCanIBuild cross-sells"

---

## SPRINT 10 — Launch Prep
Priority: HIGH — needed before marketing spend

- [ ] Verify clearoffer.com.au shows as valid in Vercel project domains
- [ ] Verify all Stripe webhooks registered in live mode
- [ ] Test full flow end to end in live mode with real card
- [ ] Verify Resend email delivering to gmail + outlook (check spam)
- [ ] Add Google Analytics or Plausible to clearoffer.com.au
- [ ] Write landing page copy targeting "Before You Bid alternative"
- [ ] Add FAQ section: "Is this the same as calling council?" / "Do I need a town planner after this?"
- [ ] Add sample Scout Report for display (use 6 Glenheaton Court Carindale as demo)
- [ ] Social proof: add "Based on Brisbane City Plan 2014" trust signal
- [ ] Commit: "Sprint 10: Launch prep"

---

## Post-Launch Backlog (unscheduled)

- Subscription model: $29/month for unlimited Scout Reports (buyers agents)
- White-label version for buyers agents to send to clients
- API version: POST /api/scout-report → returns JSON for developers
- Sunshine Coast expansion (depends on ZoneIQ Sprint 11+)
- NSW expansion (depends on ZoneIQ national roadmap)
- Mobile app (React Native, reuse API layer)
- Before You Bid direct comparison landing page
- Google Ads: "property due diligence Brisbane", "before you bid report Brisbane"
- Reddit presence: r/AusPropertyChat, r/Brisbane, r/AusFinance
- Buyers agent partnership: offer white-label or referral commission

---

## Integration Dependency Map

ClearOffer depends on:
- ZoneIQ (zoneiq-sigma.vercel.app) — LIVE ✅
- Supabase (fzykfxesznyiigoyeyed) — PARTIAL (email only, no storage yet)
- Resend (clearoffer.com.au) — LIVE ✅
- Stripe — TEST ONLY ⚠️
- Claude API — LIVE ✅
- Domain API — BLOCKED ❌
- PropTechData — BLOCKED ❌

ZoneIQ overlays available to ClearOffer right now:
- Zone + rules ✅
- Flood overlay ✅
- Character overlay ✅
- School catchments ✅
- Bushfire overlay ✅ (ZoneIQ Sprint 8 complete)
- Heritage overlay — pending ZoneIQ Sprint 9
- Aircraft noise — pending ZoneIQ Sprint 10
