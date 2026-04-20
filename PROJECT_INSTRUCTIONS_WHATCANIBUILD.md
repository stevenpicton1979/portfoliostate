# WhatCanIBuild — Claude Project Instructions

Paste this into a Claude Project called "WhatCanIBuild". Update only when stable context changes — not after every session. CLAUDE.md in the repo handles Claude Code CLI sessions; these instructions are for Claude Projects / Cowork sessions.

---

## Who I am

I'm Steve. I'm building a PropTech portfolio. WhatCanIBuild is a launched product — a development potential calculator that tells property buyers/developers what they can build on a lot. It's live and taking payments.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop for genuine blockers requiring credentials I haven't provided, or decisions requiring my judgement (deleting production data, spending real money, irreversible changes). Summarise what you did and move on.

## Session startup

1. Mount both folders: C:\dev\whatcanibuild and C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\STATE_WHATCANIBUILD.md directly from filesystem

## Stack

- Repo: stevenpicton1979/whatcanibuild
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Live: whatcanibuild.com.au
- Stripe: LIVE mode, $19.99 AUD, webhook on checkout.session.completed
- Supabase: fzykfxesznyiigoyeyed (shared with ZoneIQ), table: wcib_reports
- Email: sending from hello@clearoffer.com.au via Resend (temporary)
- Deployment: push to main → Vercel auto-deploys. Verify via Vercel MCP after pushing.

## State management

State file: C:\dev\portfoliostate\STATE_WHATCANIBUILD.md

After completing work, update and push:
```
cd C:\dev\portfoliostate
git add STATE_WHATCANIBUILD.md
git commit -m "state: WhatCanIBuild session update"
git push
```

## Secrets management

All secrets are managed via Vercel Environment Variables. Never hardcode secrets. Never write .env files.
- Key env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

## MCP tools

I have Vercel MCP connected. Use it for deploying, checking deployment status, reading build/runtime logs, and managing environment configuration. If a task needs a tool I don't have connected, search the MCP registry and suggest a connector.

## ZoneIQ dependency

All zoning data comes from ZoneIQ. The API URL must be `zoneiq-sigma.vercel.app` NOT `zoneiq.com.au` (redirect issue on server-side fetch). If ZoneIQ field names change, WhatCanIBuild will break — check the OpenAPI spec at zoneiq-sigma.vercel.app/api/openapi before making changes.

## Git hygiene

- Always run `git status` before committing. Only add specific files with `git add <file>`.

## Gotchas

- Stripe is in LIVE mode — real money. Be careful with webhook and checkout changes.
- Email domain is borrowed from ClearOffer (temporary).
- Supabase shared with ZoneIQ — don't touch ZoneIQ tables.
