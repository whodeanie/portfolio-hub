import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sandbox. Kerry Dean Jr. Software Engineer",
  description: "Live demos and playable games. No signup, no setup, no keys.",
  alternates: { canonical: "/sandbox" },
};

type SandboxItem = {
  name: string;
  description: string;
  href: string;
  isGame?: boolean;
};

type SandboxCategory = {
  title: string;
  items: SandboxItem[];
};

const SANDBOX: SandboxCategory[] = [
  {
    title: "Sports and Betting Analytics",
    items: [
      {
        name: "NBA Playoff Props",
        description: "Player prop predictions for tonight's slate. Compares model edges to sportsbook lines.",
        href: "https://nba-playoff-props.vercel.app",
      },
      {
        name: "NBA DFS Optimizer",
        description: "DraftKings lineup optimizer using player projections and salary constraints.",
        href: "https://nba-dfs-optimizer.vercel.app",
      },
      {
        name: "Kelly Bankroll Sizer",
        description: "Computes optimal bet size given edge, odds, and bankroll using fractional Kelly. Source on GitHub while the web app is being redeployed.",
        href: "https://github.com/whodeanie/kelly-bankroll-sizer-ts",
      },
      {
        name: "Polymarket Helper",
        description: "Surfaces mispriced contracts on Polymarket using calibrated probability models.",
        href: "https://polymarket-helper-rosy.vercel.app",
      },
      {
        name: "Episode Takes",
        description: "Extracts the best takes from sports podcast transcripts using LLM scoring.",
        href: "https://episode-takes.vercel.app",
      },
    ],
  },
  {
    title: "Fintech",
    items: [
      {
        name: "Quant Signal Engine",
        description: "Daily signals on equities and ETFs with backtested Sharpe and drawdown.",
        href: "https://quant-signal-engine.vercel.app",
      },
    ],
  },
  {
    title: "Media and Entertainment",
    items: [
      {
        name: "AI Sports Content Engine",
        description: "Generates daily betting briefs and prop write ups from live odds plus model output. Source on GitHub while the web app is being redeployed.",
        href: "https://github.com/whodeanie/ai-sports-content-engine",
      },
    ],
  },
  {
    title: "AI Engineering Demos",
    items: [
      {
        name: "MCP RAG Starter",
        description: "Reference implementation of an MCP server fronting a vector store with hybrid search.",
        href: "/work/mcp-rag-starter",
      },
    ],
  },
  {
    title: "Browser Games",
    items: [
      {
        name: "Wordle Clone",
        description: "Six guesses, five letter target. Custom word list.",
        href: "/play/wordle/",
        isGame: true,
      },
      {
        name: "Tic Tac Toe",
        description: "Pure JS, minimax opponent.",
        href: "/play/tictactoe-ai/",
        isGame: true,
      },
      {
        name: "Storyteller",
        description: "Choose your own adventure with branching paths.",
        href: "/play/storyteller/",
        isGame: true,
      },
    ],
  },
];

export default function SandboxPage() {
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16 sm:py-24">
      <section className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-16">
          <h1 className="serif text-4xl sm:text-5xl font-medium text-[#1F1B15] leading-tight tracking-tight mb-6">
            Click any link below. No signup, no setup, no keys.
          </h1>
          <p className="prose-body text-base text-[#1F1B15]/75 leading-relaxed max-w-2xl">
            Every project is deployed and live. The AI calls run server side so visitors never need to bring their own keys. If anything rate limits or goes down, the apps fall back to deterministic responses so the demo never breaks.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {SANDBOX.map((category) => (
            <section key={category.title} className="space-y-6">
              {/* Category Header */}
              <h2 className="font-mono text-sm uppercase tracking-widest text-[#B87333] border-b border-[#B87333]/30 pb-3">
                {category.title}
              </h2>

              {/* Category Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <article
                    key={item.name}
                    className="group rounded-lg border border-[var(--rule)] p-5 bg-[#F5EFE0] hover:border-[var(--accent)] hover:shadow-[0_4px_12px_rgba(166,115,64,0.1)] hover:-translate-y-0.5 transition-all flex flex-col gap-3"
                  >
                    <h3 className="serif text-lg font-medium text-[#1F1B15]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#1F1B15]/75 leading-relaxed flex-grow">
                      {item.description}
                    </p>
                    <a
                      href={item.href}
                      target={item.href.startsWith("/") ? undefined : "_blank"}
                      rel={item.href.startsWith("/") ? undefined : "noopener noreferrer"}
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#B87333] hover:text-[#B87333]/80 transition-colors"
                    >
                      {item.isGame ? "Play now" : "Try it"} →
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <section className="mt-24 pt-16 border-t border-[var(--rule)]">
          <p className="prose-body text-sm text-[#1F1B15]/70 leading-relaxed max-w-prose mb-6">
            Want to see how these are built. Check out the GitHub org or read the full case studies.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/whodeanie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--rule)] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#1F1B15] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              GitHub Org →
            </a>
            <Link
              href="/work/"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--rule)] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#1F1B15] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Case Studies →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
