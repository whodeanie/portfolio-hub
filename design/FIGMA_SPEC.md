# Kerry Dean Jr Portfolio Hub, Figma Spec

This is a complete buildable spec for the portfolio hub design at desktop and
mobile breakpoints. Anyone can rebuild it in Figma in roughly 30 minutes by
following the sections below in order. The file is also the source of truth
for the implemented site under `/app`.

## File setup

* File name: "Kerry Dean Jr Portfolio Hub"
* Pages: `Cover`, `01 Foundations`, `02 Components`, `03 Desktop 1440`, `04 Mobile 390`
* Color profile: sRGB
* Default font fallback: system

## 1. Foundations

### 1.1 Color tokens

| Token            | Hex      | Use                                            |
|------------------|----------|------------------------------------------------|
| `bg/primary`     | `#0A0A0A`| Page background (deep charcoal)                |
| `bg/elevated`    | `#0D0D0D`| Card backgrounds, slightly elevated panels     |
| `fg/primary`     | `#EDEDED`| Body and headline text                         |
| `fg/muted`       | `#8A8A85`| Captions, eyebrow labels, footer text          |
| `rule/default`   | `#1F1F1F`| Section dividers, card borders                 |
| `accent/copper`  | `#D4A574`| Primary accent. Hover, key CTAs, highlights    |
| `category/ai`    | `#D4A574`| Project category chip: AI                      |
| `category/sports`| `#7AA2D4`| Project category chip: Sports                  |
| `category/tooling`|`#A6D49A`| Project category chip: Tooling                 |
| `category/prod`  | `#D49A7A`| Project category chip: Production              |
| `category/health`| `#C9A6D4`| Project category chip: Healthcare              |
| `category/brand` | `#D4D49A`| Project category chip: Brand                   |

The `accent/copper` is intentionally identical to the Paperloom copper used
across the brand surface. The category chip palette extends from it on the
warm side and adds a cool counter on the sports chip so the grid does not feel
monochromatic.

### 1.2 Type system

Three families. All are free Google or system fonts.

| Style          | Family             | Weight | Size  | Line  | Tracking | Use                |
|----------------|--------------------|--------|-------|-------|----------|--------------------|
| `display/h1`   | Crimson Pro        | 500    | 72/56 | 1.05  | -0.01em  | Hero name           |
| `display/h2`   | Crimson Pro        | 500    | 36/28 | 1.15  | -0.005em | Section headers     |
| `display/h3`   | Crimson Pro        | 500    | 24/22 | 1.25  | 0        | Card titles         |
| `body/lg`      | Inter              | 400    | 18    | 1.5   | 0        | Hero pitch line     |
| `body/md`      | Inter              | 400    | 16    | 1.55  | 0        | Body paragraphs     |
| `body/sm`      | Inter              | 400    | 14    | 1.5   | 0        | Card summaries      |
| `label/xs`     | Inter              | 500    | 12    | 1.4   | 0.06em   | Eyebrow labels      |
| `mono/sm`      | JetBrains Mono     | 400    | 13    | 1.4   | 0        | Tech chips          |
| `mono/xs`      | JetBrains Mono     | 400    | 11    | 1.4   | 0.10em   | Footnotes           |

Headlines use Crimson Pro at 500. Inter handles body. JetBrains Mono is the
single mono used for chips and code-flavored captions.

### 1.3 Spacing scale

`4, 8, 12, 16, 20, 24, 32, 40, 56, 80, 120`. Match Tailwind's default scale.

### 1.4 Radii and elevation

* Card radius: 8
* Pill radius: 999
* Hairline border: 1 stroke, `rule/default`
* No drop shadows. Surface uses border + bg/elevated only.

### 1.5 Grid

* Desktop: 12 columns, 24px gutters, max content width 880, side padding 32
* Mobile: 4 columns, 16px gutters, side padding 20
* Vertical rhythm: section spacing 120 desktop, 80 mobile

## 2. Components

### 2.1 Button

Variants: `primary`, `secondary`. Sizes: `md` only on this site.

