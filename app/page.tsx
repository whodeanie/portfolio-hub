import Link from 'next/link';
import Stats from '../components/Stats';
import ProjectGrid from '../components/ProjectGrid';

const products = [
  {
    name: 'Paperloom Studio',
    tagline: 'AI generated puzzle, coloring, and information products. Live revenue.',
    href: 'https://kerryaiperson.gumroad.com'
  },
  {
    name: 'KerryPaperCo on Etsy',
    tagline: 'Storefront for printable AI assisted designs.',
    href: 'https://www.etsy.com/shop/KerryPaperCo'
  },
  {
    name: 'KDP Author Page',
    tagline: 'Eight plus published books on Amazon Kindle Direct Publishing.',
    href: 'https://www.amazon.com/s?k=kerry+dean'
  },
  {
    name: 'GitHub Organization',
    tagline: 'Thirty plus public repositories across AI, sports, and tooling.',
    href: 'https://github.com/whodeanie'
  }
];

const stack = 'python · typescript · anthropic · openai · langchain · pinecone · faiss · fastapi · next.js · aws · docker · n8n';

export default function Page() {
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16 sm:py-24">
      {/* HERO */}
      <section className="mx-auto max-w-prose">
        <div className="flex items-center gap-5 sm:gap-6">
          <img
            src="/headshot-square.jpg"
            alt="Kerry Dean Jr."
            width={80}
            height={80}
            className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full object-cover ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
          />
          <h1 className="serif text-5xl sm:text-6xl leading-[1.05] font-medium tracking-tight">
            Kerry Dean Jr.
          </h1>
        </div>
        <p className="mt-5 text-lg sm:text-xl leading-relaxed text-[var(--fg)]/85">
          AI Engineer. I ship production AI systems that move real money.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/contact" className="hover:opacity-70">
            Contact
          </Link>
          <span className="text-[var(--muted)]">·</span>
          <a href="https://github.com/whodeanie" target="_blank" rel="noreferrer" className="hover:opacity-70">
            GitHub
          </a>
          <span className="text-[var(--muted)]">·</span>
          <a href="/resume/" className="hover:opacity-70">
            Resume
          </a>
          <span className="text-[var(--muted)]">·</span>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="hover:opacity-70">
            PDF
          </a>
          <span className="text-[var(--muted)]">·</span>
          <a href="/play/" className="hover:opacity-70">
            Play
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          By the numbers
        </h2>
        <Stats />
      </section>

      {/* CAREER LINK (replaces accordion) */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          About my career
        </h2>
        <div className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
          <p>
            Nine plus years across federal AI, healthcare AI, and agtech.
            Currently shipping a multi product AI portfolio with live revenue.
          </p>
        </div>
        <div className="mt-6">
          <a
            href="/resume/"
            className="inline-flex items-baseline gap-3 rounded-lg border border-[var(--rule)] px-4 py-3 hover:border-[var(--accent)] transition-colors"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Read the full work history at /resume →
            </span>
          </a>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Selected work
        </h2>
        <p className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed">
          These are the production AI systems and tools I have shipped over the
          last year. The ones marked as case studies have writeups on this site
          covering the problem, the architecture, and what I would do
          differently. The rest link out to the GitHub repository or the live
          demo. If a project does not have a writeup yet, the README in the
          repository is the writeup.
        </p>
        <ProjectGrid />
      </section>

      {/* LIVE PRODUCTS */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Live products
        </h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-[var(--rule)] p-5 hover:border-[var(--accent)] transition-colors"
            >
              <div className="serif text-lg font-medium group-hover:text-[var(--accent)]">
                {p.name}
              </div>
              <div className="mt-2 text-sm text-[var(--fg)]/70 leading-relaxed">{p.tagline}</div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Visit ↗
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Stack
        </h2>
        <div className="mt-6 font-mono text-sm text-[var(--fg)]/80 leading-relaxed">
          {stack}
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          About
        </h2>
        <figure className="mt-8 mb-2 group">
          <img
            src="/headshot-square.jpg"
            alt="Portrait of Kerry Dean Jr."
            width={224}
            height={224}
            className="h-44 w-44 sm:h-56 sm:w-56 rounded-2xl object-cover border border-[var(--rule)] transition-all duration-200 group-hover:border-[var(--accent)] group-hover:shadow-[0_0_0_4px_rgba(166,115,64,0.12)]"
          />
        </figure>
        <div className="mt-8 prose-body text-[var(--fg)]/85 leading-relaxed">
          <p>
            I am a software engineer who fell hard into applied AI in 2024 and
            has not really come back out. Before that I spent the better part
            of a decade shipping production systems in places where mistakes
            had teeth: a federal agency processing complaints with audit
            requirements, a senior care provider operating inside the HIPAA
            boundary, an agtech platform whose users were making spray and
            irrigation decisions on the data my dashboards rendered. That
            background is the part of my brain I bring to every Generative AI
            project now.
          </p>
          <p>
            Day to day I build production AI systems. RAG pipelines that have
            to cite their sources, agentic workflows that orchestrate real tool
            calls and survive partial failure, document understanding pipelines
            that ingest the worst possible PDFs, evaluation harnesses that
            stop a model from regressing in the safety dimensions you actually
            care about. I am opinionated about evaluation, observability, and
            the unsexy edges (idempotency, retries, dead letter queues, cache
            keys) because that is the part of an AI system that determines
            whether it ships or quietly rots in a notebook.
          </p>
          <p>
            On the side I run a small portfolio of AI assisted digital
            products. A Gumroad storefront, an Etsy shop, an Amazon KDP author
            page, and a public GitHub organization with somewhere north of
            thirty repositories. The products are built with the same Claude
            Agent SDK and n8n patterns I write about, which means the case
            studies on this site are not theoretical. The pipelines are live,
            taking orders, and I am the one paged when they break.
          </p>
          <p>
            Recently I have been spending most of my time on three things. The
            first is the n8n agentic workflow library, which now spans 291
            workflows across 41 packs and is the most accessible way to learn
            the patterns I rely on. The second is the Claude skill suite,
            where I am turning the production patterns into reusable Claude
            Agent SDK skills with deterministic scaffolds and validation gates.
            The third is the live NBA playoff props product, which is a fun
            way to keep an honest scoreboard on a model in production. Every
            resolved pick gets published whether it hit or missed.
          </p>
          <p>
            I am open to senior AI Engineer roles where the team
            actually ships. I am especially interested in places that take
            evaluation seriously, that have at least one regulated surface in
            the product, and that have not given up on type safety. Contracts
            and full time roles are both fine. The fastest way to reach me is
            the email at the top of this page.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Contact
        </h2>
        <ul className="mt-8 space-y-3 text-lg">
          <li>
            <Link
              href="/contact"
              className="hover:text-[var(--accent)]"
            >
              Get in touch
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/whodeanie"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              github.com/whodeanie
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/kerrydeanjr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              linkedin.com/in/kerrydeanjr
            </a>
          </li>
          <li>
            <a href="/resume/" className="hover:text-[var(--accent)]">
              Full resume
            </a>
          </li>
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-prose mt-24 pt-10 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)]">
        <span>Built in May 2026. Hosted on Vercel.</span>
      </footer>
    </main>
  );
}
