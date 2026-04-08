## INFRASTRUCTURE BACKLOG

### [x] INFRA-1: Slack bidirectional — Claude Code listens and responds autonomously

**Goal:** You message a Slack channel or DM from your phone. Claude Code sees it, executes the task, reports back to Slack. No terminal, no laptop needed.

**Progress:**
- [x] Socket Mode enabled
- [x] xapp- token generated and stored in .claude.json
- [x] Event subscriptions configured (message.im, message.channels)
- [x] #claude-tasks channel created
- [x] Listener script built and connected (C:/dev/claude-listener)
- [x] Interrupt auto-responder added (7/7 tests passed)
- [x] Install Task Scheduler task (task-scheduler.xml ready, not yet installed)
- [x] End-to-end test from phone

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
