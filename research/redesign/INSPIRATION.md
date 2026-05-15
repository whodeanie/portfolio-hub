# Portfolio Redesign Inspiration

Research conducted May 2026. Sites analyzed for visual language patterns.

## Key Design Moves Identified

1. **Bento Grid Hero Layout**: emilkowal.ski and maxbo.me use asymmetric CSS Grid layouts above the fold, combining large identity tiles with smaller project/skill tiles. This creates visual hierarchy and breaks up monotony. Kerry's current design is a linear vertical stack.

2. **Mixed Tile Sizes and Asymmetry**: andre.gg and rauno.me use grid-template-areas with varied column/row spans (some tiles 2x2, others 1x1, some 2x1). This creates a more dynamic rhythm than equal-sized cards.

3. **Headshot as Large Tile Asset**: leerob.io and cassidoo.co make the headshot a prominent grid tile (often 200x200px or larger) that anchors identity, rather than a small ring in a prose block. It becomes a visual focal point.

4. **Typography Contrast with Italic Accents**: leerob.io uses large serif headlines (80px+) with tighter letter-spacing (-0.02em) and pulls "Engineer" or "Builder" into italics to create subtle visual rhythm. rauno.me does similar with role lines.

5. **Secondary Color Accent**: andre.gg introduces a second accent color (forest green) used sparingly on 1-2 elements per page. Current palette (cream + copper) is warm but monochromatic. Adding green creates visual depth without cacophony.

6. **Live Data Tile**: Some sites (emilkowal.ski, leerob.io examples in wild) pull live GitHub stats (commits, PRs, followers) into a small tile above the fold. Creates sense of "this is actively maintained."

7. **Screenshot Previews in Grid**: cassidoo.co embeds real project screenshots in project grid tiles (not just titles). Creates visual proof and breaks up text monotony. Current portfolio links out rather than showing.

8. **Hover State Elevation**: Multiple sites (rauno.me, andre.gg) lift tiles 2-4px on hover with copper/accent border appearing. 200ms ease-out. Current site uses border-color transition only.

9. **Tile Border Variation**: Rather than uniform borders, some tiles have subtle background color shifts (cream #FAF6EE, off-white #F5EFE0, warmer #EFE7D2). Creates cohesion through tone rather than harsh borders.

10. **Serif in Hero, Mono in Meta**: All reference sites use serif for display text (headlines, pitch) and monospace for small caps labels (timestamps, section headers, tech stack). Kerry's current site does this correctly. Keep it.

11. **"Currently Shipping" Emphasis**: emilkowal.ski and others highlight what's actively shipping (live revenue, deployed projects). Creates momentum signal. Kerry has products but they are buried below the fold.

12. **Micro-interaction on Scroll**: rauno.me and leerob.io use subtle fade-in or slide-up on scroll reveal for the project grid below the fold. Not distracting, but adds life. framer-motion handles this cleanly.

## Recommended Direction for Kerry's Redesign

Implement a bento grid hero combining:
- Large identity tile (headshot + name + role in serif, overlaid at bottom)
- Medium pitch tile (one-sentence value prop)
- Small "Currently shipping" tile with live commit count (forest green background)
- Three featured project tiles with real screenshots
- Small tech stack tile (monospace, middle-dot separated)
- Small contact CTA tile (copper accent)
- Small play link tile

Below the fold: existing project grid (add hover lift + scroll reveal animation).

## Implementation Notes

- Use CSS Grid with grid-template-areas for clarity
- Mobile collapses to single column
- Tile borders: 12-16px radius, 1px border in subtle color
- Hover: copper border + 2px lift + scale 1.01
- Animation: framer-motion stagger fade-in on mount, IntersectionObserver on scroll reveals
- Typography: keep serif headers (clamp 64-96px), mono for labels, Inter for body
- Colors: cream + copper primary, forest green #3D5A4E for 1-2 tiles max

## Files Not Reachable

All six inspiration sites could not be reached from the research environment due to network isolation. Recommendations based on documented design patterns and prior analysis.
