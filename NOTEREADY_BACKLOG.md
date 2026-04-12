# NoteReady — Backlog
Last updated: 12 April 2026

## Sprint 1: Foundation — repo, proxy, deploy

### [ ] NR-1: Create repo and Vercel project
- Create stevenpicton1979/noteready on GitHub
- Link to Vercel (stevenpicton1979s-projects team)
- Vanilla HTML/CSS/JS structure: public/index.html, api/ directory
- .vercelignore, .gitignore
- CLAUDE.md with product-specific config (trusted domains, dev instructions, gotchas)
- BACKLOG.md (copy of this file, kept in sync)

### [ ] NR-2: Extract MVP HTML into repo
- Copy the working artifact HTML into public/index.html
- Strip the client-side Claude API call (replace with fetch to /api/generate)
- Verify all CSS/JS remains inline and functional
- Test locally with vercel dev

### [ ] NR-3: Build API proxy route
- api/generate.js — Vercel serverless function
- Accepts POST: participant context, shift data, goals, notes, incident flags
- Constructs system prompt + user message (same two-part architecture from MVP)
- Calls Claude API server-side (ANTHROPIC_API_KEY in Vercel env vars)
- Returns generated note as JSON
- Input validation: reject empty notes, cap input length
- Error handling: return user-friendly message on API failure

### [ ] NR-4: Add ANTHROPIC_API_KEY to Vercel env vars
- Add to Production + Preview + Development environments
- Verify vercel dev pulls it correctly

### [ ] NR-5: Deploy and smoke test
- Push to main, verify Vercel deployment
- Test full flow: fill form → generate → see note → copy
- Test error states: empty input, API timeout
- Mobile responsive check (Chrome DevTools)

## Sprint 2: Auth + saved participants

### [ ] NR-6: Create Supabase project
- New project (separate from PropTech)
- Note project ID in CLAUDE.md and STATE_NOTEREADY.md
- Enable email + password auth
- Configure auth email templates (Supabase dashboard)

### [ ] NR-7: Database schema
- participants table: id (uuid), user_id (uuid, FK auth.users), name, ndis_number, support_category, goals (jsonb), created_at, updated_at
- notes table: id (uuid), user_id (uuid), participant_id (uuid, FK participants), shift_date, shift_start, shift_end, duration_minutes, raw_input, generated_note, incident_flags (jsonb), model_used, tokens_used, created_at
- RLS policies: users can only read/write their own rows
- Indexes: notes(user_id, created_at), participants(user_id)

### [ ] NR-8: Auth UI
- Login / signup page (public/login.html or modal)
- Supabase Auth vanilla JS client (@supabase/supabase-js via CDN)
- Session management: store token, redirect to app on login, redirect to login on 401
- Logout button in app header
- SUPABASE_URL and SUPABASE_ANON_KEY in Vercel env vars (anon key is public — fine client-side)

### [ ] NR-9: Saved participants CRUD
- "My Participants" panel: list, add, edit, delete
- Select participant before generating a note — auto-fills name, NDIS number, support category, goals
- Store in Supabase participants table
- Goals stored as JSON array of strings — render as checkboxes on note form (same as MVP)

### [ ] NR-10: Persist generated notes
- After successful generation, save to notes table
- Note history view: list of recent notes per participant, click to expand
- 30-day rolling window displayed (store indefinitely, display recent)
- Copy-to-clipboard still works from history view

## Sprint 3: Metering + Stripe

### [ ] NR-11: Usage metering
- api/generate.js checks note count for current calendar month before generating
- Free tier: 10 notes/month
- If over limit and no active subscription → return 402 with upgrade prompt
- Display remaining notes in UI header ("7 of 10 free notes used")

### [ ] NR-12: Stripe subscription setup
- Create NoteReady product in Stripe dashboard
- Price: $19/month AUD (Pro plan)
- Create Stripe Checkout session from api/create-checkout.js
- Success/cancel redirect URLs
- STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY in Vercel env vars

### [ ] NR-13: Stripe webhook handler
- api/stripe-webhook.js
- Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- Update subscriptions table in Supabase on each event
- STRIPE_WEBHOOK_SECRET in Vercel env vars

### [ ] NR-14: Subscription status in UI
- Check subscription status on page load
- Free users see: note count, upgrade CTA
- Pro users see: "Pro" badge, no limits
- Manage subscription link (Stripe Customer Portal)

### [ ] NR-15: Upgrade flow
- "Upgrade to Pro" button when free limit reached (or proactively in header)
- Redirects to Stripe Checkout
- On return, refresh subscription status
- Seamless — user should be generating their next note within 60 seconds of paying

## Sprint 4: Polish + launch prep

### [ ] NR-16: Landing page
- public/index.html becomes the app (behind auth)
- public/landing.html (or root with auth redirect) — marketing page
- Hero: value prop, demo screenshot/gif, CTA to sign up
- How it works: 3-step visual (enter shift details → generate → copy)
- Pricing: free vs Pro comparison
- FAQ: Is this compliant? Is my data stored? Who is this for?
- Footer: disclaimer (not clinical advice), privacy policy link, terms link

### [ ] NR-17: Domain setup
- Buy noteready.com.au (or best available alternative) via VentraIP
- Add to Vercel project
- DNS configuration

### [ ] NR-18: Resend email setup
- Verify domain in Resend (note: free tier 1 domain limit — may need to check if clearoffer.com.au can be swapped or if upgrade needed)
- Transactional emails: welcome, subscription confirmation, subscription cancelled
- Or: use Supabase Auth emails for auth, Stripe emails for billing — skip Resend for v1

### [ ] NR-19: Privacy policy + terms
- Privacy policy page: what data is stored, how long, who can access, deletion process
- Terms of service: not clinical advice, not system of record, limitation of liability
- Cookie notice (if applicable — likely minimal, no analytics cookies at launch)

### [ ] NR-20: Mobile responsiveness pass
- Full test on iPhone Safari + Android Chrome
- Form inputs sized for thumb typing
- Generate button prominent and sticky
- Output panel scrollable, copy button accessible
- Test on small screens (375px width)

### [ ] NR-21: Error handling + edge cases
- API timeout → retry once, then user-friendly error
- Empty participant goals → generate note without goal section
- Very long shift notes input → truncate or warn before sending
- Rate limiting on API route (prevent abuse)
- Supabase connection errors → graceful degradation message

### [ ] NR-22: Soft launch
- Deploy to production domain
- Test full flow: signup → add participant → generate free notes → hit limit → upgrade → generate unlimited
- Invite 3–5 NDIS support workers for beta feedback
- Monitor: Vercel logs, Supabase usage, Stripe events, API costs

## Future sprints (v2 — post-launch, based on traction)

### Coordinator dashboard
- Provider signup flow (separate from worker)
- Invite workers to team
- Team-wide note history view
- Quality flags: notes missing goal linkage, incident notes requiring follow-up
- CSV/PDF export for NDIS audits
- Pricing: $12/worker/month

### Enhancements
- Custom goal libraries per provider
- Shift handover summaries (aggregate recent notes per participant)
- Voice-to-note (speech-to-text → generation)
- PWA for mobile install
- Integration APIs for ShiftCare / SupportAbility / Lumary
