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
- Deploy a status page to Vercel from the portfoliostate repo
- Stack: single HTML file with vanilla JS, auto-refreshes every 60s
- Checks every 30 minutes via Vercel cron job (api/health-check.js)
- Products to monitor:
  - WhatCanIBuild: https://whatcanibuild.com.au
  - ZoneIQ: https://zoneiq.com.au
  - ClearOffer: https://clearoffer.com.au
  - SubdivideIQ: https://subdivide.whatcanibuild.com.au
- Each product shows: green (200 response), amber (slow >3s), red (error/timeout)
- When any product goes red: post alert to #claude-alerts Slack channel via SLACK_BOT_TOKEN
- Alert format: "🚨 [product] is down — [timestamp]"
- Recovery alert when it comes back up: "✅ [product] is back up — [timestamp]"
- Dashboard URL: status.whatcanibuild.com.au (subdomain of whatcanibuild.com.au)
