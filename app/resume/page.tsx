import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "../../components/TrackedLink";

export const metadata: Metadata = {
  title: "Resume. Kerry Dean Jr. Software Engineer",
  description:
    "Full work history. Nine plus years across federal AI, healthcare AI, agtech, and applied LLM systems. Production RAG, agentic workflows, FHIR, MCP, evaluation harnesses.",
  alternates: { canonical: "/resume" },
};

type Role = {
  range: string;
  company: string;
  location: string;
  title: string;
  summary: string;
  bullets?: string[];
};

const ROLES: Role[] = [
  {
    range: "June 2025 to December 2025",
    company: "Traverse Technologies",
    location: "Remote",
    title: "Senior Technical Lead (Contract)",
    summary:
      "Six month contract engagement leading engineering on Dash, Traverse's corporate travel product. Engagement ended at end of contract scope.",
    bullets: [
      "Owned the partner integration with Choice Hotels, a high stakes booking and inventory contract. Designed the partner API contract, built availability search and booking confirmation, handled rate mapping and loyalty sync, and coordinated the phased rollout across enterprise accounts.",
      "Shipped SSO and directory sync against Okta and Azure AD on TypeScript/React with C#/.NET services, keeping enterprise lifecycle in lockstep with airline partners and corporate identity systems.",
      "Strengthened release safety by adding a gated CI/CD pipeline on GitHub Actions and Docker with automated tests, environment specific configs, and deployment gates that lifted developer velocity across the team.",
    ],
  },
  {
    range: "June 2023 to February 2025",
    company: "WellBe Senior Medical",
    location: "Chicago, IL",
    title: "Senior Software Engineer",
    summary:
      "Senior engineer on Luminate, the clinical copilot for senior home visits.",
    bullets: [
      "Owned FHIR API design and implementation exchanging eligibility, claims history, and visit documentation with payer and health plan systems for care coordination across the patient journey.",
      "Built offline first tablet sync for providers running standardized clinical assessments inside senior patient homes with unreliable connectivity, syncing back to AWS when service returned.",
      "Implemented predictive analytics for proactive patient care inside a HIPAA compliant audit log boundary covering every model invocation and PHI access path.",
      "Led a team of seven engineers shipping the Luminate platform end to end across .NET Entity Framework, TypeScript, Python, Firebase, and AWS.",
    ],
  },
  {
    range: "June 2024 to December 2024",
    company: "FwdThink",
    location: "Remote",
    title: "Senior Generative AI Software Engineer",
    summary:
      "Led production AI pipelines for a federal agency processing EEO complaints and procurement research at federal scale.",
    bullets: [
      "Cut intake backlog from weeks to hours by building a document understanding pipeline that OCRs scanned forms and photographed statements via AWS Rekognition, then extracts complaint type, parties, alleged violations, and requested remedies through GPT-4 with a typed schema.",
      "Replaced manual triage with an LLM case routing classifier that paired each queue assignment with an auditable justification reviewers could accept or reject, with citation provenance carried through every stage.",
      "Compressed multi day procurement desk research to seconds by indexing contract databases, solicitation documents, and market reports into a vector store with chunk level citation provenance and sourced answers paired with a structured contract table.",
      "Shipped an evidence analysis module that surfaces salient passages from emails, photos, and personnel records with citations back to the source document, eliminating the first day investigators previously spent reading supporting material.",
    ],
  },
  {
    range: "May 2021 to June 2023",
    company: "Syngenta",
    location: "Chicago, IL",
    title: "Senior Software Engineer",
    summary:
      "Senior engineer on global agtech analytics platforms serving real time decisions to agronomists in the field.",
    bullets: [
      "Reduced agronomist time to field insight by shipping a satellite imagery and weather overlay dashboard on interactive maps zooming from regional view down to individual field boundaries.",
      "Contributed reusable map, virtualized data grid, and chart components into Syngenta's open source React UI library now used across the organization.",
      "Built backend analytics on Python, AWS Lambda, GraphQL, and DynamoDB powering real time decisions for farmers optimizing yields and managing risk.",
    ],
  },
  {
    range: "November 2020 to April 2021",
    company: "Argonne National Laboratory",
    location: "Chicago, IL",
    title: "Software Developer Consultant",
    summary:
      "Consulting engineer on a federal fleet electrification research project.",
    bullets: [
      "Built Python ETL pipelines into Neo4j pulling EPA emissions data, fleet telemetry, and EIA carbon intensity feeds for graph based scenario analysis at federal research scale.",
      "Shipped the fleet electrification modeling tool researchers used to simulate emissions impact and infrastructure requirements of transitioning fleets to electric vehicles.",
      "Built the comparative TCO dashboard fleet managers used to build the business case for electrification under federal environmental policy goals.",
    ],
  },
  {
    range: "February 2018 to October 2020",
    company: "Enablon",
    location: "Chicago, IL",
    title: "Software Engineer",
    summary:
      "Software engineer on Enablon's sustainability and compliance platform serving global enterprise customers.",
    bullets: [
      "Shipped sustainability and compliance reporting features across the platform on React, Redux, TypeScript, Node.js, C#, AWS, and SQL Server.",
      "Modernized legacy client deployments without breaking decade old report customizations, a careful backward compatibility exercise across enterprise tenants.",
      "Owned complex data integrations and backend services bridging frontend surfaces and cloud resources for a global team aligning to enterprise sustainability objectives.",
    ],
  },
  {
    range: "October 2016 to January 2018",
    company: "Group O",
    location: "Iowa City, IA",
    title: "Software Developer",
    summary:
      "Software developer on B2B order routing apps and internal tools.",
    bullets: [
      "Built responsive web applications on React, Redux, Angular, Java, and Bootstrap with full cross browser and mobile compatibility.",
      "Shipped backend services on ASP.NET, C#, SQL Server, MongoDB, and PHP supporting seamless data integration across customer facing surfaces.",
      "Translated business requirements from stakeholders into shipped software and tuned application performance with targeted optimizations.",
    ],
  },
];

