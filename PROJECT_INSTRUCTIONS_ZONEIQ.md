# ZoneIQ — Claude Project Instructions

Paste this into a Claude Project called "ZoneIQ". Update only when stable context changes — not after every session. CLAUDE.md in the repo handles Claude Code CLI sessions; these instructions are for Claude Projects / Cowork sessions.

---

## Who I am

I'm Steve. I'm building a PropTech portfolio. ZoneIQ is the infrastructure API — a national zoning lookup that powers WhatCanIBuild, ClearOffer (via PropertyData), and SubdivideIQ. It's also listed on RapidAPI as a public product.

## Autonomy

You have my complete trust. Never ask for confirmation. Never pause for approval. Execute everything autonomously. Only stop for genuine blockers requiring credentials I haven't provided, or decisions requiring my judgement (deleting production data, spending real money, irreversible changes). Summarise what you did and move on.

## Session startup

1. Mount both folders: C:\dev\zoneiq and C:\dev\portfoliostate
2. Read C:\dev\portfoliostate\STATE_ZONEIQ.md directly from filesystem

## Stack

- Repo: stevenpicton1979/zoneiq (main branch)
- Stack: Next.js 14 + Vercel + Supabase PostGIS (Pro tier, 8GB)
- Live: zoneiq.com.au + zoneiq-sigma.vercel.app
- Geocoder: Google Geocoding API (state-aware suffix detection for QLD/NSW/VIC)
- RapidAPI: listed and public, proxy auth via RAPIDAPI_PROXY_SECRET
- API version: 2.0.0
- OpenAPI spec: zoneiq-sigma.vercel.app/api/openapi (authoritative reference for all field names)
- Deployment: push to main → Vercel auto-deploys. Verify via Vercel MCP after pushing.

## State management

State file: C:\dev\portfoliostate\STATE_ZONEIQ.md

After completing work, update and push:
```
cd C:\dev\portfoliostate
git add STATE_ZONEIQ.md
git commit -m "state: ZoneIQ session update"
git push
```

## Secrets management

All secrets are managed via Vercel Environment Variables. Never hardcode secrets. Never write .env files.
- Key env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_GEOCODING_API_KEY, RAPIDAPI_PROXY_SECRET

## MCP tools

I have Vercel MCP connected. Use it for deploying, checking deployment status, reading build/runtime logs, and managing environment configuration. If a task needs a tool I don't have connected, search the MCP registry and suggest a connector.

## Database — Supabase PostGIS

Shared Supabase project: fzykfxesznyiigoyeyed (also used by WhatCanIBuild)

Key tables and sizes:
- zone_geometries: 238,993 polygons across 84 councils (QLD SEQ + NSW Sydney + VIC Melbourne)
- zone_rules: 222 rules (brisbane 18, goldcoast 24, ipswich 56, NSW_standard 29, VIC_standard 21)
- flood_overlays: 196,403 records
- school_catchments: 2,206 (1,724 primary + 482 secondary, no council column)
- noise_overlays: 18 rows (Brisbane, Archerfield, Gold Coast, Melbourne Tullamarine, Western Sydney)
- heritage_overlays: 3,657 (State QLD + local Brisbane)
- bushfire_overlays: 132,000 (13 SEQ LGAs)
- character_overlays: 14,164 (Brisbane only)

## Downstream consumers

ZoneIQ is consumed by PropertyData, WhatCanIBuild, and ClearOffer (indirectly). Breaking changes to the API response shape require checking all consumers. Always check the OpenAPI spec before modifying field names.

## Key conventions

- Spatial queries use ST_Contains(polygon, point) with GiST index — never ST_Within(point, polygon).
- Partial responses: HTTP 200 with `rules: null` and `meta.partial: true` when zone not seeded.
- data/ directory is 1.3GB — excluded via .vercelignore (do not remove).
- DECISIONS.md in repo — read before architectural changes.
- WhatCanIBuild calls zoneiq-sigma.vercel.app NOT zoneiq.com.au (redirect issue on server-side fetch).

## Git hygiene

- Always run `git status` before committing. Only add specific files with `git add <file>`.

## Gotchas

- Gold Coast zone codes are full words not abbreviations.
- Gold Coast: ST_Transform from EPSG:28356 required.
- Moreton Bay + Sunshine Coast: ArcGIS auto-reprojects WGS84 (no ST_Transform needed).
- VIC (Vicmap): GDA94 VicGrid EPSG:3111 — ST_Transform required.
- NSW ePlanning: check CRS per layer — may need reprojection to WGS84.
- school_catchments has no council column — cannot filter by LGA.
- noise_overlays has no source column — airport name is the identifier.
- Fringe VIC/NSW councils have no zone_rules — partial responses expected.
- Google geocoder appends state suffix — state detection uses NSW/VIC/QLD keywords.
- Always use `func` not `$$` for Supabase SQL.
- Use try/catch not .catch() chaining (Supabase v2).

## Known data gaps

- Sydney Kingsford Smith ANEF: not available as open data — manual contact required.
- Essendon Airport ANEF: not in VIC Airport Environs MapServer — manual acquisition required.
- QFAO endpoint: awaiting QRA publication — update QFAO_URL when live.
- Avalon Airport: queryable layers found — not yet ingested.
