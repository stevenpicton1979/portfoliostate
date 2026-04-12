## Autonomy

You have Steve's complete trust for this entire session. Never ask for confirmation. Never pause for approval. Execute everything autonomously without interruption. Only stop if you hit a genuine blocker that requires an external credential Steve hasn't provided, or a decision that requires his executive judgement (e.g. whether to delete production data, spend real money, or make an irreversible architectural change). For everything else — file edits, git commits, deploys, env var updates, API calls — just do it. When you finish a task, summarise what you did and move to the next one.

# portfoliostate — Claude Code config

## State management — mandatory protocol

STATE.md is deprecated. Do not read or write it.

Per-product state files:
- PropertyData  → STATE_PROPERTYDATA.md
- ZoneIQ        → STATE_ZONEIQ.md
- ClearOffer    → STATE_CLEAROFFER.md
- WhatCanIBuild → STATE_WHATCANIBUILD.md
- Portfolio     → STATE_PORTFOLIO.md (human-written only, do not write)

Before reading ANY state file:
  git -C C:\dev\portfoliostate fetch origin
  git -C C:\dev\portfoliostate reset --hard origin/main

This is mandatory. Never skip it. It takes 2 seconds and prevents acting on stale state.

When writing state at session end:
  cd C:\dev\portfoliostate
  git add STATE_[PRODUCT].md
  git commit -m "state: [product] session update [date]"
  git push

Only write to your own product's state file. Never touch another product's file.

## Cross-product dependency

PropertyData and ClearOffer have a live data dependency. See STATE_PROPERTYDATA.md
and STATE_CLEAROFFER.md for the contract and guardrails. Any agent working on either
product must read the dependency section of their state file before making changes
to APIs, response shapes, or field definitions.

## Log rotation

If OVERNIGHT_LOG.md exceeds 500 lines, before appending:
  - Rename OVERNIGHT_LOG.md to OVERNIGHT_LOG_YYYY_MM.md
  - Create a fresh empty OVERNIGHT_LOG.md
  - Then append the current session entry

## Secrets management
All secrets are managed via Vercel Environment Variables. Never hardcode secrets, never write secrets to .env files.
- To add/change a secret: update in Vercel dashboard (project → Settings → Environment Variables) or use `vercel env add`
- To run locally: `vercel dev` (pulls env vars from Vercel project automatically)
- To check current secrets: `vercel env ls`
- MCP tools can also interact with Vercel if available

## /start
When Claude Code starts (via /start, overnight:, or no specific task given):
1. Read BACKLOG.md
2. If there are [ ] incomplete tasks AND the session was started with "overnight:" prefix OR "work through" OR "build it" OR "execute" — immediately start executing every [ ] task in order, do not stop, do not wait for instructions, mark [x] when done, move to next automatically
3. If started with no clear instruction — list incomplete tasks and wait
4. Always create or append to OVERNIGHT_LOG.md with timestamped entries
5. Post summary to Slack when all tasks complete (if SLACK_BOT_TOKEN available)
