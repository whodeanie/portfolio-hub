# Admin analytics setup

This portfolio runs two complementary free analytics tools and a private dashboard at `/admin/analytics`. Follow the checklist below once. Total time: about fifteen minutes.

## What you are getting

1. **Vercel Analytics** for the basics: pageviews, top pages, devices, countries. Built into Vercel hobby tier, no key needed beyond turning it on.
2. **PostHog** for the rich stuff: session replay, custom events, funnels, cohorts. Free for the first 1 million events per month. Way more than this site will use.
3. **Private dashboard** at `https://kerrydean-hub.vercel.app/admin/analytics`, gated by password. Reads from PostHog server side so the API key never reaches the browser.
4. **UTM share helper** at `/admin/share`. Paste a recipient name, get a tagged URL like `?utm_source=resume&utm_medium=email&utm_campaign=anthropic-rovi-hiring`. Use this URL when emailing your resume so each click is attributed.

## One time setup

### Step 1. Create a PostHog account

1. Go to `https://posthog.com` and sign up. Pick the **United States** region during onboarding (`us.i.posthog.com`). If you pick EU instead, set `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` in step 4 below.
2. Create a project named **kerrydean-hub**.
3. Skip the in app product walkthrough. You will instrument the site from this repo, not from their snippet wizard.

### Step 2. Grab the project key (client side)

1. In PostHog, click your profile, then **Project settings**.
2. Find **Project API key**. It looks like `phc_XXXXXXXXXX`.
3. Copy it. You will paste it into Vercel in step 4.

This is a public, write only key. It only sends events, it cannot read.

### Step 3. Create a personal API key (server side, for the dashboard)

1. In PostHog, click your profile, then **Personal API keys**.
2. Click **Create personal API key**.
3. Name it `kerrydean-hub dashboard`.
4. Under scopes, grant:
   - `query:read` (so the dashboard can run HogQL queries)
   - `project:read` (so the dashboard can resolve the project id automatically)
5. Save and copy the key. It looks like `phx_XXXXXXXXXX`. You will not see it again.

### Step 4. Set Vercel environment variables

In the Vercel project for `kerrydean-hub`, go to **Settings, Environment variables** and add the following for the Production, Preview, and Development environments.

| Name | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` | step 2 |
| `POSTHOG_API_KEY` | `phx_...` | step 3 |
| `ADMIN_PASSWORD` | a strong password you will remember | invent it |

Optional but recommended:

| Name | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | Explicit. Default is US. Use `https://eu.i.posthog.com` if you picked EU. |
| `POSTHOG_PROJECT_ID` | the numeric id from PostHog project settings URL | Saves one round trip. Optional, the server resolves it automatically if absent. |

Click **Save** for each, then **Redeploy** the project. The new env vars only take effect on a fresh deploy.

### Step 5. Turn on Vercel Analytics

1. In the Vercel project, open the **Analytics** tab.
2. Click **Enable** on the hobby tier (free).
3. That is it. The `@vercel/analytics` script is already imported in `app/layout.tsx`, so the moment Vercel turns on analytics for the project, pageviews start landing in the Vercel UI.

### Step 6. Confirm session replay is on

1. In PostHog, open **Settings, Session replay**.
2. Toggle **Record sessions** to on.
3. PostHog's free tier samples session replays automatically. You do not need to enable a feature flag, but you can configure a sample rate. Default is fine.

### Step 7. Log in to the dashboard

1. Visit `https://kerrydean-hub.vercel.app/admin/analytics`.
2. You will be redirected to `/admin/login`.
3. Enter the password you set in `ADMIN_PASSWORD`.
4. The dashboard loads. The first time, panels will say "No data yet" because PostHog has not seen any events. Visit the homepage in a private window, click around, then refresh the dashboard. Events should appear within a few seconds.

## What the dashboard shows

