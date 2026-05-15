import Link from 'next/link';
import BentoHero from '../components/BentoHero';
import ScrollReveal from '../components/ScrollReveal';
import ProjectGrid from '../components/ProjectGrid';

const products = [
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

const STACK_CATEGORIES = [
  {
    title: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'C# / .NET', 'Java', 'Kotlin', 'C / C++', 'SQL']
  },
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'Redux', 'Vue.js', 'Angular', 'Tailwind CSS', 'Bootstrap']
  },
  {
    title: 'Backend',
    items: ['Node.js', 'ASP.NET', 'Entity Framework', 'Spring', 'GraphQL', 'REST APIs']
  },
  {
    title: 'Mobile',
    items: ['Flutter', 'Kotlin']
  },
  {
    title: 'Databases',
    items: ['Postgres', 'DynamoDB', 'BigQuery', 'Redis', 'Neo4j', 'MongoDB', 'SQL Server', 'Firebase']
  },
  {
    title: 'Cloud',
    items: ['AWS Lambda', 'AWS Bedrock', 'AWS Rekognition', 'AWS S3', 'Microsoft Azure', 'Google Cloud Platform', 'Vercel']
  },
  {
    title: 'DevOps and CI',
    items: ['Docker', 'GitHub Actions', 'CircleCI', 'Git', 'CI/CD pipelines']
  },
  {
    title: 'AI and LLM',
    items: ['Anthropic Claude', 'Claude Agent SDK', 'OpenAI GPT-4', 'Google Gemini', 'Antigravity', 'LangChain', 'LlamaIndex', 'Model Context Protocol', 'n8n']
  },
  {
    title: 'Retrieval and Vector',
    items: ['Pinecone', 'Weaviate', 'FAISS', 'RAG', 'Hybrid retrieval', 'Embeddings', 'Reranking']
  },
  {
    title: 'ML and Evaluation',
    items: ['PyTorch', 'Hugging Face', 'MLflow', 'Databricks', 'LangSmith', 'Braintrust', 'Phoenix']
  },
  {
    title: 'Healthcare and Domain',
    items: ['FHIR', 'HIPAA']
  },
  {
    title: 'Integrations',
    items: ['Slack', 'Gmail', 'HubSpot', 'Airtable', 'Notion', 'Zapier']
  }
];

export default function Page() {
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16 sm:py-24">
      {/* BENTO HERO */}
      <section className="mx-auto max-w-7xl">
        <BentoHero />
      </section>

      {/* CAREER SUMMARY */}
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
          <Link
            href="/resume/"
            className="inline-flex items-baseline gap-3 rounded-lg border border-[var(--rule)] px-4 py-3 hover:border-[var(--accent)] transition-colors"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Read the full work history at /resume →
            </span>
          </Link>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-7xl mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Selected work
        </h2>
        <p className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed max-w-prose">
          These are the production AI systems and tools I have shipped over the last year. The ones marked as case studies have writeups on this site covering the problem, the architecture, and what I would do differently. The rest link out to the GitHub repository or the live demo.
        </p>
        <ScrollReveal>
          <div className="mt-8">
            <ProjectGrid />
          </div>
        </ScrollReveal>
      </section>

      {/* TECH STACK */}
      <section className="mx-auto max-w-4xl mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Tech stack
        </h2>
        <p className="mt-6 prose-body text-[var(--fg)]/85 leading-relaxed max-w-prose">
          Nine plus years of shipping has accumulated a deep stack. The categories below cover what I have actually used in production, not a wish list. Full stack across web, mobile, data, and AI.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          {STACK_CATEGORIES.map((cat) => (
            <ScrollReveal key={cat.title}>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent)] mb-3">
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs px-3 py-1.5 rounded-md border border-[var(--rule)] text-[var(--fg)]/85 hover:border-[var(--accent)] transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* LIVE PRODUCTS */}
      <section className="mx-auto max-w-prose mt-24 section-rule pt-14">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Live products
        </h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <ScrollReveal key={p.name}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-[var(--rule)] p-5 hover:border-[var(--accent)] hover:shadow-[0_4px_12px_rgba(166,115,64,0.1)] hover:-translate-y-0.5 transition-all"
              >
                <div className="serif text-lg font-medium group-hover:text-[var(--accent)]">
                  {p.name}
                </div>
                <div className="mt-2 text-sm text-[var(--fg)]/70 leading-relaxed">{p.tagline}</div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  Visit ↗
                </div>
              </a>
            </ScrollReveal>
          ))}
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
            I am a software engineer with the better part of a decade
            shipping production systems in places where mistakes had teeth: a
            federal agency processing complaints with audit requirements, a
            senior care provider operating inside the HIPAA boundary, an
            agtech platform whose users were making spray and irrigation
            decisions on the data my dashboards rendered. That same
            engineering muscle is what I bring to every Generative AI system
            I build today.
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
            products. An Amazon KDP author page with eight plus published
            books, and a public GitHub organization with somewhere north of
            thirty repositories. The products are built with the same Claude
            Agent SDK and n8n patterns I write about, which means the case
            studies on this site are not theoretical. The pipelines are live,
            taking orders, and I am the one paged when they break.
          </p>
          <p>
            Recently I have been spending most of my time on three things. The
            first is an n8n agentic workflow library that packages the
            production patterns I rely on so other teams can pick them up
            without rediscovering the rough edges. The second is the Claude
            skill suite, where I am turning the same patterns into reusable
            Claude Agent SDK skills with deterministic scaffolds and
            validation gates. The third is the live NBA playoff props
            product, which is a fun way to keep an honest scoreboard on a
            model in production. Every resolved pick gets published whether
            it hit or missed.
          </p>
          <p>
            I am open to senior Software Engineer roles where the team
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
            <Link href="/resume/" className="hover:text-[var(--accent)]">
              Full resume
            </Link>
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
