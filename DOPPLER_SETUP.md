# Doppler Setup — One-time manual steps

## Step 1: Create Doppler account
Go to https://doppler.com and sign up with your Google account.

## Step 2: Install Doppler CLI
Run in terminal: (winget install Doppler.doppler) or download from https://docs.doppler.com/docs/install-cli

## Step 3: Create Doppler projects
In the Doppler dashboard, create one project for each product:
- subdivideiq
- whatcanibuild  
- zoneiq
- clearoffer (for future use)

For each project, Doppler creates dev/staging/production configs automatically.

## Step 4: Add secrets to each Doppler project
In the Doppler dashboard for each project, add the secrets currently in Vercel env vars.
Use these as the source of truth going forward — never set secrets in Vercel directly again.

Current secrets per project (populate from Vercel dashboard or .env.local files):
- SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_KEY / SUPABASE_SERVICE_ROLE_KEY  
- SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- MAPBOX_TOKEN (subdivideiq, whatcanibuild)
- RAPIDAPI_PROXY_SECRET (zoneiq)
- DATABASE_URL
- BASE_URL / ALLOWED_ORIGIN

## Step 5: Connect Doppler to Vercel
In each Doppler project: Integrations → Vercel → Authorize → select matching Vercel project → Setup Integration
Do this for Production, Preview, and Development environments separately.

## Step 6: Verify sync
After connecting, Doppler secrets should appear in Vercel env vars automatically.
Test by triggering a redeploy and confirming the app works.

## Step 7: Install Doppler CLI and authenticate
doppler login
doppler setup (run in each repo directory, select matching project)

## Going forward
- To add/change a secret: update in Doppler dashboard → auto-syncs to Vercel
- To run locally with secrets: doppler run -- npm run dev
- Claude Code can manage Doppler secrets once CLI is authenticated
