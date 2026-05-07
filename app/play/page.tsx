import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play. Kerry Dean Jr. AI Engineer",
  description:
    "Small browser games that double as portfolio talking points. Wordle with AI hints, perfect tic tac toe with commentary, choose your own adventure storyteller.",
  alternates: { canonical: "/play" },
};

type Demo = {
  title: string;
  href: string;
  external?: boolean;
  tagline: string;
  bullets: string[];
  badge: string;
};

const DEMOS: Demo[] = [
  {
    title: "Wordle with AI hints",
    href: "/play/wordle/",
    tagline: "Five letter Wordle clone with a Groq powered hint button.",
    bullets: [
      "Daily seeded answer from a public answer list",
      "Groq Llama 3.3 70B reasons over your guesses without revealing the word",
      "Streak and history persisted in localStorage",
    ],
    badge: "Game",
  },
  {
    title: "Tic tac toe AI",
    href: "/play/tictactoe-ai/",
    tagline: "Perfect minimax opponent with Groq commentary on each move.",
    bullets: [
      "Alpha beta pruned minimax with depth aware scoring",
      "Plain English commentary panel from Llama 3.3 70B",
      "Inline tree visualisation showing move values",
    ],
    badge: "Game",
  },
  {
    title: "Storyteller",
    href: "/play/storyteller/",
    tagline: "Choose your own adventure with five genres and an alignment tracker.",
    bullets: [
      "Pick a genre and starting setup, get a 200 word scene",
      "Three choices per scene, 5 to 7 scenes per story",
      "Hidden alignment vector subtly biases the ending",
    ],
    badge: "Game",
  },
  {
    title: "Word search generator",
    href: "https://github.com/whodeanie/claude-skill-template",
    external: true,
    tagline: "Procedural word search PDF generator (Claude Skill).",
    bullets: [
      "Theme picking, grid generator, deterministic layout",
      "Used to ship Etsy and KDP products",
      "Source in the claude-skill-template kernel",
    ],
    badge: "Demo",
  },
  {
    title: "RAG demo",
    href: "/work/mcp-rag-starter/",
    tagline: "MCP RAG Starter case study with hybrid retrieval.",
    bullets: [
      "BM25 plus dense vector blend",
      "Citation provenance through chunk merging",
      "Eval gate that runs before deploy",
    ],
    badge: "Case study",
  },
  {
    title: "Mandala generator",
    href: "https://github.com/whodeanie/claude-skill-template",
    external: true,
    tagline: "Generative mandala SVGs for the coloring book pipeline.",
    bullets: [
      "Symmetry group sampling",
      "SVG output that prints clean at letter size",
      "Powers a portion of the KerryPaperCo storefront",
    ],
    badge: "Demo",
  },
];

export default function PlayIndex() {
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16 sm:py-24">
      <div className="mx-auto max-w-prose">
        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to home
        </a>

        <header className="mt-8">
          <h1 className="serif text-4xl sm:text-5xl leading-[1.05] font-medium tracking-tight">
            Play.
          </h1>
          <p className="mt-4 text-lg text-[var(--fg)]/80 leading-relaxed">
            Browser games and demos. Each one is a small, self contained piece
            of code that turns into a talking point for the algorithm or system
            behind it. The three new games run on Groq Llama 3.3 70B.
          </p>
        </header>

        <section className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMOS.map((d) => (
            <a
              key={d.title}
              href={d.href}
              target={d.external ? "_blank" : undefined}
              rel={d.external ? "noreferrer" : undefined}
              className="group rounded-lg border border-[var(--rule)] p-5 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="serif text-lg font-medium group-hover:text-[var(--accent)]">
                  {d.title}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  {d.badge}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--fg)]/70 leading-relaxed">
                {d.tagline}
              </p>
              <ul className="mt-3 text-xs text-[var(--fg)]/65 leading-relaxed space-y-1">
                {d.bullets.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                {d.external ? "Open ↗" : "Open →"}
              </div>
            </a>
          ))}
        </section>

        <footer className="mt-24 pt-10 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="hover:text-[var(--accent)]">
            ← Home
          </a>
          <a href="/resume/" className="hover:text-[var(--accent)]">
            Resume →
          </a>
        </footer>
      </div>
    </main>
  );
}