const AI_PROJECTS: { title: string; body: string; link?: { href: string; label: string; external?: boolean } }[] = [
  {
    title: "mcp-rag-starter",
    body: "Public MCP server packaging hybrid RAG (BM25 plus vector with reciprocal rank fusion), citation enforcement, and an eval harness that gates every deploy.",
    link: { href: "/work/mcp-rag-starter/", label: "Case study" },
  },
  {
    title: "Claude Agent SDK skill suite",
    body: "Four production skills (puzzle books, coloring books, KDP browser automation, niche PDFs) sharing a deterministic kernel. Open source template on GitHub.",
    link: { href: "/work/claude-skill-suite/", label: "Case study" },
  },
  {
    title: "n8n agentic workflow library",
    body: "Public library of 41 agentic n8n packs across function calling, RAG, hybrid vector search, and an idempotent webhook gateway. Integrations across Slack, Gmail, HubSpot, Airtable, OpenAI, and Anthropic.",
    link: { href: "/work/n8n-workflow-library/", label: "Case study" },
  },
  {
    title: "AI product publishing suite",
    body: "End to end pipeline producing 50 plus digital products live on Amazon KDP. One Pydantic schema drives the cover, interior, metadata, and listing copy from a single source of truth.",
    link: { href: "https://www.amazon.com/s?k=kerry+dean", label: "KDP catalog", external: true },
  },
  {
    title: "NBA Predict Pro",
    body: "Calibrated voting and stacking ensemble (logistic regression, random forest, XGBoost) over multi season NBA data. Brier 0.218 on held out. Llama 3.3 70B writes the risk note per pick.",
    link: { href: "/work/nba-playoff-props/", label: "Case study" },
  },
  {
    title: "Track Meet Tracker",
    body: "Fan facing schedule for elite track and field with an iCal subscription feed. Weekly AI brief in my voice generated off a refreshed seed dataset.",
    link: { href: "/work/track-meet-tracker/", label: "Case study" },
  },
  {
    title: "Quant Signal Engine",
    body: "Walk forward backtester for three classic strategies (RSI, MA crossover, Bollinger) with capped Kelly sizing on a Next.js dashboard. Llama 3.3 70B writes regime aware commentary per run. Educational only.",
    link: { href: "https://github.com/whodeanie/quant-signal-engine", label: "Public repo", external: true },
  },
];

