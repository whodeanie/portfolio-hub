import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume. Kerry Dean Jr. AI Engineer",
  description:
    "Full work history. Nine plus years across federal AI, healthcare AI, agtech, and applied LLM systems. Production RAG, agentic workflows, FHIR, MCP, evaluation harnesses.",
  alternates: { canonical: "/resume" },
};

type Chip = { label: string; href: string; external?: boolean };

type Role = {
  range: string;
  company: string;
  location: string;
  title: string;
  summary: string;
  chips: Chip[];
};

const ROLES: Role[] = [
  {
    range: "June 2025 to November 2025",
    company: "Traverse Technologies",
    location: "Remote",
    title: "Senior Technical Lead",
    summary:
      "Led Dash, Traverse's corporate travel product. Owned the Choice Hotels integration, SSO and directory sync, plus a gated CI/CD pipeline for safer enterprise releases.",
    chips: [
      { label: "Portfolio site", href: "/" },
      {
        label: "Live Odds Aggregator (TS)",
        href: "https://github.com/whodeanie/live-odds-aggregator-ts",
        external: true,
      },
      {
        label: "Idempotent Webhook Gateway (n8n)",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
      {
        label: "AI Sports Content Engine",
        href: "https://github.com/whodeanie/ai-sports-content-engine-ts",
        external: true,
      },
    ],
  },
  {
    range: "June 2023 to February 2025",
    company: "WellBe Senior Medical",
    location: "Chicago, IL",
    title: "Senior Software Engineer",
    summary:
      "Owned Luminate, the clinical copilot for senior home visits. Built FHIR APIs, offline first sync, and predictive analytics inside the HIPAA boundary.",
    chips: [
      { label: "LLM Eval Healthcare", href: "/work/llm-eval-healthcare/" },
      {
        label: "Multimodal Doc Understanding (n8n)",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
      {
        label: "Paperloom Studio",
        href: "https://kerryaiperson.gumroad.com",
        external: true,
      },
      {
        label: "KerryPaperCo on Etsy",
        href: "https://www.etsy.com/shop/KerryPaperCo",
        external: true,
      },
    ],
  },
  {
    range: "June 2024 to December 2024",
    company: "FwdThink",
    location: "Remote",
    title: "Senior Generative AI Software Engineer",
    summary:
      "Designed production AI pipelines for a federal agency. Document understanding, an LLM case routing classifier, evidence analysis, and a procurement research RAG tool.",
    chips: [
      { label: "MCP RAG Starter", href: "/work/mcp-rag-starter/" },
      { label: "LLM Eval Healthcare", href: "/work/llm-eval-healthcare/" },
      {
        label: "n8n Agentic Workflows",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
      { label: "Federal RAG Writeup", href: "/work/fwdthink-rag-procurement/" },
    ],
  },
  {
    range: "May 2021 to June 2023",
    company: "Syngenta",
    location: "Chicago, IL",
    title: "Senior Software Engineer",
    summary:
      "Built field monitoring dashboards over satellite imagery and weather data. Contributed reusable map and grid components into Syngenta's open source UI library.",
    chips: [
      {
        label: "NFL Line Movement Tracker",
        href: "https://github.com/whodeanie/nfl-line-movement-tracker",
        external: true,
      },
      {
        label: "NBA Prop Predictor",
        href: "https://github.com/whodeanie/nba-prop-predictor",
        external: true,
      },
      {
        label: "Live Odds Aggregator",
        href: "https://github.com/whodeanie/live-odds-aggregator",
        external: true,
      },
      {
        label: "Live Game State Tracker",
        href: "https://github.com/whodeanie/live-game-state-tracker-ts",
        external: true,
      },
    ],
  },
  {
    range: "November 2020 to April 2021",
    company: "Argonne National Laboratory",
    location: "Chicago, IL",
    title: "Software Developer Consultant",
    summary:
      "Consulting engineer on a fleet electrification research project. Built Python ETL pipelines into Neo4j, the modeling tool, and the comparative TCO dashboard.",
    chips: [
      {
        label: "MLB Batter vs Pitcher",
        href: "https://github.com/whodeanie/mlb-batter-pitcher-matchup",
        external: true,
      },
      { label: "MCP RAG Starter", href: "/work/mcp-rag-starter/" },
      { label: "Ivy Offline Eval Toolkit", href: "/work/ivy-offline-toolkit/" },
      { label: "RAG Demo", href: "/play/" },
    ],
  },
  {
    range: "February 2018 to October 2020",
    company: "Enablon",
    location: "Chicago, IL",
    title: "Software Engineer",
    summary:
      "Shipped reporting features and integrations across Enablon's sustainability platform. Modernized legacy client deployments without breaking decade old report customizations.",
    chips: [
      {
        label: "Code Review Assistant (n8n)",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
      {
        label: "Idempotent Webhook Gateway (n8n)",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
    ],
  },
  {
    range: "October 2016 to January 2018",
    company: "Group O",
    location: "Iowa City, IA",
    title: "Software Developer",
    summary:
      "Built responsive B2B order routing apps and internal tools across React, Redux, Angular, and ASP.NET. Owned cross browser and mobile compatibility.",
    chips: [
      {
        label: "Kelly Bankroll Sizer (TS)",
        href: "https://github.com/whodeanie/kelly-bankroll-sizer-ts",
        external: true,
      },
      {
        label: "Lead Enrichment Pipeline (n8n)",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
    ],
  },
];

const AI_PROJECTS: { title: string; body: string }[] = [
  {
    title: "Claude Agent SDK Production Skills",
    body: "I authored five production Claude Agent SDK skills covering productized agentic workflow generation, procedural KDP publishing pipelines, an Etsy API client with image generation, and browser automation for KDP. Each skill follows a deterministic scaffold plus LLM hybrid: code for correctness critical paths, prompt engineering for niche discovery and copy, with retry, fallback, and validation gates between stages. The reusable kernel under the suite is open sourced as the claude-skill-template repository on GitHub, used as the starting point for every new skill in my own portfolio. The pattern has been stable enough that adding a new skill now takes a working day instead of a working week.",
  },
  {
    title: "Multi Marketplace AI Product Suite",
    body: "I designed and operate an end to end content generation pipeline that produces 50+ digital products across Gumroad, Etsy, and Amazon KDP, including coloring books, puzzle books, niche information PDFs, and n8n workflow packs. The stack pulls together the Anthropic Claude API, OpenAI GPT-4, LangChain, Pinecone, vector embeddings, image generation, and programmatic listing creation. Each product gets a generated cover, generated interior, generated metadata, and generated marketing copy in a single deterministic run. The storefront is live at kerryaiperson.gumroad.com and feeds the Etsy and Amazon listings off the same source of truth.",
  },
  {
    title: "n8n Agentic Workflow Library",
    body: "I built a library of agentic n8n workflow patterns covering function and tool calling, RAG retrieval, hybrid vector search, and multi step agent orchestration with first class error handling, retry policies, and integrations across Slack, Gmail, HubSpot, Airtable, Notion, OpenAI, and Anthropic. Each pack ships with per workflow setup docs, validation tests, and listing copy generated programmatically. The public showcase at github.com/whodeanie/n8n-agentic-workflows now spans 291 workflows across 41 packs, and the same library backs several of the products in the marketplace suite above.",
  },
];

const SKILLS = [
  { group: "Applied AI", items: "Generative AI, LLMs, Anthropic Claude API, Claude Agent SDK, OpenAI GPT-4, LangChain, LlamaIndex, Pinecone, Weaviate, FAISS, RAG, Hybrid retrieval, Vector search, Embeddings, Reranking, Prompt engineering, Function calling, Tool use, Agentic workflows, Fine tuning, Evaluation harnesses (LangSmith, Braintrust, Phoenix), Model Context Protocol (MCP)." },
  { group: "ML and data", items: "PyTorch, Hugging Face, MLflow, Databricks, Postgres, DynamoDB, BigQuery, Redis, Neo4j." },
  { group: "Languages", items: "Python, TypeScript, JavaScript, C#, Java, SQL, GraphQL, C/C++, Kotlin." },
  { group: "Web and product", items: "React, Next.js, Vue, Node, .NET, Entity Framework, ASP.NET, Spring, Flutter, Bootstrap." },
  { group: "Platform and ops", items: "AWS (Lambda, Bedrock, Rekognition, S3), Azure, Google Cloud, Docker, GitHub Actions, CircleCI, Firebase, Vercel, Git, Agile, Figma, Zapier." },
  { group: "Domain", items: "FHIR, HIPAA, federal AI, healthcare AI, sustainability and compliance, agronomy, sports and gaming." },
];

export default function ResumePage() {
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
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src="/headshot-square.jpg"
              alt="Kerry Dean Jr."
              width={72}
              height={72}
              className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-full object-cover ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
            />
            <h1 className="serif text-4xl sm:text-5xl leading-[1.05] font-medium tracking-tight">
              Kerry Dean Jr.
            </h1>
          </div>
          <p className="mt-4 text-lg text-[var(--fg)]/85">
            AI Engineer · 9+ years. Chicago, IL.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--fg)]/80">
            <Link href="/contact" className="hover:text-[var(--accent)]">
              Contact me
            </Link>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--fg)]/80">kdjsplash@gmail.com</span>
            <span className="text-[var(--muted)]">·</span>
            <a
              href="https://github.com/whodeanie"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              github.com/whodeanie
            </a>
            <span className="text-[var(--muted)]">·</span>
            <a
              href="https://www.linkedin.com/in/kerrydeanjr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              linkedin.com/in/kerrydeanjr
            </a>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-[var(--rule)] px-4 py-3 hover:border-[var(--accent)] transition-colors">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]"
            >
              Download PDF version ↓
            </a>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="mt-16 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Summary
          </h2>
          <p className="mt-6 text-[var(--fg)]/85 leading-relaxed prose-body">
            AI Engineer with nine plus years shipping production systems across
            federal, healthcare, and enterprise. The last two years have
            focused on Large Language Model products: Retrieval Augmented
            Generation, document understanding with GPT-4 and Claude, agentic
            systems with function calling and tool use, and clinical AI under
            FHIR and HIPAA. Currently shipping a Claude Agent SDK and n8n
            portfolio with custom Model Context Protocol servers and skills.
            Strong across agentic, RAG, embeddings, vector search, fine tuning,
            and evaluation. Available for senior AI Engineer roles.
          </p>
        </section>

        {/* EXPERIENCE TIMELINE */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Professional Experience
          </h2>
          <p className="mt-4 text-sm text-[var(--fg)]/65 leading-relaxed">
            Each role links to portfolio projects that show similar work in public.
          </p>

          <div className="mt-10 space-y-12">
            {ROLES.map((r) => (
              <article key={r.company + r.range} className="">
                <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="serif text-2xl font-medium leading-tight">
                    {r.company}
                  </h3>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    {r.range}
                  </div>
                </header>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm text-[var(--fg)]/70">
                  <span className="serif italic">{r.title}</span>
                  <span className="text-[var(--muted)]">·</span>
                  <span>{r.location}</span>
                </div>

                <p className="mt-4 text-[var(--fg)]/85 leading-relaxed">
                  {r.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.chips.map((c) => (
                    <a
                      key={c.label + c.href}
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] px-3 py-1 text-xs font-mono uppercase tracking-widest text-[var(--fg)]/70 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                      {c.label}
                      <span aria-hidden className="text-[var(--muted)]">
                        {c.external ? "↗" : "→"}
                      </span>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* EDUCATION */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Education
          </h2>
          <article className="mt-8">
            <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h3 className="serif text-2xl font-medium leading-tight">
                University of Iowa
              </h3>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                August 2012 to May 2016
              </div>
            </header>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm text-[var(--fg)]/70">
              <span className="serif italic">
                Bachelor of Science, Computer Science
              </span>
              <span className="text-[var(--muted)]">·</span>
              <span>Iowa City, IA</span>
            </div>
            <div className="mt-5 space-y-4 text-[var(--fg)]/85 leading-relaxed prose-body">
              <p>
                Coursework concentrated on algorithms, systems, and the theory
                of computation, with electives that pulled in databases,
                distributed systems, and the human computer interaction track.
                The rest of my time at Iowa was the usual mix of internships,
                side projects, and the kind of collaborative course work that
                shapes how an engineer learns to read other people&apos;s code.
                The degree gave me the foundational pieces that have carried
                into every role since: how to reason about correctness, how to
                break a system into smaller systems, and how to recognize that
                most production problems are old problems wearing new clothes.
              </p>
            </div>
          </article>
        </section>

        {/* SELECTED AI PROJECTS */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Selected AI Projects (Independent, 2025 to 2026)
          </h2>
          <p className="mt-4 text-sm text-[var(--fg)]/70 leading-relaxed">
            Projects shipped outside any employer over the last twelve months.
            Live revenue, live storefronts, public repositories.
          </p>

          <div className="mt-10 space-y-12">
            {AI_PROJECTS.map((p) => (
              <article key={p.title}>
                <h3 className="serif text-xl font-medium leading-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-[var(--fg)]/85 leading-relaxed prose-body">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Skills
          </h2>
          <div className="mt-8 space-y-5 text-[var(--fg)]/85 leading-relaxed prose-body">
            {SKILLS.map((s) => (
              <p key={s.group}>
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)] mr-3">
                  {s.group}
                </span>
                <span>{s.items}</span>
              </p>
            ))}
          </div>
        </section>

        <footer className="mt-24 pt-10 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="hover:text-[var(--accent)]">
            ← Back to home
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--accent)]"
          >
            Download PDF ↓
          </a>
        </footer>
      </div>
    </main>
  );
}
