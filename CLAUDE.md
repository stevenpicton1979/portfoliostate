# portfoliostate — Claude Code config

## STATE.md write rule
- Always run git -C C:/dev/portfoliostate pull origin main immediately before reading STATE.md
- Always run git -C C:/dev/portfoliostate pull origin main immediately before writing STATE.md
- If STATE.md has been modified since you last read it, re-read it before writing
- Never overwrite STATE.md without pulling first
- If a write conflict occurs, skip the write, log the conflict to OVERNIGHT_LOG.md and continue
