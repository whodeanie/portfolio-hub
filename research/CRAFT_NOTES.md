# Design Craft Notes

## Design Direction
Kerry's portfolio uses a warm cream background (#F8F4ED) with deep ink text (#1F1B15) and copper accents (#A67340), drawing inspiration from Brittany Chiang's approach to sophisticated sans-serif/serif pairing and clear information hierarchy.

## Common Design Moves Across References

1. **Clear hierarchical structure**: Large serif headlines anchor sections with consistent spacing and modest upper-case labels in small monospace text
2. **Generous whitespace**: Minimal density allows breathing room; section breaks use subtle borders rather than heavy visual dividers
3. **Two-column layouts at medium+ viewports**: Left column for labels/dates in monospace, right for narrative content in serif and sans
4. **Muted color palette with accent colors**: Neutral grays and intentional accent colors (copper, teal, muted greens) for interactive elements
5. **Serif fonts for headlines and key content**: Newsreader or similar serif in substantial sizes (48px+) with narrow font-weight variance (400-600)
6. **Professional photography and imagery**: Most portfolios feature substantial imagery showing work output or professional photos
7. **Hover states as subtle interactions**: Thin border changes, opacity shifts, or accent color lifts without animations
8. **Footer with minimal metadata**: Year, host platform, or "built with" credits presented in small monospace text
9. **No excessive animations**: Motion is minimal and purposeful; focus is on static, legible content
10. **Fixed or sticky navigation**: Either inline section navigation or hamburger menu for longer portfolios

## Five Things These Sites Do That Prior Version Lacked

1. **Serif/sans intentionality**: Established fonts with clear roles (Newsreader for display, Inter or similar for body)
2. **Monospace as a design element**: Dates, tech stacks, labels use JetBrains Mono or similar in small sizes, not as fallback
3. **Accessible color contrast**: Warm creams and deep inks meet WCAG AA standards; accent colors reserved for interactive states
4. **Modular card-based projects**: Cards use flat thin borders, consistent padding, and reveal on hover rather than stacking
5. **Dark mode built into CSS variables**: Seamless toggle without JavaScript libraries; consistent accent palette in both modes

## Palette and Type Strategies

- **Color**: Warm cream (#F8F4ED) + deep ink (#1F1B15) + copper accent (#A67340). Dark mode inverts with slightly lighter accent (#d4a574).
- **Type hierarchy**: Newsreader 64px serif for hero name, 40px for section headers, 20px for card titles. Inter 16px for body, 14px for descriptions.
- **Monospace**: JetBrains Mono 12px for dates, 11px for tech labels, 10px for category chips. All-caps with letter-spacing for emphasis.
- **Spacing**: 24px between sections, 16px between cards, 6px/8px for chip padding. CSS variables drive consistent gaps.

## Locked Direction

Kerry's portfolio adopts a **clean, warm, content-forward aesthetic with serif/sans/mono intentionality and a dark mode toggle**, mirroring Brittany Chiang's balance of whitespace, hierarchy, and accessible typography while staying true to Kerry's applied AI positioning.
