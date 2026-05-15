# Vercel environment variables Kerry needs to set

This file lists the exact environment variables that need to be present on
each Vercel project for full functionality. Open each project in the Vercel
dashboard, go to Settings, Environment Variables, and add the listed keys.
Scope each one to Production and Preview unless noted otherwise. Trigger a
fresh deploy (Deployments tab, redeploy the most recent build) after saving.

## kerrydean-hub

This is the portfolio site at kerrydean-hub.vercel.app.

| Variable | Where to get it | Why it matters |
| --- | --- | --- |
| `GROQ_API_KEY` | console.groq.com, API Keys, create one. Use the same value Kerry already set on the quant-signal-engine project. | Powers every AI feature on /coach (workouts, technique, Ask Kerry) and /play (storyteller, sports trivia, wordle hints, tic tac toe commentary) via the server side /api/groq/chat route. Without this all six features fall back to the example output added in this commit. |
| `POSTHOG_API_KEY` | app.posthog.com, Project Settings, Project API Key (the server side write key). | Server side analytics events emitted from API routes. Optional, but the project capture wrappers in lib/posthog-server.ts read this. |
| `NEXT_PUBLIC_POSTHOG_KEY` | app.posthog.com, Project Settings, Project API Key (same project, but the public ingestion key). | Client side PostHog SDK loads. Project card click, link click, and case study read events live or die based on this. |
| `ADMIN_PASSWORD` | A strong value Kerry generates. Store it in a password manager. | Gates the /admin routes that view analytics. The lib/admin-auth.ts middleware compares against this on every admin page request. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | web3forms.com, the access key from the new form Kerry created for the portfolio contact form. | The /contact form posts here. Without it the contact page submit silently fails. |

## nba-playoff-props

This is the nba-playoff-props.vercel.app project. The audit said the home
renders but "tonight" shows 0 games and /accuracy returns Not found. Both
symptoms point at a missing odds key.

| Variable | Where to get it | Why it matters |
| --- | --- | --- |
| `ODDS_API_KEY` | the-odds-api.com, sign in, copy the API key from the dashboard. Free tier covers a few thousand requests per month, which is enough for this cron schedule. | The Vercel cron that refreshes player props every 30 minutes hits the Odds API. Without this key the cron writes an empty slate and the home page shows 0 games. |

## episode-takes

This is the episode-takes.vercel.app project. The audit reported the banner
literally tells the visitor that two env vars are missing.

| Variable | Where to get it | Why it matters |
| --- | --- | --- |
| `TMDB_API_KEY` | themoviedb.org, account, API, request a v3 key. Free for non commercial use. | Unlocks real catalog search. Without it the banner says "Demo mode is on because no TMDB key is configured." |
| `GROQ_API_KEY` | console.groq.com, same key used for kerrydean-hub. | Powers the AI take polisher button, the season retrospective generator, the spoiler classifier, and the recommender. Without it the polish button says "AI is offline. Set GROQ_API_KEY to enable polish." |

## Sanity check after setting the keys

Run these end to end after the redeploys finish:

1. Open kerrydean-hub.vercel.app/coach#workouts. Pick Long Jump, College, Specific Prep, 5 days. Click Generate. Within ten seconds a four week block should render with concrete sets, reps, and intensities. If the example output banner shows up, the GROQ_API_KEY is still not picked up by the new deploy.
2. Open kerrydean-hub.vercel.app/play/sports-trivia. Pick NBA. Within a few seconds you should see ten questions queued and a six second timer. If the orange "AI offline, baked pack" banner shows up, the GROQ_API_KEY is still missing.
3. Open nba-playoff-props.vercel.app. The tonight slate should populate.
4. Open episode-takes.vercel.app. The TMDB demo mode banner should be gone.

## Rotate the GROQ key periodically

The same GROQ_API_KEY is in use across three Vercel projects (kerrydean-hub,
quant-signal-engine, episode-takes). Rotate it every 90 days, update all
three projects at once, and redeploy each. Keep one previous key valid for an
hour during rotation so in flight requests do not 401.
