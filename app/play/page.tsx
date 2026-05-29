import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play. Kerry Dean Jr. Live demos and games",
  description:
    "Live browser demos from Kerry Dean Jr. Wordle with AI hints, perfect tic tac toe, AI storyteller, sports trivia, RAG, and publishing tools.",
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
    title: "Sports Trivia",
    href: "/play/sports-trivia/",
    tagline: "16 sports, 10 questions, 6 second timer. Live AI generated questions.",
    bullets: [
      "Single Groq batch call generates all 10 questions per round",
      "Speed bonus per correct answer up to 50, plus per sport high score",
      "Baked fallback question pack keeps the game playable when Groq is down",
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
      "Used to ship KDP products",
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
      "Feeds the coloring book pipeline that publishes to KDP",
    ],
    badge: "Demo",
  },
];

export default function PlayIndex() {
  const liveGames = DEMOS.filter((demo) => demo.badge === "Game").length;

  return (
    <main className="min-h-screen px-6 sm:px-8 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to home
        </a>

        <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-2)]">
              Live playground
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">
              Play the demos. Check the systems.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--fg)]/78">
              This is the interactive side of the portfolio: browser games,
              AI-assisted tools, and production-adjacent demos that show the
              logic instead of hiding behind a case-study paragraph.
            </p>
          </div>

          <figure className="loud-card p-3">
            <img
              src="/headshot-square.jpg"
              alt="Kerry Dean Jr."
              width={320}
              height={320}
              className="aspect-square w-full rounded-md object-cover"
            />
            <figcaption className="flex items-center justify-between gap-3 pt-3 font-mono text-[10px] font-bold uppercase tracking-widest">
              <span>Kerry, not a stock hero.</span>
              <span className="text-[var(--accent-2)]">whodeanie</span>
            </figcaption>
          </figure>
        </header>

        <section className="mt-10 grid grid-cols-2 gap-4 border-y-2 border-[var(--rule)] py-6 sm:grid-cols-4">
          <div>
            <div className="text-3xl font-black text-[var(--accent)]">{liveGames}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              live games
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[var(--accent-3)]">70B</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Groq model lane
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[var(--accent-2)]">0</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              paywalls
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[var(--accent)]">ship</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              then show it
            </div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {DEMOS.map((d, index) => (
            <a
              key={d.title}
              href={d.href}
              target={d.external ? "_blank" : undefined}
              rel={d.external ? "noreferrer" : undefined}
              className="group loud-card flex min-h-[280px] flex-col p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent-3)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  {d.badge}
                </span>
              </div>
              <div className="mt-8">
                <div className="serif text-2xl font-semibold leading-tight text-[var(--fg)] group-hover:text-[var(--accent)]">
                  {d.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--fg)]/72">
                  {d.tagline}
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-xs leading-relaxed text-[var(--fg)]/68">
                {d.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-[var(--accent-2)]">/</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                {d.external ? "Open ↗" : "Open →"}
              </div>
            </a>
          ))}
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--rule)] pt-8 font-mono text-xs text-[var(--muted)]">
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
