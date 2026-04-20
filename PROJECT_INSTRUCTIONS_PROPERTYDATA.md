# PropertyData — Claude Project Instructions

Paste this into a Claude Project called "PropertyData". Update only when stable context changes (new product dependencies, stack changes, new conventions) — not after every session. CLAUDE.md in the repo handles Claude Code CLI sessions; these instructions are for Claude Projects / Cowork sessions.

---

## Who I am

I'm Steve. I'm building a PropTech portfolio of micro-SaaS products targeting Australian property buyers. PropertyData is the data aggregation layer — a free property report for Brisbane addresses that checks 52+ data points across flood maps, planning overlays, school catchments, crime stats, and infrastructure risks.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop if you hit a genuine blocker that requires a credential I haven't provided, or a decision that requires my judgement (e.g. deleting production data, spending real money, or making an irreversible architectural change). For everything else — file edits, git commits, deploys, env var updates, API calls — just do it. Summarise what you did and move on.

## Session startup

1. Mount both folders: C:\dev\propertydata and C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\STATE_PROPERTYDATA.md directly from filesystem (do not git fetch — local copy is authoritative for interactive sessions)
3. Note the "last known good commit" in the state file — use this for recovery if things break

## Stack

- Repo: stevenpicton1979/propertydata (master branch)
- Stack: Vanilla HTML/CSS/JS + Vercel serverless Node.js
- Local dev: `vercel dev --listen 3002` (never use `npm run dev` — vercel dev pulls env vars automatically)
- Domain: www.propertyvitals.com.au
- Supabase: project fzykfxesznyiigoyeyed (shared with ZoneIQ)
- Deployment: push to master → Vercel auto-deploys. Verify via Vercel MCP after pushing.

## State management

State file: C:\dev\portfoliostate\STATE_PROPERTYDATA.md

After completing work, update the state file (including "last known good commit" if you deployed) and push:
```
cd C:\dev\portfoliostate
git add STATE_PROPERTYDATA.md
git commit -m "state: PropertyData session update"
git push
```

## ClearOffer dependency — read before changing APIs

ClearOffer consumes this API. Before modifying any response shape, field name, or endpoint, read the "Downstream dependency" section in STATE_PROPERTYDATA.md. Breaking changes require a human review note in OVERNIGHT_LOG.md before proceeding.

## Secrets management

All secrets are managed via Vercel Environment Variables. Never hardcode secrets. Never write .env files.
- To check current secrets: use Vercel MCP `list_projects` → project settings, or `vercel env ls` in terminal
- To add/change a secret: Vercel dashboard (project → Settings → Environment Variables) or `vercel env add`
- To run locally: `vercel dev --listen 3002` (pulls env vars from Vercel automatically)
- Key env vars: PROPERTYDATA_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, GOOGLE_GEOCODING_API_KEY

## MCP tools

I have Vercel MCP connected. Use it for:
- Deploying to Vercel, checking deployment status, reading build/runtime logs
- Managing projects and checking environment configuration
- Fetching content from Vercel-hosted URLs for testing

If a task needs a tool I don't have connected (e.g. Slack, Supabase, GitHub), search the MCP registry and suggest a connector rather than working around it.

## Key conventions

- Single-file frontend: everything is in public/index.html (CSS + JS + HTML). Do not split into separate files.
- CoreLogic theme is the only theme: body.theme-corelogic is permanent, no toggle. All theme-specific CSS uses `body.theme-corelogic` selector.
- Report hero: checklist summary (not score ring). Preparation Level badge driven by hazard count. See DECISIONS.md D8.
- Brisbane-only: geocoder returns BRISBANE_ONLY error for non-QLD addresses.
- PropertyVitals branding: SVG house+heartbeat logo, "PropertyVitals Planning Report" (not "Buyer's Brief", not "due diligence").
- Australian English: "Neighbourhood" only for BCC planning terms, otherwise "Suburb".
- 15 source adapters, 64+ fields, Property Score extracted to api/lib/property-score.js.
- Tests: 9 test files, 752+ tests. Run with `npm test`. CI via GitHub Actions on push/PR to master.

## Git hygiene

- Always run `git status` before committing to check what's staged. Only add specific files with `git add <file>` — never `git add .` or `git add -A`.
- After committing, record the commit hash as "last known good commit" in the state file if the deploy succeeds.

## Post-write verification (MANDATORY for public/index.html)

After any write to public/index.html, always verify:
1. `wc -l public/index.html` — must be ~1870+ lines
2. `tail -3 public/index.html` — must end with `</script>`, `</body>`, `</html>`

Windows mount sync has truncated this file at least 3 times, shipping broken sites to production. If truncated, rebuild from the last known good commit: `git show {commit}:public/index.html > /tmp/good.html`, apply changes to that, then copy back.

## Backlog & overnight builds

- BACKLOG.md in the repo root contains all tasks organised into tracks.
- Overnight builds: Claude Code reads BACKLOG.md and executes [ ] tasks autonomously when started with "overnight:" prefix.
- OVERNIGHT_LOG.md: timestamped log of what each session did.
- If OVERNIGHT_LOG.md exceeds 500 lines, rotate to OVERNIGHT_LOG_YYYY_MM.md before appending.

## Gotchas

- BCC ArcGIS CORS is blocked from browser — all queries must be server-side.
- ICSEA adapter returns `{ score, plain }` object — extract .score for numeric use.
- Infrastructure fields (hv_powerline, hv_easement, petroleum_pipeline) return objects like `{nearby: false}` — check boolean properties not object truthiness.
- Git lock files on Windows: if .git/index.lock blocks commits, delete it manually.
- Never combine `cd` and `git` in the same command.
- `data/` directory excluded from Vercel via .vercelignore.

## Other products in the portfolio (for context, not for editing)

- ZoneIQ: national zoning lookup API (zoneiq-sigma.vercel.app)
- ClearOffer: property buyer report (consumes PropertyData API)
- WhatCanIBuild: development potential calculator
- NoteReady: NDIS progress note writer (non-PropTech, in design)
- SubdivideIQ: subdivision feasibility tool (in design)

State files for other products live in C:\dev\portfoliostate but never write to them from a PropertyData session.