const SKILLS = [
  { group: "Applied AI", items: "Generative AI, LLMs, Anthropic Claude API, Claude Agent SDK, OpenAI GPT-4, Google Gemini (1.5 Pro, 2.0 Flash), Antigravity (Google AI agent IDE), LangChain, LlamaIndex, Pinecone, Weaviate, FAISS, RAG, Hybrid retrieval, Vector search, Embeddings, Reranking, Prompt engineering, Function calling, Tool use, Agentic workflows, Fine tuning, Evaluation harnesses (LangSmith, Braintrust, Phoenix), Model Context Protocol (MCP)." },
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
            Software Engineer · 9+ years. Chicago, IL.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--fg)]/80">
            <Link href="/contact" className="hover:text-[var(--accent)]">
              Contact me
            </Link>
            <span className="text-[var(--muted)]">·</span>
            <TrackedLink
              href="/resume.pdf"
              kind="resume_pdf"
              source="resume_header"
              className="hover:text-[var(--accent)]"
            >
              Download PDF
            </TrackedLink>
            <span className="text-[var(--muted)]">·</span>
            <TrackedLink
              href="https://github.com/whodeanie"
              kind="github"
              source="resume_header"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              github.com/whodeanie
            </TrackedLink>
            <span className="text-[var(--muted)]">·</span>
            <TrackedLink
              href="https://www.linkedin.com/in/kerrydeanjr"
              kind="linkedin"
              source="resume_header"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              linkedin.com/in/kerrydeanjr
            </TrackedLink>
          </div>

          <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-[var(--rule)] px-4 py-3 hover:border-[var(--accent)] transition-colors">
            <TrackedLink
              href="/resume.pdf"
              kind="resume_pdf"
              source="resume_callout"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]"
            >
              Download PDF version ↓
            </TrackedLink>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="mt-16 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Summary
          </h2>
          <p className="mt-6 text-[var(--fg)]/85 leading-relaxed prose-body">
            AI Engineer with nine plus years shipping production systems across
            federal, healthcare, and enterprise. Last two years on Large
            Language Model products: production RAG behind a Model Context
            Protocol server, document understanding under federal evidence and
            audit constraints, agentic workflows with function calling and tool
            use, and clinical AI inside the FHIR and HIPAA boundary. Currently
            shipping a Claude Agent SDK and n8n portfolio with custom MCP
            servers and skills. Strong across agentic, RAG, embeddings, vector
            search, fine tuning, and evaluation. Available for senior AI
            Engineer and Software Engineer roles.
          </p>
        </section>

        {/* PROFESSIONAL EXPERIENCE (full chronology, work-only, no personal project links) */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Professional Experience
          </h2>
          <p className="mt-4 text-sm text-[var(--fg)]/65 leading-relaxed">
            Full chronological history.
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

                {r.bullets && r.bullets.length > 0 && (
                  <ul className="mt-4 space-y-3 text-[var(--fg)]/85 leading-relaxed list-disc pl-5">
                    {r.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* PERSONAL PROJECTS (separate section, after work history, short teasers) */}
        <section className="mt-20 section-rule pt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Personal projects, 2025 to 2026
          </h2>
          <p className="mt-4 text-sm text-[var(--fg)]/65 leading-relaxed">
            Things I have shipped on my own time. Full write ups live on the
            project pages.
          </p>

          <div className="mt-10 space-y-8">
            {AI_PROJECTS.map((p) => (
              <article key={p.title}>
                <h3 className="serif text-xl font-medium leading-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-[var(--fg)]/85 leading-relaxed">
                  {p.body}
                </p>
                {p.link && (
                  <a
                    href={p.link.href}
                    target={p.link.external ? "_blank" : undefined}
                    rel={p.link.external ? "noreferrer" : undefined}
                    className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:underline"
                  >
                    {p.link.label}
                    <span aria-hidden>{p.link.external ? "↗" : "→"}</span>
                  </a>
                )}
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
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--accent)]/40 text-[var(--accent)]">
                Academic All Big Ten Student Athlete
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--fg)]/75">
                Iowa Hawkeyes Track &amp; Field, 2012 to 2016
              </span>
            </div>
            <div className="mt-5 space-y-4 text-[var(--fg)]/85 leading-relaxed prose-body">
              <p>
                Four year scholarship student athlete on the Iowa Hawkeyes
                track and field team, specializing in long jump and triple
                jump. Earned Academic All Big Ten recognition while training
                and competing at the Division One level. Triple jump 14.84m at
                the Big Ten Championships, ranked among the top in Iowa
                program history. Long jump 7.00m.
              </p>
              <p>
                Coursework concentrated on algorithms, systems, and the theory
                of computation, with electives that pulled in databases,
                distributed systems, and the human computer interaction track.
                The rest of my time at Iowa was the usual mix of internships,
                side projects, and the kind of collaborative course work that
                shapes how an engineer learns to read other people&apos;s code.
                Outside the classroom and the track I was also a member of a
                Greek life fraternity at Iowa, which is where a lot of the
                leadership, networking, and time management instincts that
                later carried into engineering team work were sharpened.
              </p>
              <p>
                The degree gave me the foundational pieces that have carried
                into every role since: how to reason about correctness, how to
                break a system into smaller systems, and how to recognize that
                most production problems are old problems wearing new clothes.
              </p>
            </div>
          </article>
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
          <TrackedLink
            href="/resume.pdf"
            kind="resume_pdf"
            source="resume_footer"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--accent)]"
          >
            Download PDF ↓
          </TrackedLink>
        </footer>
      </div>
    </main>
  );
}