```
Primary (CTA)
  bg: accent/copper
  fg: #000
  border: 1px accent/copper
  padding: 10 20
  radius: 999
  hover: bg transparent, fg accent/copper, border stays
  font: Inter 500 14
```

```
Secondary
  bg: transparent
  fg: fg/primary
  border: 1px rule/default
  hover: border fg/primary
```

### 2.2 Tech chip

```
bg: transparent
fg: fg/muted
border: 1px #2a2a2a
padding: 2 8
radius: 999
font: JetBrains Mono 11, tracking 0.02em
```

### 2.3 Category chip (project filter)

Same shape as tech chip, fg uses the matching `category/*` token, border becomes
that color at 30% alpha.

### 2.4 Project card

```
container: bg/elevated, 1px rule/default, radius 8, padding 20
title: display/h3, fg/primary
tagline: body/sm, fg/primary at 80%
chip row: 8px gap below tagline, 6px gap between chips
cta link: label/xs, accent/copper, "View ↗"
hover: title shifts to accent/copper, border to fg/primary at 50%
```

Card inner sections vertically stacked. Cover image optional, 16:9, fills width.

### 2.5 Stats strip cell

```
value: display/h2 (36)
label: label/xs, fg/muted
align: left
divider: 1px rule/default vertical between cells on desktop
```

### 2.6 Timeline node

```
dot: 10x10 circle, accent/copper if AI, teal if full-stack, purple if research
line: 1px rule/default, vertical, fixed in column
year: mono/sm, fg/muted, in left rail (column 1)
role row: display/h3 inline with company in fg/muted
expand: chevron right, fg/muted, 12px
```

When expanded, three bullet wins appear below the role row indented to the
content column. Each win uses `body/sm`.

## 3. Desktop, 1440 wide

### 3.1 Page structure (top to bottom)

1. Header bar (no chrome, just spacing)
2. Hero
3. Stats strip
4. Selected work intro
5. Career timeline
6. Project grid with filter bar
7. Live products strip
8. Tech stack row
9. About paragraph
10. Contact row
11. Footer

### 3.2 Hero

* Container: max width 720, centered, 96 top padding
* Eyebrow label: "Kerry Dean Jr." in label/xs, fg/muted
* Headline: "Software Engineer." display/h1
* Pitch: body/lg, max width 60ch, fg/primary at 85%
  > Sentence: "I ship production AI systems that move real money. Available for senior Applied AI roles."
* CTA row: 3 buttons, 12px gap. "Email me" (primary), "GitHub" (secondary), "Resume PDF" (secondary)

### 3.3 Stats strip

Four stats in one row with vertical dividers. 80 top padding.

| Value | Label                     |
|-------|---------------------------|
| 291   | n8n workflows shipped     |
| 8+    | books published on KDP    |
| 25+   | public GitHub repos       |
| 9+    | years shipping production |

### 3.4 Career timeline

Section title "Career" in display/h2, eyebrow label "PATH" above it.

Timeline column on the left rail (year), node dot, then content column.

Roles, top to bottom (most recent first):

```
2025         Traverse Technologies, Senior Technical Lead
              wins:
                Shipped a multi-tenant production AI feature
                Cut backend p99 latency by 35% post launch
                Built greenfield ingestion at 50k events/min

2023..2025   WellBe Senior Medical, Senior Software Engineer
              wins:
                FHIR-aware document understanding pipeline
                Real-world clinical data co-pilot
                Eval harness gating safety-sensitive outputs

2024         FwdThink, Senior Generative AI Software Engineer
              wins:
                Federal-domain RAG with citation enforcement
                Evidence trail for every model response
                Pattern library reused by three teams

2021..2023   Syngenta, Senior Software Engineer
              wins:
                Refactored monolith to typed services
                Owned the agronomy data pipeline
                Mentored two engineers to senior

2020..2021   Argonne National Laboratory, Software Developer Consultant
              wins:
                Research data tooling for HEP experiments
                Reproducible analysis pipelines

2018..2020   Enablon, Software Engineer
              wins:
                Compliance reporting platform features
                Improved core form rendering performance

2016..2018   Group O, Software Developer
              wins:
                B2B order routing system features
                On-call rotation for production incidents

2012..2016   University of Iowa, BS Computer Science
              wins:
                Foundations: algorithms, systems, theory
```

