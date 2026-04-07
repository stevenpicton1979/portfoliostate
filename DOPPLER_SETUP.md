# Secret Management — Decision Record

## Decision: Vercel MCP + Claude Code (not Doppler)

Date: 7 April 2026

Doppler was evaluated but rejected in favour of using the Vercel MCP directly via Claude Code.

## Why

- Vercel MCP can read and write env vars across all projects autonomously
- Claude Code handles secret rotation, gap-filling, and auditing without manual CLI steps
- Free at any scale — no per-project limits
- Already set up and tested

## How to manage secrets going forward

Tell Claude Code what you need in plain English:
- "Add X to the Preview environment for subdivideiq"
- "Rotate the Supabase service key across all three projects"
- "List all env vars missing from Preview in whatcanibuild"

Claude Code handles it via Vercel MCP. You never touch vercel env add again.

## What Doppler would have added (not needed)

- Audit trail (Vercel provides this in dashboard)
- Auto-redeploy on secret change (can be done via Vercel deploy hooks)
- Cross-project secret referencing (not needed — projects are independent)
