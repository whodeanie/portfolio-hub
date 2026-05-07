import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Mermaid from "../../../components/Mermaid";
import CaseStudyTOC from "../../../components/CaseStudyTOC";
import { CASE_STUDIES, CASE_STUDY_SLUGS, SECTIONS } from "../case-studies";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const study = CASE_STUDIES[params.slug];
  if (!study) return {};
  return {
    title: `${study.title}. Case study by Kerry Dean Jr.`,
    description: study.tagline,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: {
      title: `${study.title}. Case study`,
      description: study.tagline,
      url: `https://kerrydean-hub.vercel.app/work/${study.slug}`,
      type: "article",
    },
  };
}

export default function CaseStudyPage({ params }: { params: Params }) {
  const study = CASE_STUDIES[params.slug];
  if (!study) notFound();

  return (
    <main className="min-h-screen px-6 sm:px-8 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* Mobile TOC, sticky to top of viewport */}
        <div className="lg:hidden mb-6">
          <CaseStudyTOC sections={SECTIONS} variant="mobile" />
        </div>

        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to all work
        </a>

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_220px] lg:gap-16">
          <article>
            {/* HERO */}
            <header>
              <h1 className="serif text-4xl sm:text-5xl leading-[1.05] font-medium tracking-tight">
                {study.title}
              </h1>
              <p className="mt-5 serif italic text-xl text-[var(--fg)]/80 leading-snug">
                {study.tagline}
              </p>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {study.chips.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {study.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noreferrer" : undefined}
                    className="rounded-md border border-[var(--accent)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
                  >
                    {l.label} {l.external ? "↗" : "→"}
                  </a>
                ))}
              </div>
            </header>

            {/* PROBLEM */}
            <section
              id="problem"
              className="mt-16 section-rule pt-12 scroll-anchor"
            >
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                The problem
              </h2>
              <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.problem.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* APPROACH */}
            <section
              id="approach"
              className="mt-16 section-rule pt-12 scroll-anchor"
            >
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                The approach
              </h2>
              <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.approach.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* ARCHITECTURE */}
            <section
              id="architecture"
              className="mt-16 section-rule pt-12 scroll-anchor"
            >
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                Architecture
              </h2>
              <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.architecture.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Mermaid
                chart={study.architecture.diagram.source}
                caption={study.architecture.diagram.caption}
              />
              <div className="prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.architecture.after.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* OUTCOME */}
            <section
              id="outcome"
              className="mt-16 section-rule pt-12 scroll-anchor"
            >
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                Outcome
              </h2>
              <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.outcome.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* WHAT'S NEXT */}
            <section
              id="next"
              className="mt-16 section-rule pt-12 scroll-anchor"
            >
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                What I&apos;d do differently
              </h2>
              <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
                {study.next.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            <footer className="mt-20 pt-10 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
              <a href="/" className="hover:text-[var(--accent)]">
                ← Back to all work
              </a>
              <a href="/resume/" className="hover:text-[var(--accent)]">
                Read the full resume →
              </a>
            </footer>
          </article>

          <aside className="hidden lg:block">
            <CaseStudyTOC sections={SECTIONS} variant="desktop" />
          </aside>
        </div>
      </div>
    </main>
  );
}
