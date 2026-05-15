# Deploy Instructions

The sandbox cannot reach the Vercel API or the npm registry, so this deploy must run from your Mac.

## One command

Open Terminal and run:

```bash
cd ~/Downloads/portfolio-hub && bash DEPLOY.sh
```

That script runs `npx tsc --noEmit` first, then ships to production via the Vercel CLI. The project is already linked (`.vercel/project.json`).

## What is in this deploy

1. New bento grid hero on the homepage (asymmetric 6 column grid with 9 tiles).
2. Live demo pills on every project tile that has a Vercel deploy. Reads "Live demo · No signup" with a small green dot prefix.
3. New `/sandbox` page that lists every demo grouped by category. Top tagline: "Click any link below. No signup. No API keys needed. The keys are already set."
4. New top nav across every page. Order is Sandbox, Play, Resume, Contact.
5. Forest green secondary accent on the "Currently shipping" tile.
6. Framer Motion staggered fade in on the bento, scroll reveals on the project grid.

## After deploy

Open the production URL printed at the bottom of the terminal. Verify:

- Homepage shows the bento grid with the 3 featured project tiles each carrying a "Live demo · No signup" pill.
- Top nav shows Sandbox.
- `/sandbox` shows 5 categories with all live demo links opening in a new tab.

If anything renders wrong, run `npm run dev` locally first to debug before redeploying.
