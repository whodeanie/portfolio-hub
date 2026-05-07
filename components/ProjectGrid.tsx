"use client";

import { useMemo, useState } from "react";

type Cat = "ai" | "sports" | "tooling" | "production" | "healthcare" | "brand" | "fintech";

type Project = {
  title: string;
  tagline: string;
  description: string;
  chips: string[];
  href: string;
  label: string;
  cats: Cat[];
  caseStudy?: string;
  featured?: boolean;
};

const PROJECTS: Project[] = [
  // FEATURED CASE STUDIES
  {
    title: "Quant Signal Engine",
    tagline: "Walk forward backtester for three classic quant strategies, with AI commentary. Free.",
    description:
      "A Next.js 15 dashboard that runs RSI mean reversion, moving average crossover, and Bollinger band breakout strategies against real historical OHLC data. Walk forward simulation with capped Kelly position sizing, full performance statistics (total return, Sharpe, max drawdown, win rate, longest losing streak), and a buy and hold benchmark. Llama 3.3 70B writes regime aware commentary on each backtest via Groq. Educational analytics only. No trade execution. No brokerage integration.",
    chips: ["Next.js 15", "TypeScript", "Yahoo Finance", "Groq", "Recharts"],
    href: "https://quant-signal-engine.vercel.app",
    label: "Live demo",
    cats: ["fintech", "ai"],
    featured: true,
  },
  {
    title: "MCP RAG Starter",
    tagline: "Production grade RAG packaged as a Model Context Protocol server.",
    description:
      "A reusable server scaffold that drops a hybrid retrieval RAG pipeline behind any MCP compatible client. Hybrid retrieval blends BM25 lexical search with dense vector search, results carry citation provenance, and an evaluation harness gates regressions before deploy.",
    chips: ["MCP", "RAG", "BM25", "Vector search", "Eval"],
    href: "https://github.com/whodeanie/mcp-rag-starter",
    label: "View repo",
    cats: ["ai", "tooling"],
    caseStudy: "mcp-rag-starter",
    featured: true,
  },
  {
    title: "n8n Agentic Workflow Library",
    tagline: "291 production agentic workflows. 41 packs. Battle tested patterns.",
    description:
      "An opinionated library of n8n workflow patterns covering function and tool calling, RAG retrieval, hybrid vector search, and multi step agent orchestration. Every pack ships with setup docs, validation tests, retry policies, and integrations across Slack, Gmail, HubSpot, Airtable, Notion, OpenAI, and Anthropic.",
    chips: ["n8n", "Agentic", "OpenAI", "Anthropic"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View repo",
    cats: ["ai", "tooling"],
    caseStudy: "n8n-workflow-library",
    featured: true,
  },
  {
    title: "Ivy Offline Eval Toolkit",
    tagline: "Reproducible evaluation harness with a portable rubric library.",
    description:
      "An offline evaluation toolkit for LLM features that need to ship under safety guarantees. Portable rubrics, deterministic scaffolds, fixture based regression suites, and a CSV export pipeline that lets a non engineer review the failures.",
    chips: ["Eval", "Offline", "Rubrics", "Python"],
    href: "https://github.com/whodeanie/ivy-offline-toolkit",
    label: "View repo",
    cats: ["ai", "tooling"],
    caseStudy: "ivy-offline-toolkit",
    featured: true,
  },
  {
    title: "NBA Playoff Props",
    tagline: "Live player prop predictions for the 2026 NBA playoffs. Free.",
    description:
      "A weighted blend model that produces player prop predictions with one paragraph of plain English reasoning per pick. Line shopping across DraftKings, FanDuel, BetMGM, and Caesars. Every resolved pick is published whether it hit or missed, on a public accuracy page that updates after each game.",
    chips: ["Next.js 15", "TypeScript", "Anthropic", "OddsAPI", "Live"],
    href: "https://nba-playoff-props.vercel.app",
    label: "Live demo",
    cats: ["ai", "sports"],
    caseStudy: "nba-playoff-props",
    featured: true,
  },
  {
    title: "NBA DFS Optimizer",
    tagline: "Mixed integer programming for DraftKings and FanDuel lineups, with AI commentary.",
    description:
      "A custom branch and bound solver and a 2-opt local search that produce optimal NBA DFS lineups respecting salary cap, position eligibility, team limits, locks, excludes, stacking, and exposure. Each lineup ships with a 100 word Llama 3.3 70B analysis (free via Groq) of the contrarian leverage angle, the biggest risk, and the GPP outcome read. Companion to NBA Playoff Props, same audience, different problem.",
    chips: ["Next.js 15", "TypeScript", "MIP", "Groq", "Llama 3.3"],
    href: "https://github.com/whodeanie/nba-dfs-optimizer",
    label: "View repo",
    cats: ["ai", "sports"],
    featured: true,
  },
  {
    title: "Polymarket Helper",
    tagline: "Find mispriced prediction markets. Free, read only analysis tool.",
    description:
      "A read only analytics layer for Polymarket. The edge model blends category specific historical base rates with the live crowd price, weighted by volume and pulled toward the prior on long dated markets. A bounded news sentiment adjustment from NewsData.io shifts the model up to four points in either direction. Each market detail page ships with a 100 word Llama 3.3 70B reasoning paragraph generated via Groq that explains why the market may be mispriced, the single biggest risk factor, and a three item watchlist. No wallet, no trade execution, no advice.",
    chips: ["Next.js 15", "TypeScript", "Groq", "Llama 3.3", "Recharts"],
    href: "https://polymarket-helper-rosy.vercel.app",
    label: "Live demo",
    cats: ["ai", "sports"],
    featured: true,
  },
  {
    title: "Episode Takes",
    tagline: "Letterboxd for TV at the episode level. Polish a rough thought into a clean review.",
    description:
      "A free, open source rating and review app for TV that grades by episode, not by season. Half star precision, spoiler aware reveals, and per take share URLs. The killer feature is an AI take polisher: a half formed thought becomes a 60 to 100 word review in the user's own voice using Llama 3.3 70B via Groq, with a strict no inventing claims contract. Three more AI hooks ride along: season retrospective generator, spoiler classifier that auto flags risky takes, and a five pick recommender that mixes close to taste with stretch picks.",
    chips: ["Next.js 15", "TypeScript", "Groq", "Llama 3.3", "TMDB"],
    href: "https://github.com/whodeanie/episode-takes",
    label: "View repo",
    cats: ["ai", "production"],
    featured: true,
  },
  {
    title: "Claude Skill Suite",
    tagline: "Five production Claude Agent SDK skills that ship real digital products.",
    description:
      "A family of Claude Agent SDK skills covering puzzle book publishing, coloring book publishing, KDP browser automation, Etsy storefront automation, and niche PDF generation. Each follows the same deterministic scaffold plus LLM hybrid pattern, with retry, fallback, and validation gates between stages.",
    chips: ["Claude Agent SDK", "Anthropic", "Python", "Skills"],
    href: "https://github.com/whodeanie/claude-skill-template",
    label: "View kernel",
    cats: ["ai", "tooling"],
    caseStudy: "claude-skill-suite",
    featured: true,
  },
  {
    title: "Federal RAG and Procurement Research",
    tagline: "Production AI pipelines for a federal agency, sanitized writeup.",
    description:
      "The work I led at FwdThink. Document understanding for incoming complaints, an LLM based case routing classifier, an evidence analysis module that cites the source document, and a procurement research tool over solicitation databases. Sanitized for public consumption.",
    chips: ["Federal", "RAG", "GPT-4", "Rekognition"],
    href: "/work/fwdthink-rag-procurement/",
    label: "Read writeup",
    cats: ["ai", "production"],
    caseStudy: "fwdthink-rag-procurement",
    featured: true,
  },

  // OTHER AI / TOOLING
  {
    title: "LLM Eval Healthcare",
    tagline: "Safety first evaluation suite for healthcare adjacent LLM outputs.",
    description:
      "Hand crafted prompts, four scoring dimensions covering factuality, safety, citation, and refusal behavior, and a prominent disclaimer in every output. Designed to be the gate that stops a healthcare adjacent LLM feature from regressing.",
    chips: ["LLM Eval", "Healthcare", "FHIR", "Safety"],
    href: "https://github.com/whodeanie/llm-eval-healthcare",
    label: "View repo",
    cats: ["ai", "healthcare"],
  },
  {
    title: "Agent Skill Init",
    tagline: "Project initialiser for new Claude Agent skills.",
    description:
      "A scaffold generator that drops in skill descriptions, scripts, validation tests, and the Claude Agent SDK glue already wired. The reason I can ship a new production skill in a working day instead of a working week.",
    chips: ["Skills", "Init", "Anthropic"],
    href: "https://github.com/whodeanie/agent-skill-init",
    label: "View repo",
    cats: ["ai", "tooling"],
  },

  // SPORTS
  {
    title: "NBA Prop Predictor (Python)",
    tagline: "Quantile XGBoost over matchup, pace, rest, and recent form.",
    description:
      "The Python sibling of the live NBA Playoff Props product. Outputs probability of over with an 80% credible interval rather than a point estimate, served behind a FastAPI endpoint backed by the nba_api library.",
    chips: ["Python", "XGBoost", "FastAPI", "nba_api"],
    href: "https://github.com/whodeanie/nba-prop-predictor",
    label: "View repo",
    cats: ["sports", "ai"],
  },
  {
    title: "NFL Line Movement Tracker",
    tagline: "Reverse line movement detector across major sportsbooks.",
    description:
      "Polls the Odds API every ten minutes, persists the snapshots to SQLite, and surfaces reverse line movement signals on a Plotly Dash dashboard. The signal that the public is on one side and the line is moving the other way.",
    chips: ["Python", "APScheduler", "SQLite", "Dash"],
    href: "https://github.com/whodeanie/nfl-line-movement-tracker",
    label: "View repo",
    cats: ["sports"],
  },
  {
    title: "MLB Batter vs Pitcher Matchup",
    tagline: "Bayesian batter vs pitcher matchup analysis.",
    description:
      "A Beta Binomial conjugate update on hit rate paired with PyMC NUTS sampling on slugging percentage. Built as a Streamlit app on top of pybaseball, with credible intervals not just point estimates.",
    chips: ["Python", "PyMC", "pybaseball", "Streamlit"],
    href: "https://github.com/whodeanie/mlb-batter-pitcher-matchup",
    label: "View repo",
    cats: ["sports", "ai"],
  },
  {
    title: "Horse Racing Speed Figures",
    tagline: "Beyer style speed figures with track variant and class par.",
    description:
      "A deterministic, fully testable pipeline that computes Beyer style speed figures with daily track variants and class par normalisation. Outputs are explainable enough that an old time horse player can audit the math.",
    chips: ["Python", "pandas", "Numpy", "Jinja2"],
    href: "https://github.com/whodeanie/horse-racing-speed-figures",
    label: "View repo",
    cats: ["sports"],
  },
  {
    title: "Kelly Criterion Bankroll Sizer",
    tagline: "Fractional Kelly with a 200 path Monte Carlo growth simulation.",
    description:
      "A static web app that lets a bettor size a position by fractional Kelly and then watch a 200 path Monte Carlo growth simulation render in canvas. No build step, no backend, runs entirely in the browser.",
    chips: ["JavaScript", "HTML5 Canvas", "Probability"],
    href: "https://github.com/whodeanie/kelly-criterion-bankroll-sizer",
    label: "View repo",
    cats: ["sports"],
  },
  {
    title: "Live Odds Aggregator",
    tagline: "Multi book best line surfacing with no vig fair pricing.",
    description:
      "Polls live odds across five plus sportsbooks, computes no vig fair prices, and surfaces the EV uplift per market. FastAPI backend, Next.js dashboard, SQLite snapshots.",
    chips: ["FastAPI", "Next.js", "SQLite", "Odds API"],
    href: "https://github.com/whodeanie/live-odds-aggregator",
    label: "View repo",
    cats: ["sports"],
  },

  // SPORTS + AI (TS ports)
  {
    title: "AI Sports Content Engine",
    tagline: "TypeScript content pipeline for game previews, betting analysis, and recaps.",
    description:
      "Pulls team and game context from ESPN, structures the prompt for Claude Sonnet 4.6 via the Anthropic SDK, then renders polished HTML articles. Same pipeline used to produce game previews, betting analysis, and post game recaps.",
    chips: ["TypeScript", "Anthropic SDK", "Next.js", "Zod"],
    href: "https://github.com/whodeanie/ai-sports-content-engine-ts",
    label: "View repo",
    cats: ["ai", "sports"],
  },
  {
    title: "Live Game State Tracker",
    tagline: "Real time NBA game state via WebSocket with per play AI commentary.",
    description:
      "A Hono server that polls and diffs the ESPN scoreboard, then streams per play commentary generated by Claude over WebSocket. Falls back to a deterministic rules based generator when no API key is configured.",
    chips: ["TypeScript", "Hono", "WebSocket", "Claude"],
    href: "https://github.com/whodeanie/live-game-state-tracker-ts",
    label: "View repo",
    cats: ["ai", "sports"],
  },
  {
    title: "NFL Line Movement Tracker (TS)",
    tagline: "Typed Next.js port of the Python tracker.",
    description:
      "Next.js 15 App Router, better-sqlite3, node-cron worker, fully unit tested. Same reverse line movement detector as the Python original, with stricter types and Recharts for the visualisation.",
    chips: ["TypeScript", "Next.js 15", "better-sqlite3", "Recharts"],
    href: "https://github.com/whodeanie/nfl-line-movement-tracker-ts",
    label: "View repo",
    cats: ["sports"],
  },
  {
    title: "Kelly Bankroll Sizer (TS)",
    tagline: "Polished Next.js plus TypeScript reimplementation.",
    description:
      "Pure client side. Deterministic 200 path Monte Carlo via a Mulberry32 seeded PRNG, rendered as a Recharts area band plus median line. Reproducible runs make this auditable in a way the JavaScript version never was.",
    chips: ["TypeScript", "Next.js", "Recharts", "Probability"],
    href: "https://github.com/whodeanie/kelly-bankroll-sizer-ts",
    label: "View repo",
    cats: ["sports"],
  },
  {
    title: "Live Odds Aggregator (TS)",
    tagline: "Hono backend, Next.js frontend, shared types via npm workspaces.",
    description:
      "TypeScript port of the live odds aggregator with shared types and no vig math via npm workspaces. EV uplift, freshness indicator, and best line surfacing across five plus sportsbooks.",
    chips: ["TypeScript", "Hono", "Next.js", "Workspaces"],
    href: "https://github.com/whodeanie/live-odds-aggregator-ts",
    label: "View repo",
    cats: ["sports"],
  },

  // n8n SHOWCASE
  {
    title: "Code Review Assistant (n8n)",
    tagline: "Agentic code review that reads diffs and posts inline comments.",
    description:
      "An n8n agentic workflow that reads the diff of a pull request, runs it through a configurable rubric, and posts inline review comments back to the PR. Rubric edits do not require touching the workflow itself.",
    chips: ["n8n", "Agentic", "Code review"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["tooling", "ai"],
  },
  {
    title: "Idempotent Webhook Gateway (n8n)",
    tagline: "Production safe webhook ingestion with replay and dead letter handling.",
    description:
      "A webhook ingestion gateway with deduplication keys, replay tooling, and a dead letter queue, designed to be the layer in front of any agentic workflow that has to survive duplicate deliveries from upstream providers.",
    chips: ["n8n", "Webhooks", "Idempotency"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["tooling", "production"],
  },
  {
    title: "Multi Step Research Agent (n8n)",
    tagline: "Plans, decomposes, and answers research questions with citations.",
    description:
      "An agent that decomposes a research question into sub questions, dispatches them to a retrieval node, and recombines the answers into a sourced response. Citations are mandatory at every step, not bolted on at the end.",
    chips: ["n8n", "Agentic", "Research"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["ai", "tooling"],
  },
  {
    title: "Lead Enrichment Pipeline (n8n)",
    tagline: "Inbound lead enrichment from email parse to CRM write.",
    description:
      "Inbound emails get parsed, the company gets looked up, the lead gets scored, and the result is written to the CRM. Idempotent at the email message id, retries on transient enrichment provider failures, and writes are batched.",
    chips: ["n8n", "CRM", "Pipelines"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["production"],
  },
  {
    title: "Financial Reconciliation Agent (n8n)",
    tagline: "Match transactions across two systems with explainable mismatches.",
    description:
      "Pulls transactions from two systems and matches them on a configurable composite key, surfacing mismatches with an explanation that reviewers can act on rather than a generic delta. Used by accounting teams that previously did this in spreadsheets.",
    chips: ["n8n", "Reconciliation", "Finance"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["production"],
  },
  {
    title: "LLM Evaluation Harness (n8n)",
    tagline: "Reusable evaluation harness wired into n8n.",
    description:
      "Runs prompt sets through configured models, applies rubric scores, and stores the results. Designed so that an evaluation run can be triggered manually, on a schedule, or as a pre deploy gate.",
    chips: ["n8n", "Eval", "Quality"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["ai", "tooling"],
  },
  {
    title: "Multimodal Doc Understanding (n8n)",
    tagline: "PDF and image ingestion through vision and language models.",
    description:
      "Ingests PDFs and images, routes them through a vision model, then passes the structured output to a language model for downstream extraction. Designed for messy real world documents like scanned forms and photographed handwritten statements.",
    chips: ["n8n", "Multimodal", "Vision"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["ai", "healthcare"],
  },
  {
    title: "Content Moderation Pipeline (n8n)",
    tagline: "Heuristic filters first, model adjudication second, human in loop on edges.",
    description:
      "A layered moderation pipeline that runs cheap heuristic filters first, escalates ambiguous cases to a model adjudicator, and routes the genuinely ambiguous to human review. Designed so that the cost curve scales with difficulty, not volume.",
    chips: ["n8n", "Moderation", "Safety"],
    href: "https://github.com/whodeanie/n8n-agentic-workflows",
    label: "View pack",
    cats: ["production", "healthcare"],
  },

  // BRAND
  {
    title: "Paperloom Studio",
    tagline: "AI generated puzzle, coloring, and information products. Live on Gumroad.",
    description:
      "The storefront for the digital products produced by the Claude skill suite. Coloring books, puzzle books, niche information PDFs, and n8n workflow packs. Live revenue, real customers, real refunds.",
    chips: ["Gumroad", "Brand", "Live"],
    href: "https://kerryaiperson.gumroad.com",
    label: "Visit store",
    cats: ["brand", "production"],
  },
  {
    title: "KerryPaperCo on Etsy",
    tagline: "Storefront for printable AI assisted designs.",
    description:
      "The Etsy side of the digital product portfolio. Same source of truth as Gumroad, different audience, different pricing strategy. Shipping orders.",
    chips: ["Etsy", "Brand", "Live"],
    href: "https://www.etsy.com/shop/KerryPaperCo",
    label: "Visit store",
    cats: ["brand", "production"],
  },
];

const FILTERS: { id: "all" | "case-studies" | Cat; label: string; color: string }[] = [
  { id: "case-studies", label: "Case studies", color: "var(--accent)" },
  { id: "all", label: "All", color: "var(--fg)" },
  { id: "ai", label: "AI", color: "#D4A574" },
  { id: "sports", label: "Sports", color: "#7AA2D4" },
  { id: "tooling", label: "Tooling", color: "#A6D49A" },
  { id: "production", label: "Production", color: "#D49A7A" },
  { id: "healthcare", label: "Healthcare", color: "#C9A6D4" },
  { id: "brand", label: "Brand", color: "#D4D49A" },
  { id: "fintech", label: "Fintech", color: "#7AD4A6" },
];

const CHIP_COLOR: Record<Cat, string> = {
  ai: "#D4A574",
  sports: "#7AA2D4",
  tooling: "#A6D49A",
  production: "#D49A7A",
  healthcare: "#C9A6D4",
  brand: "#D4D49A",
  fintech: "#7AD4A6",
};

export default function ProjectGrid() {
  const [active, setActive] = useState<"all" | "case-studies" | Cat>("all");
  const filtered = useMemo(() => {
    if (active === "all") return PROJECTS;
    if (active === "case-studies") return PROJECTS.filter((p) => p.caseStudy);
    return PROJECTS.filter((p) => p.cats.includes(active));
  }, [active]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-8">
        {FILTERS.map((f) => {
          const on = active === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className="rounded-full px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors"
              style={{
                color: on ? "#000" : f.color,
                background: on ? f.color : "transparent",
                borderColor: on ? f.color : "var(--rule)",
              }}
              aria-pressed={on}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <article
            key={p.title}
            className="group rounded-lg border border-[var(--rule)] p-5 hover:border-[var(--accent)] transition-colors flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="serif text-xl font-medium leading-snug">
                {p.title}
              </h3>
              {p.featured ? (
                <span
                  className="font-mono text-[9px] uppercase tracking-widest whitespace-nowrap rounded-full px-2 py-[2px] border"
                  style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent)",
                  }}
                >
                  Case study
                </span>
              ) : null}
            </div>

            <p className="serif italic text-sm text-[var(--fg)]/75 leading-snug">
              {p.tagline}
            </p>

            <p className="text-sm text-[var(--fg)]/85 leading-relaxed">
              {p.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {p.chips.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {p.cats.map((c) => (
                <span
                  key={c}
                  className="rounded-full px-2 py-[1px] text-[10px] font-mono uppercase tracking-widest"
                  style={{
                    color: CHIP_COLOR[c],
                    border: `1px solid ${CHIP_COLOR[c]}55`,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-2 flex flex-wrap gap-2">
              {p.caseStudy ? (
                <a
                  href={`/work/${p.caseStudy}/`}
                  className="rounded-md border border-[var(--accent)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
                >
                  Read case study →
                </a>
              ) : null}
              {p.label !== "Read writeup" ? (
                <a
                  href={p.href}
                  target={p.href.startsWith("/") ? undefined : "_blank"}
                  rel={p.href.startsWith("/") ? undefined : "noreferrer"}
                  className="rounded-md border border-[var(--rule)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]/80 hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
                >
                  {p.label} ↗
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs font-mono text-[var(--muted)]">
        Showing {filtered.length} of {PROJECTS.length} projects.
      </p>
    </div>
  );
}
