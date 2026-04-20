# ClearOffer — Claude Project Instructions

Paste this into a Claude Project called "ClearOffer". Update only when stable context changes — not after every session. CLAUDE.md in the repo handles Claude Code CLI sessions; these instructions are for Claude Projects / Cowork sessions.

---

## Who I am

I'm Steve. I'm building a PropTech portfolio of micro-SaaS products. ClearOffer is the consumer-facing property report product — a free Scout Report and a paid $149 Buyer's Brief for Australian property buyers.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop for genuine blockers requiring credentials I haven't provided, or decisions requiring my judgement (deleting production data, spending real money, irreversible architectural changes). Summarise what you did and move on.

## Session startup

1. Mount both folders: C:\dev\buyerside and C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\STATE_CLEAROFFER.md directly from filesystem

## Stack

- Repo: stevenpicton1979/buyerside (main branch — not master)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Local dev: `vercel dev --listen 3001` (never use npm run dev)
- Domain: clearoffer.com.au
- Supabase: project dqzqqfcepsqhaxovneen (tables: scout_reports, suburb_stats_cache)
- Stripe: currently in test mode, awaiting launch signal to go live
- COMING_SOON env var: controls whether site shows coming-soon page (true) or live app (false). Currently true on all environments.
- Deployment: push to main → Vercel auto-deploys. Verify via Vercel MCP after pushing.

## State management

State file: C:\dev\portfoliostate\STATE_CLEAROFFER.md

After completing work, update and push:
```
cd C:\dev\portfoliostate
git add STATE_CLEAROFFER.md
git commit -m "state: ClearOffer session update"
git push
```

## PropertyData dependency — critical

ClearOffer does NOT call BCC/ZoneIQ/ICSEA directly. All data comes via PropertyData API (`POST /api/lookup`). The field mapping contract is documented in STATE_CLEAROFFER.md and DATA_SOURCES_v2.md (shared contract in portfoliostate repo).

Before changing how ClearOffer consumes PropertyData fields, read the dependency section in both STATE_CLEAROFFER.md and STATE_PROPERTYDATA.md.

## Secrets management

All secrets are managed via Vercel Environment Variables. Never hardcode secrets. Never write .env files.
- To run locally: `vercel dev --listen 3001` (pulls env vars from Vercel automatically)
- Key env vars: PROPERTYDATA_URL, PROPERTYDATA_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, COMING_SOON

## MCP tools

I have Vercel MCP connected. Use it for deploying, checking deployment status, reading build/runtime logs, and managing environment configuration. If a task needs a tool I don't have connected, search the MCP registry and suggest a connector.

## Key conventions

- All user-visible strings centralised in two config files for easy rebranding.
- 26 files: 11 API routes, 5 HTML pages, config files.
- Free Scout Report costs ~$0.15/lookup (overlays, suburb stats, AVM teaser).
- Paid Buyer's Brief ($149) uses Claude Sonnet for analysis with offer recommendations.

## Git hygiene

- Always run `git status` before committing. Only add specific files with `git add <file>`.
- buyerside repo uses `main` branch, not master.

## Gotchas

- Google Places API must be explicitly enabled on the GCP project.
- Verdict prompt occasionally generates meta text when listing unavailable data — watch for this in Buyer's Brief output.
- Never use npm run dev — use `vercel dev --listen 3001`.
