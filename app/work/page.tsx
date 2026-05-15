import type { Metadata } from "next";
import Link from "next/link";
import { CASE_STUDIES } from "./case-studies";

export const metadata: Metadata = {
  title: "Case studies. Kerry Dean Jr.",
  description:
    "Production case studies on RAG, agentic workflows, federal AI, healthcare AI, and the personal projects shipping under those patterns.",
  alternates: { canonical: "/work" },
};

export default function WorkIndexPage() {
  const studies = Object.values(CASE_STUDIES);

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
            Case studies
          </h1>
          <p className="mt-4 text-lg text-[var(--fg)]/80 leading-relaxed">
            Long form writeups on the production work and personal projects.
            Each case study walks through the problem, the approach, the
            architecture, the outcome, and what I would do differently.
          </p>
        </header>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studies.map((s) => (
            <Link
              key={s.slug}
              href={`/work/${s.slug}/`}
              className="group block rounded-lg border border-[var(--rule)] p-5 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="serif text-xl font-medium leading-tight group-hover:text-[var(--accent)] transition-colors">
                  {s.title}
                </h2>
                <span
                  aria-hidden
                  className="font-mono text-[10px] text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
                >
                  →
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--fg)]/75 leading-relaxed">
                {s.tagline}
              </p>
              {s.chips && s.chips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.chips.slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--fg)]/65"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
