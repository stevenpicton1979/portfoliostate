## INFRASTRUCTURE BACKLOG

### [ ] INFRA-1: Slack bidirectional — Claude Code listens and responds autonomously

**Goal:** You message a Slack channel or DM from your phone. Claude Code sees it, executes the task, reports back to Slack. No terminal, no laptop needed.

**What's already done:**
- Slack workspace created: stevepicton-dev
- Claude app created and installed
- Bot token configured in MCP: [stored in Doppler / MCP config — do not commit]
- Team ID: T0AR18E03A7
- Slack MCP connected and posting works (one direction only)

**What's needed:**
1. Enable Socket Mode on the Slack app (api.slack.com/apps/A0ARB7YEJA0 → Socket Mode)
2. Generate an App-Level Token (starts with xapp-)
3. Create a persistent listener script that runs Claude Code as a daemon
4. Subscribe to message events in DMs and a #claude-tasks channel
5. When a message arrives, Claude Code processes it and posts the result back to Slack

**Design:**
- Create a dedicated #claude-tasks channel in stevepicton-dev workspace
- Claude Code reads the message, determines which repo it relates to, executes autonomously
- Posts result back as a reply in the same thread
- Errors posted back to Slack not lost silently

**Dependencies:**
- Socket Mode requires an App-Level Token (xapp-...)
- Persistent process — needs to run on the laptop or a server
- Consider: run as a Windows scheduled task or startup script so it survives reboots

### [ ] INFRA-2: Visual health dashboard

**Goal:** A single page showing live status of all three products — last deployment, smoke test result, any errors in the last 24h.

**Products to monitor:**
- SubdivideIQ (subdivide.whatcanibuild.com.au)
- WhatCanIBuild (whatcanibuild.com.au)
- ZoneIQ (zoneiq.com.au)

**Data sources:**
- Vercel MCP: last deployment status, build logs
- Supabase MCP: table row counts (subdivide_reports, wcib_reports)
- Simple HTTP check: ping each domain and check 200 response

**Output:** Static HTML page or React artifact — green/amber/red per product, auto-refreshes every 60 seconds.

**Note:** Can be built as a Claude Code artifact or a standalone Vercel deployment.
