# ClearOffer — Product Brief
Last updated: 6 April 2026

## What It Is
ClearOffer is an AI-powered buyer's intelligence report for Brisbane property buyers.
A buyer enters an address, gets a free Scout Report, then pays $149 for a full AI-generated Buyer's Brief.

One sentence value prop:
"Independent property analysis for Brisbane buyers — what the agent won't tell you."

## Target Customer
- Brisbane property buyers preparing to make an offer
- First home buyers doing due diligence before auction
- Investors evaluating properties before committing
- Anyone who wants an independent view before spending $500–1000 on a buyer's agent

## Competitive Positioning
Direct competitor: Before You Bid (~$39/report)
ClearOffer advantages: AI analysis, ZoneIQ planning rules depth, flood overlay, character overlay, school catchments, Buyer's Brief with specific offer reasoning.
Before You Bid weaknesses: no AI, no planning rules, no overlay depth.

## Product Flow
1. User enters Brisbane address on clearoffer.com.au
2. Address autocomplete via Nominatim
3. Scout Report renders free (email gated):
   - Zone name + planning rules from ZoneIQ
   - Flood overlay status from ZoneIQ
   - Character overlay status from ZoneIQ
   - School catchments from ZoneIQ
   - Listing data: price, days on market, agent (BLOCKED — Domain API pending)
   - Comparable sales (BLOCKED — PropTechData pending)
   - Price estimate (BLOCKED — PropTechData pending)
4. Email captured → confirmation email via Resend from hello@clearoffer.com.au
5. Upsell CTA: "Get your Buyer's Brief — $149"
6. Stripe Checkout ($149 AUD)
7. Claude AI generates streaming Buyer's Brief:
   - Specific offer recommendation with reasoning
   - Negotiation leverage analysis
   - 5-10 year suburb outlook
   - What the agent won't tell you
8. Brief displays on screen, stored 90 days

## Stack
- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel serverless Node.js
- Repo: stevenpicton1979/buyerside (main branch — NOT master)
- Live URL: clearoffer.com.au
- Also accessible: buyerside.stevenpicton.ai

## Portfolio Infrastructure Integration

### ZoneIQ (zoneiq-sigma.vercel.app) — ALREADY INTEGRATED ✅
ClearOffer calls ZoneIQ for:
- Zone name and code
- Planning rules (height, setbacks, coverage, permitted uses)
- Flood overlay (has_flood_overlay, risk_level, flood_category)
- Character overlay (has_character_overlay)
- School catchments (school_name, school_type, school_level)

IMPORTANT: Always call zoneiq-sigma.vercel.app NOT zoneiq.com.au for server-side fetches
(zoneiq.com.au has a redirect issue on server-side — use the Vercel URL directly)

### Future ZoneIQ Integration Opportunities
As ZoneIQ expands, ClearOffer should consume new overlays automatically:
- Bushfire overlay (Sprint 8, already built in ZoneIQ) — add to Scout Report
- Heritage overlay (ZoneIQ Sprint 9) — add to Scout Report when available
- Aircraft noise overlay (ZoneIQ Sprint 10) — add to Scout Report when available
- Nearest polygon fallback (ZoneIQ Sprint 5) — reduces OUTSIDE_COVERAGE errors

### Shared Supabase (fzykfxesznyiigoyeyed) — NOT YET USED BY CLEAROFFER
ClearOffer does not currently store data in Supabase. Future use cases:
- Store Scout Report sessions (email + address + ZoneIQ data) for retargeting
- Store Buyer's Brief results (Stripe session + report content) for 90-day access
- Share comparable sales data with WhatCanIBuild and SubdivideIQ when PropTechData integrated
- Cross-product analytics (how many ClearOffer users also used WhatCanIBuild?)

### Resend — INTEGRATED ✅
Sending domain: clearoffer.com.au (verified, free tier)
From address: hello@clearoffer.com.au
Sends: Scout Report confirmation email with Buyer's Brief upsell

Note: Resend free tier = 1 domain. WhatCanIBuild also sends from hello@clearoffer.com.au temporarily.
When WhatCanIBuild moves to its own Resend domain, ClearOffer retains clearoffer.com.au.

### Stripe — PARTIALLY INTEGRATED ⚠️
Same Stripe account as WhatCanIBuild.
ClearOffer Stripe status: TEST MODE ONLY
Must switch to live mode before launch.
Webhook: registered at buyerside.stevenpicton.ai/api/stripe-webhook (verify this is correct)

### Claude API — INTEGRATED ✅
Used for Buyer's Brief generation (streaming).
Model: claude-sonnet-4-20250514

## Current Blockers

### BLOCKER 1: Domain.com.au API — PENDING APPROVAL
Applied for: Address Suggestions, Agents & Listings, Price Estimation Premium Trial, Properties & Locations
Status: Sandbox active (Listings Management). Full access pending manual approval.
Impact: Scout Report shows placeholder data for listing price, days on market, agent name.
What to do: Email developer-support@domain.com.au to follow up. Include sandbox client ID.
When unblocked: wire api/property-lookup.js to real Domain endpoints.

### BLOCKER 2: PropTechData — PENDING CREDENTIALS
Applied via: hello@proptechdata.com.au
Impact: No comparable sales data, no AVM price estimate in Scout Report or Buyer's Brief.
When unblocked: integrate comparable sales into Scout Report, use AVM in Buyer's Brief offer reasoning.

### BLOCKER 3: Stripe live mode — NOT SWITCHED
Impact: Cannot accept real $149 payments.
Fix: Stripe dashboard → switch to live mode → update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in Vercel env → redeploy.

### BLOCKER 4: clearoffer.com.au DNS — MAY NEED VERIFICATION
DNS was configured via VentraIP pointing to Vercel.
Verify domain shows as valid in Vercel project settings.

## Environment Variables (Vercel — buyerside project)
- STRIPE_SECRET_KEY — test key (needs live key before launch)
- STRIPE_PUBLISHABLE_KEY — test key (needs live key before launch)
- RESEND_API_KEY — active
- ANTHROPIC_API_KEY — active (for Buyer's Brief generation)
- Domain API credentials — pending approval

## Known Issues
- Domain listings search fails with 403 (Domain API not yet approved)
- Buyer's Brief generates even when Domain data unavailable (correct behaviour — AI works with ZoneIQ data)
- Scout Report shows placeholder dashes for price, DOM, agent — replaced with smart placeholders in Sprint 3

## Relationship to Other Products
- ZoneIQ: ClearOffer is a consumer product built on top of ZoneIQ. Every Scout Report calls ZoneIQ.
- WhatCanIBuild: Sister product. WhatCanIBuild answers "what can I build", ClearOffer answers "should I buy". Cross-sell present at bottom of WhatCanIBuild reports.
- SubdivideIQ: Future cross-sell — subdivision-potential properties surfaced in ClearOffer could link to SubdivideIQ.
- Portfolio narrative: ClearOffer demonstrates ZoneIQ's value to B2C customers. "We built ClearOffer on our own APIs" is the ZoneIQ sales story.

## Sprint History
- Sprint 1: Initial build — address autocomplete, Scout Report, email gate, Stripe checkout, Claude Buyer's Brief
- Sprint 2: Domain API integration attempt (403 blocked), ZoneIQ overlays wired, real data pipeline
- Sprint 3: Rebrand BuyerSide → ClearOffer, smart placeholders, landing page copy, data-notice banner, Resend email