- **KPI summary row** at the top: visits, unique visitors, resume PDF clicks, contact submits, each with percent change against the prior matching window.
- Pageviews over time, last 7 or 30 days (line chart, switch via the range links).
- Conversion: percent of resume PDF viewers who also submitted the contact form.
- **Campaign attribution table** showing every visit that arrived with `utm_campaign`, `utm_source`, or `utm_medium`. This is where the links you build in `/admin/share` show up. One row per (campaign, source, medium) combo with visits and unique visitor counts.
- Top pages and top referrers, bar lists.
- Country plus city table.
- Device breakdown.
- Counts for the custom events: `resume_pdf_clicked`, `project_card_clicked`, `contact_form_submitted`, `github_link_clicked`, `external_link_clicked`.
- Project card click breakdown by project title.
- Recent twenty sessions, each annotated with the first referrer or utm_campaign that brought the visitor, plus a "Watch" link straight to PostHog session replay.

## Using the UTM helper

1. Visit `/admin/share`.
2. Pick a **quick template**: Resume email, LinkedIn DM, LinkedIn post, cold outreach, X DM, referral, or GitHub README. Each one sets sensible `utm_source` and `utm_medium` so you do not have to think about it.
3. Paste the base URL (defaults to the homepage).
4. Enter a recipient nickname like `anthropic-rovi-hiring` or `meta-genai-recruiter`. The `utm_campaign` auto fills from the recipient slug, or you can override it.
5. Click **Generate**. Copy the tagged URL. Paste it into your resume email or DM.
6. The recipient list is stored in your browser, not on a server, so it is private to whichever device you generate links on.
7. When that recipient clicks, PostHog records `utm_source`, `utm_medium`, and `utm_campaign` as event properties. The **Campaign attribution** card on the dashboard surfaces them directly, with visits and unique visitors per (campaign, source, medium). Recent sessions also tag the badge with the campaign name so you can spot the right visitor before clicking "Watch".

## Graceful degradation

If any env var is missing the site still works. The client side analytics call becomes a no op when `NEXT_PUBLIC_POSTHOG_KEY` is empty. The dashboard renders a "PostHog not configured" panel when `POSTHOG_API_KEY` is empty. The admin login returns 503 when `ADMIN_PASSWORD` is empty. So you can deploy this code before setting any of the env vars and ship the rest of the site without breakage.

## Commit and deploy from your Mac

The sandbox that produced these files cannot commit on your behalf. From a terminal:

```bash
cd ~/Downloads/portfolio-hub
git add -A
git commit -m "feat: analytics, private dashboard, UTM share helper"

# If you have not yet pointed the repo at GitHub:
git remote add origin https://github.com/whodeanie/portfolio-hub.git
git push -u origin master

# Then ship to Vercel (after you have set the three env vars):
bash DEPLOY.sh
```

If `git push` is blocked by a stale `.git/index.lock`, run `rm .git/index.lock` first and try again. The sandbox could not remove it because of file ownership.

## Files added

- `lib/analytics.ts` client side PostHog wrapper, `useAnalytics` hook
- `lib/posthog-server.ts` server side PostHog REST client
- `lib/admin-auth.ts` signed cookie helpers
- `components/AnalyticsProvider.tsx` mounts PostHog + emits pageviews
- `components/TrackedLink.tsx` reusable tracked anchor for server components
- `middleware.ts` gates `/admin/*` behind a signed cookie
- `app/admin/login/` login page + form
- `app/admin/analytics/` server rendered dashboard with widgets
- `app/admin/share/` UTM share helper
- `app/admin/api/login/route.ts` POST handler to set the admin cookie
- `app/admin/api/logout/route.ts` POST handler to clear it

## Files changed

- `app/layout.tsx` mounts `<VercelAnalytics />` and `<AnalyticsProvider />`
- `app/resume/page.tsx` resume PDF, GitHub, LinkedIn links wrapped in `<TrackedLink>`
- `app/contact/page.tsx` fires `contact_form_submitted` on successful send
- `components/ProjectGrid.tsx` fires `project_card_clicked` on every card click
- `components/BentoHero.tsx` fires `project_card_clicked` on featured tile clicks
- `package.json` adds `@vercel/analytics`, `posthog-js`, `recharts`, `jose`
