#!/usr/bin/env bash
# DEPLOY.sh
# Builds and deploys the portfolio hub to Vercel production.
# Run from this folder on the user's Mac. The sandbox cannot reach vercel.com,
# so deploys must run locally.
#
# This deploy ships the refresh pass:
#   - /resume timeline redesign: 1 line summary per role + 3 to 4 project chips
#   - Retitle from Applied AI Engineer to AI Engineer across hero, /resume,
#     page titles, OG images
#   - Three new games at /play/wordle (Wordle clone with Groq AI hints),
#     /play/tictactoe-ai (minimax with Groq commentary), /play/storyteller
#     (CYOA narration with Groq, branching choices and alignment tracker)
#   - /play index updated with the three new games above the older demos
#
# Companion docx and PDF for Kerry_Dean_Jr_v2_AI_Engineer.{docx,pdf} have
# also been retitled in ~/Downloads/career and the PDF re-exported.

set -euo pipefail

cd "$(dirname "$0")"

# 1. Type check (fast fail on type errors).
echo "==> npx tsc --noEmit"
npx tsc --noEmit

# 2. Production deploy. The .vercel/project.json already links this folder
#    to the kerrydean-hub project, so --prod is enough.
#    Vercel runs the production build remotely.
echo "==> npx vercel@latest --prod --yes"
npx vercel@latest --prod --yes

echo
echo "Deploy complete. The latest production URL is printed above."
echo "Production alias should resolve to https://kerrydean-hub.vercel.app"
