# Sandbox Feature Build Status

Date: May 7, 2026

## Summary

Successfully added sandbox feature to portfolio site. Three main additions:

1. **SandboxPill Component** (components/SandboxPill.tsx) - Badge showing "Live demo · No signup" or "Play in browser" with green dot indicator
2. **Updated ProjectGrid** (components/ProjectGrid.tsx) - Added hasLiveDemo field to 7 projects, pills render conditionally
3. **Updated BentoHero** (components/BentoHero.tsx) - Added pills to featured project tiles
4. **New /sandbox Page** (app/sandbox/page.tsx) - Landing page grouping all demos by category

## Build Status

TypeScript: PASSED (npx tsc --noEmit)
Full build: Requires local execution (timeout constraints in sandbox environment)

## Files Modified

- `components/SandboxPill.tsx` (NEW)
  - React client component
  - Props: kind = "demo" | "game"
  - Styling: Cream bg (#F5EFE0), copper border and text (#B87333), forest green dot (#3D5A4E)
  - Font: JetBrains Mono 11-12px

- `components/ProjectGrid.tsx` (MODIFIED)
  - Added hasLiveDemo field to Project type
  - Added import for SandboxPill
  - Updated 7 projects with hasLiveDemo: true
  - Updated URLs for projects (nba-dfs-optimizer, episode-takes, ai-sports-content-engine, kelly-bankroll-sizer)
  - Added relative positioning to article wrapper for pill positioning
  - Conditional SandboxPill render on line 495

- `components/BentoHero.tsx` (MODIFIED)
  - Added import for SandboxPill
  - Added hasLiveDemo field to FEATURED_PROJECTS
  - Conditional SandboxPill render for featured tiles

- `app/sandbox/page.tsx` (NEW)
  - Page component with metadata
  - Organizes 11 live demos into 5 categories
  - Consistent styling: cream backgrounds, copper accents
  - Footer CTAs to GitHub and case studies

## Demos Included

**Sports and Betting Analytics (5)**
- NBA Playoff Props (https://nba-playoff-props.vercel.app)
- NBA DFS Optimizer (https://nba-dfs-optimizer.vercel.app)
- Kelly Bankroll Sizer (https://kelly-bankroll-sizer.vercel.app)
- Polymarket Helper (https://polymarket-helper-rosy.vercel.app)
- Episode Takes (https://episode-takes.vercel.app)

**Fintech (1)**
- Quant Signal Engine (https://quant-signal-engine.vercel.app)

**Media and Entertainment (1)**
- AI Sports Content Engine (https://ai-sports-content-engine.vercel.app)

**AI Engineering Demos (1)**
- MCP RAG Starter (/work/mcp-rag-starter)

**Browser Games (3)**
- Wordle Clone (/play/wordle/)
- Tic Tac Toe (/play/tictactoe-ai/)
- Storyteller (/play/storyteller/)

## Design Adherence

- Warm cream (#F5EFE0) and copper (#B87333) palette maintained
- Forest green (#3D5A4E) secondary accent used for pill dot indicator
- No em dashes, en dashes, or hyphens as sentence breaks (all prose uses periods, commas, "and", "to")
- Middle dot (·, U+00B7) correctly used in "Live demo · No signup"
- Existing functionality preserved

## Next Steps

1. Run local build: `cd ~/Downloads/portfolio-hub && npx next build`
2. Deploy: `bash DEPLOY.sh`
3. Verify:
   - Home page pills visible on featured projects
   - ProjectGrid pills visible on all projects with hasLiveDemo
   - /sandbox page loads and all links work
   - No broken navigation

## Notes

- Build times out in sandbox environment (45s limit), but TypeScript validation passes
- All code ready for deployment
- No external APIs or dependencies added
- Backward compatible with existing site
