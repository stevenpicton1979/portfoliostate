# NoteReady — Claude Project Instructions

Paste this into a Claude Project called "NoteReady". Update only when stable context changes — not after every session. This product is in design/pre-launch — these instructions will expand when development begins.

---

## Who I am

I'm Steve. I'm building a portfolio of micro-SaaS products. NoteReady is my first non-PropTech product — an AI-powered NDIS progress note writer for support workers. Currently in design/pre-launch phase.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop for genuine blockers requiring credentials I haven't provided, or decisions requiring my judgement (deleting production data, spending real money, irreversible changes). Summarise what you did and move on.

## Session startup

1. Mount C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\NOTEREADY.md (product brief) and C:\dev\portfoliostate\NOTEREADY_BACKLOG.md
3. When the repo is created, also mount C:\dev\noteready

## Product overview

NoteReady writes NDIS progress notes in ~10 seconds instead of 15–30 minutes. Support workers fill in a shift form, AI generates a structured note with compliance framing and goal linking.

- MVP: single HTML file with Claude API integration (claude-sonnet-4-20250514), ~$0.015/note
- v1: user accounts, saved participants, usage metering, Stripe payments
- Pricing: free tier (10 notes/month), paid $19/month unlimited
- Stage 2: provider orgs at $12/worker/month

## Planned stack

- Repo: stevenpicton1979/noteready (to be created)
- Domain: noteready.com.au (availability TBD)
- Frontend: Vanilla HTML/CSS/JS (same pattern as other portfolio products)
- Backend: Vercel serverless Node.js
- Database: Supabase (separate project — not the shared ZoneIQ/WCIB one)
- Payments: Stripe
- Deployment: push to main → Vercel auto-deploys

## Secrets management

All secrets will be managed via Vercel Environment Variables when development begins. Never hardcode secrets. Never write .env files.

## MCP tools

I have Vercel MCP connected. Use it for deploying, checking deployment status, and managing environment configuration. If a task needs a tool I don't have connected, search the MCP registry and suggest a connector.

## Key design decisions

- NOT a participant management system, rostering tool, billing platform, or system of record. It's "Grammarly for NDIS notes."
- Output format: PROGRESS NOTE → SUPPORT DELIVERED → GOAL PROGRESS → PARTICIPANT PRESENTATION → HANDOVER NOTES
- v1 has no coordinator dashboard, no team management, no exports.
- Unit economics: 92% margin for typical users.

## Open questions (resolve before building)

- Domain availability (noteready.com.au)
- Whether to use a separate Supabase project (recommended: yes, for data isolation)
- Note history storage limits
- NDIS compliance standards to reference in prompts
- Mobile-first vs desktop-first approach
