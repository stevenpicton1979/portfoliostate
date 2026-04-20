# SubdivideIQ — Claude Project Instructions

Paste this into a Claude Project called "SubdivideIQ". Update only when stable context changes. This product is in design — these instructions will expand when development begins.

---

## Who I am

I'm Steve. I'm building a PropTech portfolio. SubdivideIQ is a subdivision feasibility tool — it answers the $5,000–$15,000 question ("can I subdivide this lot?") for $49–99 before anyone spends a dollar. Born from my own painful experience trying to subdivide in Carindale.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop for genuine blockers requiring credentials I haven't provided, or decisions requiring my judgement (deleting production data, spending real money, irreversible changes). Summarise what you did and move on.

## Session startup

1. Mount C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\SUBDIVIDEIQ.md (product brief), SUBDIVIDEIQ_BACKLOG.md, and SUBDIVIDEIQ_DATA_SOURCES.md
3. When the repo is created, also mount C:\dev\subdivideiq

## Product overview

Pre-screen intelligence tool for homeowners considering subdivision. Delivers a traffic light feasibility report in under 60 seconds, surfacing the constraints that consultants either don't tell you upfront or charge thousands to discover.

- NOT a replacement for hydraulics reports, cadastral surveys, or town planners
- IS: "a pre-purchase building inspection vs a structural engineering report" — tells you whether to bother paying the engineer
- Value prop: "We check what town planners don't tell you upfront — and what it'll actually cost you to find out."

## Planned stack

- Repo: stevenpicton1979/subdivideiq (to be created)
- Domain: TBD — will buy at launch
- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel serverless Node.js
- Data: ZoneIQ API for zoning + overlays, PropertyData for flood/bushfire/infrastructure
- Payments: Stripe ($49–99 per report)
- Deployment: push to main → Vercel auto-deploys

## Secrets management

All secrets will be managed via Vercel Environment Variables when development begins. Never hardcode secrets. Never write .env files.

## MCP tools

I have Vercel MCP connected. If a task needs a tool I don't have connected, search the MCP registry and suggest a connector.

## Dependencies

- ZoneIQ: zone rules, minimum lot sizes, setbacks, site cover (zoneiq-sigma.vercel.app)
- PropertyData: flood overlays, bushfire, landslide, infrastructure constraints
- Both APIs must be stable before SubdivideIQ can launch. Track 4 in the PropertyData backlog (Planning Intelligence) has significant overlap — coordinate.

## Relationship to PropertyData Track 4

PropertyData Track 4 (Planning Intelligence, $39–49) covers zone rule codification and development potential calculation. SubdivideIQ is specifically subdivision-focused and priced higher ($49–99) for the deeper analysis. They share the zone rules database but serve different use cases. Design them together to avoid duplication.