Categories, color codes:

```
AI work        accent/copper   #D4A574
Full-stack     teal            #6EBFB8
Research       purple          #B388D4
```

Each node animates in on scroll using `IntersectionObserver` with `threshold: 0.4`
and a 280ms ease-out fade plus 12px translateY.

### 3.5 Project grid

Section title "Projects" in display/h2.

Filter bar above the grid: pill buttons for "All", "AI", "Sports", "Tooling",
"Production", "Healthcare", "Brand". Selected pill uses accent/copper bg.

Grid: 2 columns desktop, 1 column mobile. 24px gap. Project card from 2.4.

Cards (target 26 total):

```
AI
  Claude Agent SDK Skill Suite          GitHub
  n8n Agentic Workflow Library          GitHub
  MCP RAG Starter                       GitHub
  LLM Eval Healthcare                   GitHub
  Ivy Offline Eval Toolkit              GitHub
  Agent Skill Init                      GitHub
  Claude Skill Template                 GitHub

Sports
  NBA Prop Predictor                    GitHub
  NFL Line Movement Tracker             GitHub
  MLB Batter vs Pitcher Matchup         GitHub
  Horse Racing Speed Figures            GitHub
  Kelly Criterion Bankroll Sizer        GitHub
  Live Odds Aggregator                  GitHub

Tooling
  Code Review Assistant (n8n)           GitHub
  Idempotent Webhook Gateway (n8n)      GitHub
  Tool Using Agent (n8n)                GitHub
  Multi-step Research Agent (n8n)       GitHub

Production
  Lead Enrichment Pipeline (n8n)        GitHub
  Scheduled Data Migration (n8n)        GitHub
  Financial Reconciliation Agent (n8n)  GitHub
  Competitive Monitoring (n8n)          GitHub

Healthcare
  LLM Evaluation Harness (n8n)          GitHub
  Multimodal Doc Understanding (n8n)    GitHub
  Content Moderation Pipeline (n8n)     GitHub

Brand
  Paperloom Studio                      Live
  KerryPaperCo on Etsy                  Live
```

### 3.6 Live products strip

Three cards in one row: Paperloom Studio, KerryPaperCo on Etsy, KDP catalog.

### 3.7 Tech stack

Single line, wrapping. Mono/sm in fg/primary at 80%. Items separated by 24px
horizontal, 12px vertical when wrapped:

```
Python  TypeScript  Anthropic  OpenAI  LangChain  Pinecone  FAISS  FastAPI
Next.js  AWS  Azure  Docker  n8n  PyMC  XGBoost  Plotly  Streamlit
```

### 3.8 About paragraph

Two paragraphs. Body/md. Same content as `app/page.tsx`.

### 3.9 Contact row

Vertical list, body/lg, 12px row gap. Email, GitHub, LinkedIn, long-form
case studies.

### 3.10 Footer

Hairline rule, then a row of mono/xs:
```
© 2026 Kerry Dean Jr.                Hosted on Vercel
```

## 4. Mobile, 390 wide

* Side padding 20
* Hero headline drops to 56
* Stats strip wraps to 2x2 grid
* Project grid is one column
* Timeline keeps the same vertical layout; year column collapses to 60px
* All section spacings drop from 120 to 80

## 5. Implementation notes

* The implemented site lives at `/app`, Next.js 14 app router.
* All color tokens are defined as CSS variables in `app/globals.css`.
* Tailwind reads them via the `[var(--token)]` syntax.
* Fonts load from `next/font/google` so build is offline-friendly.
* Timeline uses vanilla `IntersectionObserver`; no Framer Motion to avoid extra runtime weight.
* Filter bar uses URL state `?cat=ai` so filters are linkable.

## 6. Cost note

Everything in this spec uses free fonts and free MCPs in the original brief.
Vercel hosting is free for the personal-tier traffic this site sees.
