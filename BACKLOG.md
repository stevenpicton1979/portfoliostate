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

### [x] INFRA-2: Visual health dashboard
- [x] public/index.html — dark theme dashboard, auto-refreshes every 60s, calls /api/status
- [x] api/status.js — server-side product checker, returns JSON with timing + status
- [x] api/health-check.js — Vercel cron (*/30 * * * *), checks all 4 products, posts Slack alerts on down/recovery transitions via SLACK_BOT_TOKEN
- [x] vercel.json — cron config, output dir set to public
- [x] Deployed to Vercel — https://portfoliostate-status.vercel.app
- [x] Custom domain added to Vercel project (status.whatcanibuild.com.au)
- [x] SLACK_BOT_TOKEN added to Vercel env (copied from claude-listener — Doppler not configured for this project, flag for setup)
- [ ] DNS — MANUAL STEP REQUIRED: Add A record at nameserver.net.au → status.whatcanibuild.com.au → 76.76.21.21
- Note: @vercel/kv deprecated — if recovery alerts needed, connect Upstash Redis via Vercel integrations
