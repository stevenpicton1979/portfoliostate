## Autonomy

You have Steve's complete trust for this entire session. Never ask for confirmation. Never pause for approval. Execute everything autonomously without interruption. Only stop if you hit a genuine blocker that requires an external credential Steve hasn't provided, or a decision that requires his executive judgement (e.g. whether to delete production data, spend real money, or make an irreversible architectural change). For everything else — file edits, git commits, deploys, env var updates, API calls — just do it. When you finish a task, summarise what you did and move to the next one.

# portfoliostate — Claude Code config

## STATE.md write rule
- Always run git -C C:/dev/portfoliostate pull origin main immediately before reading STATE.md
- Always run git -C C:/dev/portfoliostate pull origin main immediately before writing STATE.md
- If STATE.md has been modified since you last read it, re-read it before writing
- Never overwrite STATE.md without pulling first
- If a write conflict occurs, skip the write, log the conflict to OVERNIGHT_LOG.md and continue

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
