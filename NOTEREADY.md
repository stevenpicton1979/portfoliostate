# NoteReady — Product Brief
Last updated: 12 April 2026

## Origin Story
Steve Picton built a working MVP as a Claude artifact — a single self-contained HTML file that generates NDIS progress notes from shift data using Claude's API. The pain it solves: NDIS support workers spend 15–30 minutes after every shift writing progress notes that need to be person-first, goal-linked, objective, and audit-ready. Most workers aren't trained writers. Notes end up inconsistent, non-compliant, or just not written at all — which puts the provider's NDIS registration at risk.

Core insight: The note structure is formulaic. The content is unique to each shift, but the format, tone, and compliance requirements are identical every time. An LLM with the right system prompt can produce audit-quality notes in seconds from rough shift observations.

## What NoteReady Is NOT
- Not a participant management system (use your provider's CRM)
- Not a rostering tool
- Not a billing/claims platform
- Not storing clinical records (notes are generated and copied out — NoteReady is not the system of record)
- Not giving clinical or medical advice

Analogy: Grammarly for NDIS notes. It doesn't decide what happened — you tell it what happened, and it writes it up properly.

## What NoteReady IS
An AI-powered progress note writer for NDIS support workers. Enter your shift details, hit generate, get a compliant, goal-linked progress note in 10 seconds. Copy it into your provider's system and move on with your day.

One sentence value prop:
"Write NDIS progress notes in 10 seconds, not 30 minutes."

## Target Customer

### Stage 1 — Individual support workers
- NDIS support workers (disability, aged care crossover)
- Writing 1–5 progress notes per day after shifts
- Currently writing notes manually, often on their phone
- Pain: time-consuming, unsure if notes meet NDIS audit requirements
- Willingness to pay: $19/month to save 1–2 hours per day

### Stage 2 — Provider organisations
- NDIS registered providers employing 10–200+ support workers
- Need standardised, compliant notes across their whole team
- Pain: inconsistent note quality, audit risk, training overhead
- Willingness to pay: $12/worker/month for dashboard + consistency + export

## Competitive Landscape
- Manual templates: Word docs and fillable PDFs — no intelligence, no compliance checking
- Provider software (ShiftCare, SupportAbility, Lumary): Have note fields but no AI generation — workers still type from scratch
- Generic AI (ChatGPT, Claude direct): Workers already doing this ad-hoc — but no NDIS-specific prompting, no goal linkage, no structured output, no saved context
- No product exists that combines NDIS-specific AI generation with participant context and goal tracking in a purpose-built interface

## MVP — What's Built
Single HTML file with embedded CSS/JS:
- Multi-section form: participant name + NDIS number, support category dropdown, shift date/time/duration auto-calc, worker name, free-text shift notes, goal checkboxes, mood selector, incident flags
- Claude API integration: calls claude-sonnet-4-20250514 via fetch, max 1000 tokens
- Two-part prompt architecture:
  - System prompt: role, participant context, goals as numbered list, enforces person-first language, objective tone, past tense, structured output (PROGRESS NOTE header, SUPPORT DELIVERED, GOAL PROGRESS, PARTICIPANT PRESENTATION, HANDOVER NOTES), incident flag instruction
  - User message: raw shift notes + incident flags
- Output panel: formatted note, copy-to-clipboard, incident banner, disclaimer footer
- Branding: "NoteReady", DM Sans + DM Mono fonts, teal brand colour

## Stage 1 — Launch Product

### Core Features (v1)
1. Note generation (already built in MVP — needs server-side proxy)
2. Saved participants — store name, NDIS number, goals, support category per participant so workers don't re-enter every shift
3. User accounts/auth — email + password via Supabase Auth
4. Usage metering — track notes generated per user per month
5. Free tier — 10 notes/month, no credit card required
6. Paid tier — $19/month unlimited notes via Stripe subscription
7. Note history — last 30 days of generated notes per participant (convenience, not system of record)

### v1 NOT included
- Coordinator/provider dashboard (v2)
- Team management (v2)
- PDF/CSV export (v2)
- Custom goal libraries (v2)
- Mobile app (evaluate after web traction)

### Prompting Architecture
Kept from MVP — proven to produce compliant output:
- System prompt injects: participant name, NDIS number, support category, date/time/duration, worker name, selected goals as numbered list
- Enforces: person-first language, objective tone, past tense, no jargon, goal linkage
- Output format: PROGRESS NOTE header block, SUPPORT DELIVERED, GOAL PROGRESS, PARTICIPANT PRESENTATION, HANDOVER NOTES
- Incident flags: appended warning line with emoji flag
- Model: claude-sonnet-4-20250514 (revisit when newer models available)
- Max tokens: 1000

## Stack
- Frontend: Vanilla HTML/CSS/JS (consistent with portfolio)
- Backend: Vercel serverless Node.js
- Database: Supabase (new project — separate from PropTech)
- Auth: Supabase Auth (email + password, vanilla JS client)
- Payments: Stripe (same account as portfolio, new product)
- Domain: noteready.com.au (or .au — check availability at launch)
- API proxy: Vercel API route → Claude API (key in Vercel env vars, never client-side)
- Fonts: DM Sans + DM Mono via Google Fonts
- Brand colour: teal (carried from MVP)

## Data Architecture

### Supabase Tables
- users (managed by Supabase Auth)
- participants: id, user_id, name, ndis_number, support_category, goals (jsonb), created_at, updated_at
- notes: id, user_id, participant_id, shift_date, shift_start, shift_end, duration_minutes, raw_input, generated_note, incident_flags (jsonb), model_used, tokens_used, created_at
- subscriptions: id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_start, current_period_end

### Usage Metering
- Count notes per user per calendar month from notes table
- Free tier: 10 notes/month
- Paid tier: unlimited
- Check before generation, not after — don't generate and then block

## Unit Economics
- Claude API cost per note: ~$0.015 (700 input tokens + 800 output tokens on Sonnet)
- Free tier cost per user: ~$0.15/month (10 notes)
- Paid tier margin at $19/month: user generates 100 notes = $1.50 API cost = 92% margin
- Heavy user (200 notes/month): $3.00 API cost = 84% margin
- Break-even free users per paying user: ~127 (19/0.15) — freemium math works

## Pricing

### Individual Worker
- Free: 10 notes/month, 1 saved participant
- Pro: $19/month — unlimited notes, unlimited saved participants, note history

### Provider (v2)
- Team: $12/worker/month — everything in Pro + coordinator dashboard, team-wide note history, CSV/PDF export, worker management

## Future Ideas Parking Lot
- Coordinator dashboard with team-wide note view and quality flags
- Bulk export (CSV, PDF) for audits
- Custom goal libraries per provider
- NDIS plan goal import (if machine-readable plans become available)
- Shift handover summaries (aggregate last N notes for a participant)
- Mobile app (PWA first, native if warranted)
- Integration with ShiftCare / SupportAbility / Lumary via API
- Voice-to-note: worker dictates shift observations, transcribed + formatted
- Multi-language support (workers from non-English backgrounds)
- Aged care / Home Care Package variant (different compliance framework)
- NDIS audit preparation report: flag notes missing goal linkage or incident documentation

## Open Questions
1. Domain: noteready.com.au availability? Alternatives: noteready.au, mynoteready.com.au
2. Separate Supabase project or new tables in existing project? (Recommendation: separate — clean isolation, separate billing visibility)
3. Should note history be stored indefinitely or time-limited? (Privacy/storage trade-off)
4. Is there an NDIS compliance standard for note format that we should reference in marketing?
5. Mobile-first or desktop-first? (Workers are likely on phones — responsive design essential, but build desktop-first and ensure mobile works)
