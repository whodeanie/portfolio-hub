export type Section = {
  id: string;
  label: string;
  paragraphs?: string[];
  diagram?: { source: string; caption?: string };
  diagramAfter?: string[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  tagline: string;
  chips: string[];
  links: { label: string; href: string; external?: boolean }[];
  problem: string[];
  approach: string[];
  architecture: {
    intro: string[];
    diagram: { source: string; caption?: string };
    after: string[];
  };
  outcome: string[];
  next: string[];
};

export const SECTIONS: { id: string; label: string }[] = [
  { id: "problem", label: "Problem" },
  { id: "approach", label: "Approach" },
  { id: "architecture", label: "Architecture" },
  { id: "outcome", label: "Outcome" },
  { id: "next", label: "What I'd do differently" },
];

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "mcp-rag-starter": {
    slug: "mcp-rag-starter",
    title: "MCP RAG Starter",
    tagline:
      "Production grade Retrieval Augmented Generation packaged as a Model Context Protocol server.",
    chips: ["MCP", "RAG", "BM25", "Vector search", "Eval", "Python"],
    links: [
      {
        label: "View repo on GitHub",
        href: "https://github.com/whodeanie/mcp-rag-starter",
        external: true,
      },
    ],
    problem: [
      "RAG has a discovery problem. Most teams build their first Retrieval Augmented Generation pipeline as a custom Python script that calls into a vector database, then realize three months later that they need to swap the retrieval implementation, add citation tracking, run evaluations against a fixture set, and expose the same retrieval surface to a different application. The custom script becomes the bottleneck. Every team rebuilds the same scaffolding from scratch and quietly arrives at slightly different opinions about what production grade actually means.",
      "The Model Context Protocol fixes the surface area problem because any MCP compatible client can talk to the server. It does not solve the harder problem underneath, which is what a production grade retrieval pipeline actually looks like inside that server. Most public RAG examples stop at the educational version (embed the document, do a similarity search, paste the top three chunks into the prompt). The production version has to deal with hybrid retrieval that mixes lexical and semantic signals, citation provenance that survives chunk merging and prompt formatting, an evaluation harness so the answer quality does not silently regress, and operational concerns like ingestion idempotency and cache keys.",
      "Existing tools fall short on different axes. LangChain RAG templates are flexible to the point of imposing no opinion at all, which means every project has to reinvent the same defaults. LlamaIndex has stronger primitives but the production surface area is still up to the user. The available MCP starter scaffolds focus on protocol wiring, not on the substance of retrieval underneath. None of them ship with an evaluation harness as a first class citizen.",
      "Success looks like this. A developer clones this repository, runs one command, points it at a folder of documents, and has a working hybrid retrieval pipeline that they can call from Claude Desktop, Cursor, or any MCP client, with citations they can trust and an evaluation suite they can extend.",
    ],
    approach: [
      "The retrieval layer blends BM25 lexical search with dense vector search. BM25 catches the queries where exact terms matter (acronyms, identifiers, names that did not survive embedding). Dense vectors catch the queries where meaning matters more than form. The two scores get combined with a reciprocal rank fusion step rather than a learned reweighting, because reciprocal rank fusion is robust to the absolute score scales of the two retrieval modes and does not require offline calibration.",
      "Citation tracking lives at the chunk level. Every chunk carries its source document path, page number, and character offsets, and those values survive every transformation in the pipeline. When the language model produces an answer, the prompt format requires it to cite by chunk identifier, and the server resolves those identifiers back to source provenance before returning the response. The prompt is structured so that uncited assertions are explicitly flagged in the output rather than silently passed through. A reviewer reading the output can always trace the claim to a span in a source document.",
      "The evaluation harness uses a fixture set of question and answer pairs, runs them through the pipeline, and scores the output on three axes. Retrieval quality asks whether the right document was retrieved at all. Citation accuracy asks whether the answer cites the right chunk. Faithfulness asks whether the answer matches what the cited chunk actually says. The harness is a command line interface that reports a delta against the last green run, so a regression shows up as a red number on a pull request.",
      "I considered two alternatives that I rejected. The first was a learned reranker on top of the hybrid retrieval. The latency cost was too high for the marginal win on the evaluation set, and a learned reranker introduces a model that has to be retrained as the corpus shifts. The second was generating embeddings on every query rather than caching them at ingestion. The cost economics did not work for a starter that other people have to operate. Static embeddings, periodically refreshed, is the right default. The model layer is intentionally swappable. The default is OpenAI embeddings paired with Anthropic generation, but the embedding and generation calls go through a thin adapter so the pipeline runs the same against local models, against Bedrock, or against any other hosted provider.",
    ],
    architecture: {
      intro: [
        "The server boots, scans the configured corpus directory, chunks each document, embeds each chunk, indexes the chunks into both a vector store and a lexical index, and persists provenance for every chunk. At query time, the MCP client sends a question, the server runs hybrid retrieval, ranks the results via reciprocal rank fusion, formats a prompt that mandates citations, and returns the model output with the resolved provenance attached.",
      ],
      diagram: {
        source: `flowchart TB
    A[Document corpus] --> B[Chunker]
    B --> C[Embedding adapter]
    B --> D[BM25 index]
    C --> E[Vector store]
    F[MCP client] -->|query| G[RAG server]
    G --> D
    G --> E
    D --> H[RRF fusion]
    E --> H
    H --> I[Prompt with mandated citations]
    I --> J[Generation adapter]
    J --> K[Answer + resolved provenance]
    K --> F
    L[Eval fixtures] -.->|CLI run| G
    G -.->|scores| M[Eval report]`,
        caption: "Ingestion pipeline (top), query pipeline (middle), evaluation harness (bottom).",
      },
      after: [
        "The unsexy parts are where most of the engineering went. Ingestion is idempotent at the document hash, so re running ingestion on a rebuilt cache is a no operation when nothing has changed. Cache keys for embeddings include the model identifier and a corpus version, so swapping the embedding model invalidates the cache without manual intervention. Errors during retrieval (vector store unreachable, lexical index corrupt) surface as MCP errors with enough detail that the calling client can recover and retry. Observability includes per query traces with timing breakdowns, so when the pipeline gets slow it is obvious which stage to look at.",
      ],
    },
    outcome: [
      "The starter went up as an open source repository and is now the substrate for several of my internal RAG projects. The evaluation harness has caught a real regression already. A chunking change quietly halved retrieval quality on a class of queries that the integration tests did not cover, and the evaluation delta on the pull request was the only signal that anything was wrong. Deploy time from clone to working server is in the range of minutes for a small corpus, hours for a larger one, mostly bound by embedding throughput.",
      "The MCP surface itself has been the most useful design decision. Once the retrieval pipeline sits behind MCP, every Claude Desktop conversation can use it, every Cursor agent can use it, and any future MCP client gets the same retrieval substrate for free. The protocol gives the same retrieval pipeline reach into wherever the user actually does their work, instead of locking it into a single application surface.",
    ],
    next: [
      "The next iteration is going to swap the file based vector store for a real one (Postgres with pgvector is the leading candidate) so that ingestion can scale past the in memory chunk count this version comfortably handles. I would also like to add a reranker as an optional stage rather than as the default, gated behind a configuration flag, so that users who have a reranker available can opt in without paying the latency by default. The evaluation harness needs more rigorous statistical treatment (currently it produces single point comparisons; it should produce confidence intervals over multiple runs) before it graduates from useful gate to publishable benchmark.",
    ],
  },

  "n8n-workflow-library": {
    slug: "n8n-workflow-library",
    title: "n8n Agentic Workflow Library",
    tagline:
      "Production agentic workflow patterns for retrieval, agents, and the unsexy edges in between.",
    chips: ["n8n", "Agentic", "OpenAI", "Anthropic", "Pinecone", "Slack"],
    links: [
      {
        label: "View library on GitHub",
        href: "https://github.com/whodeanie/n8n-agentic-workflows",
        external: true,
      },
    ],
    problem: [
      "Most n8n content on the internet is a screenshot. A workflow that reads a CSV, calls OpenAI, writes a row to a Google Sheet. It works on the demo data, on the demo email, on the demo calendar. It falls over the first time a real customer sends an attachment that is not a PDF, the first time the OpenAI call returns a malformed function argument, the first time an upstream webhook delivers the same event twice in a row. The pattern library that the demo workflow implies is incomplete in exactly the places that matter when an agentic workflow has to run in production.",
      "Teams adopting n8n at scale hit the same set of problems. They need retrieval workflows where citations are not optional. They need tool calling agents that survive a JSON schema mismatch in the model output. They need ingestion gateways that deduplicate, that retry, that carry idempotency keys across the boundaries of multiple downstream services. They need evaluation workflows that gate prompt changes before deploy. They need to pull all of this together with first class observability, because a workflow you cannot debug at three in the morning is a workflow you cannot trust.",
      "The official examples cover the first ten percent of the problem space. The community examples cover a different ten percent, often without the operational rigor a production team needs. The remaining eighty percent is what every n8n team rediscovers on its own, in the gap between first prototype and first real customer. The library exists to compress that gap.",
    ],
    approach: [
      "The library is organized as 41 packs, each pack containing a small family of workflows that solve a single problem class. There is a pack for retrieval (lexical, dense, hybrid, with and without reranking), a pack for tool using agents (single step, multi step, with retries, with structured output validation), a pack for the unsexy gateway problems (idempotent webhooks, dead letter queues, replay, batched writes), a pack for evaluation harnesses, and so on. Inside each pack the workflows progress from minimal through production grade, so that a reader can study the difference between the educational version and the operational one.",
      "Every workflow ships with three artifacts. The first is the n8n workflow JSON itself, importable into a fresh installation. The second is a README that explains the problem the workflow solves, the design decisions encoded in it, and the observable failure modes that an operator should expect. The third is a fixture pack that the validation tests use, so that a contributor changing the workflow can immediately see whether they broke the contract the workflow was promising. The contract is the thing that distinguishes a production workflow from a demo workflow.",
      "I wrote the workflows from a strong opinion. Tool calling agents always validate the model output against a schema before acting on it; an agent that hands a bad JSON object to the next stage is an agent that produces incidents in the middle of the night. Retrieval workflows always carry citation provenance through to the final answer. Webhook ingestion always has an idempotency key strategy and a documented dead letter path. Evaluation workflows always store the score against a fixture identifier and a workflow version, so that score deltas across runs are meaningful. These opinions are documented in the per pack READMEs so a reader can disagree with them and choose differently if they want.",
      "The library also includes the marketing and documentation infrastructure for the packs. Listing copy is generated programmatically from the per workflow READMEs, which means a new workflow becomes a new listable product with no separate copy work. The same pipeline backs the public showcase repository.",
    ],
    architecture: {
      intro: [
        "The repository layout encodes the structure. Each pack is a directory. Inside the directory live the workflow JSON files, a README, a fixtures folder, and a tests folder. A small test runner sits at the repository root, walks the packs, runs the validation suite, and reports a summary. The CI pipeline runs the same test runner on every push, so a workflow regression is a red build.",
      ],
      diagram: {
        source: `flowchart LR
    A[Pack directory] --> B[Workflow JSON]
    A --> C[README]
    A --> D[Fixtures]
    A --> E[Tests]
    F[Test runner] --> A
    F --> G[CI pipeline]
    A --> H[Listing copy generator]
    H --> I[KDP listing]
    H --> J[Public showcase]`,
        caption: "Pack as the unit of distribution. Tests, fixtures, and listing copy generated from the same source.",
      },
      after: [
        "Inside an individual workflow the patterns are consistent across the library. A tool calling agent always uses a schema validation step on the model output, with a structured retry path back into the model call when the schema check fails. A retrieval workflow always emits provenance metadata alongside the retrieved chunks. A gateway workflow always has an explicit dead letter branch, even when nothing routes to it yet, because adding the branch later is harder than adding it now. The shape is meant to be teachable: a reader who has studied two or three packs should be able to recognize the patterns in the rest.",
      ],
    },
    outcome: [
      "The library is the most accessible entry point I have for the patterns I rely on in production. It has been a useful artifact in conversations with potential employers because it is concrete: this is what I think production agentic work looks like, here are the patterns in code. The listing copy generator is now the same machinery I use for several of my digital products, and the marginal cost of adding another pack is closer to a working day than a working week.",
      "The library is also a debugging substrate. When I am building a custom n8n workflow for a specific customer, I almost always start by importing one of the packs and modifying it, rather than starting from a blank canvas. The patterns are stable enough that the customer specific work concentrates on the parts that genuinely differ, not on the rebuilding of the standard scaffolding around them.",
    ],
    next: [
      "The next direction is consolidation. The current library is wide; the next iteration should pick a smaller set of foundational packs, deepen them with more variations and richer documentation, and demote the long tail packs that exist mostly because I built them for one off needs. I would also like to integrate the library with the MCP RAG starter and the Claude skill suite, so that a reader can move between the n8n version, the Python MCP server version, and the Claude Agent SDK skill version of the same pattern.",
    ],
  },

  "nba-playoff-props": {
    slug: "nba-playoff-props",
    title: "NBA Playoff Props",
    tagline:
      "Live player prop predictions for the 2026 NBA playoffs. Free to use. Every resolved pick gets published, hit or miss.",
    chips: ["Next.js 15", "TypeScript", "Anthropic", "OddsAPI", "Vercel cron"],
    links: [
      {
        label: "Open the live demo",
        href: "https://nba-playoff-props.vercel.app",
        external: true,
      },
      {
        label: "View source on GitHub",
        href: "https://github.com/whodeanie/nba-playoff-props",
        external: true,
      },
    ],
    problem: [
      "Player prop predictions on the public internet have an honesty problem. Every site claims an edge. Almost none of them publish their full pick history. The selection bias is enormous: a tipster who flips a coin can find the subset of weeks where they hit and call themselves an expert. A reader has no way to evaluate whether the model behind the picks is any better than betting the house line.",
      "The technical problem is real too. Player props move during the day. Lines drift as books take action, as rest news comes out, as starting lineups shake out. A static prediction generated at lunchtime is stale by tipoff. Multiple books price the same prop at meaningfully different lines. The pick is only as good as the line it locks in, which means line shopping is part of the model whether or not the model author calls it that.",
      "The reasoning problem is the third one. A user does not learn anything from a number. A user learns from a paragraph that says, this player is averaging this many over their last ten, the matchup is favorable for this reason, the line is short of where the model thinks the median lands, and here is the credible interval around it. The user can then make their own call. A site that ships only numbers ships only opinions, not analysis.",
      "Success looks like a product that publishes every pick before tipoff, links to the line at every available book, explains the reasoning in plain English, and publishes a public scoreboard that updates after every resolved game. If the model is bad, the public accuracy page will say so, and that has to be acceptable.",
    ],
    approach: [
      "The model is a weighted blend rather than a single pure predictor. The components are recent form (rolling averages over last five and last ten games), matchup (opponent defensive efficiency against the relevant position group), pace (expected possessions for the game), rest (back to back, three in four nights), and line context (the implied probability the book is offering). The blend weights are tuned offline against historical resolved props, with a regularization step that prevents any one signal from dominating the blend on a single sample.",
      "The reasoning paragraph for each pick is generated by Anthropic Claude with a structured prompt. The prompt receives the model output and the underlying signals as JSON and the model's job is to produce a paragraph that defends the pick in plain English. Crucially, the model is not asked to predict; it is asked to explain a prediction the system has already made. This is a deliberate choice. Letting an LLM produce numerical predictions invites overconfidence and hallucinated stats. Letting an LLM explain a prediction made by a deterministic blend keeps the math sober and the prose readable.",
      "Line shopping happens at the data layer. Every pick carries the line at every monitored book (DraftKings, FanDuel, BetMGM, Caesars), and the recommended line is the most favorable one available at the time of pick generation. The accuracy page tracks the recommended line, not whatever the line drifted to by tipoff, because that is the line the reader could actually have taken when they read the pick. Anything else would be score keeping that flatters the model.",
      "Refresh runs every thirty minutes via Vercel cron. The cron pulls fresh odds, runs the blend over the current pool of player game scripts, regenerates the reasoning paragraphs for any pick whose underlying signals have shifted, and writes the results to incremental static regeneration. Page loads are fast because the page is mostly static; freshness is good because regeneration is cheap. The accuracy page resolves automatically once final box scores are published, with no manual scoring step. Every resolved pick lands on the page whether it hit or missed.",
    ],
    architecture: {
      intro: [
        "Three independent flows feed the site. An ingestion flow pulls odds and box scores. A prediction flow computes recommended picks. A reasoning flow generates the prose. A resolution flow updates the accuracy page. They are all driven by Vercel cron triggers, with the data plane backed by Vercel Edge Config and the page rendering done with Next.js incremental static regeneration.",
      ],
      diagram: {
        source: `flowchart TB
    subgraph Ingestion
      A1[Vercel cron 30 min] --> A2[OddsAPI fetch]
      A1 --> A3[ESPN scoreboard fetch]
      A2 --> A4[Edge Config write]
      A3 --> A4
    end
    subgraph Prediction
      B1[Vercel cron 30 min] --> B2[Weighted blend model]
      A4 --> B2
      B2 --> B3[Pick set]
      B3 --> B4[Anthropic reasoning prompt]
      B4 --> B5[Pick set with prose]
    end
    subgraph Resolution
      C1[Post game cron] --> C2[Box score fetch]
      C2 --> C3[Resolve picks]
      C3 --> C4[Accuracy page update]
    end
    B5 --> D[ISR pages]
    C4 --> D
    D --> E[User]`,
        caption: "Three independent crons. Picks, reasoning, and resolution stay decoupled.",
      },
      after: [
        "The boring parts are where most of the engineering went. ISR fallbacks have to handle the moments when OddsAPI is rate limited or ESPN is slow. Pick identifiers have to be stable across regenerations or the accuracy page will lose track of resolution. The reasoning model occasionally produces a paragraph that disagrees with the numerical pick, and a validation step rejects the paragraph and falls back to a deterministic template if the disagreement is structural. None of these failure modes are dramatic but the absence of any one of them would make the public accuracy page silently lie.",
      ],
    },
    outcome: [
      "The product is live for the 2026 NBA playoffs. Every pick is published before tipoff. The accuracy page shows the running record by category and by stake size, updated after each game. The free tier (which is the whole product right now) has been a useful trust building exercise. There is no edge to keeping picks private when the goal is to demonstrate the model rather than monetize the picks directly.",
      "The reasoning paragraphs have been the unexpectedly powerful surface. Users engage with the paragraphs more than they engage with the raw numbers. The paragraphs are also the part that makes the product feel like a product rather than a CSV with extra steps. A user who reads the paragraph understands why the system is recommending the pick, and that understanding is what makes them comfortable acting on it.",
    ],
    next: [
      "The next direction is calibration. The model produces probabilities, the accuracy page tracks resolutions, and the gap between predicted probability and realized rate is the calibration error that should drive the next round of model tuning. I would also like to add per player explainability that breaks down which signal drove the pick, because right now the reasoning paragraph is qualitative and a quantitative version would let a power user inspect the model rather than just read it.",
    ],
  },

  "claude-skill-suite": {
    slug: "claude-skill-suite",
    title: "Claude Skill Suite",
    tagline:
      "Four production Claude Agent SDK skills that ship real digital products to Amazon KDP.",
    chips: ["Claude Agent SDK", "Anthropic", "Python", "KDP"],
    links: [
      {
        label: "View kernel template on GitHub",
        href: "https://github.com/whodeanie/claude-skill-template",
        external: true,
      },
    ],
    problem: [
      "Productized agentic workflows have a starter problem. The user wants to ship something, the model is capable of helping, but the gap between a clever Claude conversation and a working production pipeline is the part nobody talks about. Building a Claude Agent SDK skill that ships a real digital product means writing the deterministic scaffolding around the model, building the API integrations to the marketplaces, handling the metadata and the cover art and the listing copy, and gating it all with validation steps that catch the dumb failures before they reach a customer. The first skill is interesting. The fourth one is the test of whether the patterns generalize.",
      "I wanted a family of skills that shared a kernel. Each skill should solve a real productization problem (puzzle book publishing, coloring book publishing, KDP browser automation, niche information PDF generation), and each skill should be different enough that the kernel had to be tested against real variation. If four independent skills could be built on the same scaffold, the scaffold was correct.",
      "The motivating constraint was simple: the suite had to ship products to live storefronts, not just generate artifacts on disk. Live revenue is the test of whether the pipeline survives the messy reality of marketplace APIs, file format quirks, image generation latency, and whatever other edges the skill encounters when it actually runs. A pipeline that produces something nobody buys is theatre.",
    ],
    approach: [
      "The deterministic scaffold plus LLM hybrid pattern runs through every skill. The scaffold owns the parts where correctness matters and predictability is the deliverable: file naming, metadata schemas, cover layout, marketplace API calls, idempotency keys, retry policies. The LLM owns the parts where creative variation is the deliverable: niche discovery, theme selection, listing copy, interior content. The boundary between scaffold and LLM is explicit. A skill that loses track of which side owned a decision is a skill that produces inconsistent products.",
      "Validation gates live between every stage. The skill produces a manifest at each stage, the manifest is validated against a schema, and the next stage refuses to run if the manifest is malformed. This is the part that turns a clever skill into a reliable one. A pipeline that never validates its intermediate outputs eventually produces a coloring book with the wrong title on the wrong cover, and that error costs money to refund. The validation gates make those errors loud rather than silent.",
      "Each skill ships with a small library of templates, prompts, and validation schemas that are skill specific. The scaffold (in the kernel template repository) is the shared substrate. The skill itself is the layer on top that knows how to publish a coloring book or generate a niche PDF. New skills slot into the same shape. The marginal cost of a fifth skill is closer to a working day than a working week, which is the cost ratio that makes the pattern worth the up front investment.",
      "Browser automation lives at the edges. Some marketplaces (Amazon KDP) do not have public APIs at the granularity the skill needs. The KDP skill therefore drives a real browser session, waits for navigations, fills forms, uploads files, and verifies the resulting listing state by reading the rendered page back. This is fragile in the way that browser automation is always fragile, and the skill survives by treating every browser interaction as retryable, every assertion as explicit, and every failure as visible enough that the operator can debug it from the logs.",
    ],
    architecture: {
      intro: [
        "The kernel template provides the deterministic scaffold. Each skill imports the scaffold and supplies the skill specific layer: prompts, templates, marketplace adapters, validation schemas. The skill exposes a single entry point that runs the pipeline end to end.",
      ],
      diagram: {
        source: `flowchart TB
    subgraph Kernel
      K1[Manifest schema]
      K2[Stage runner]
      K3[Validation gate]
      K4[Retry policy]
      K5[Idempotency keys]
    end
    subgraph Skill[Skill specific layer]
      S1[Niche discovery prompt]
      S2[Content generation]
      S3[Cover art generation]
      S4[Metadata builder]
      S5[Marketplace adapter]
    end
    Kernel --> Skill
    S1 --> M1[Stage manifest]
    S2 --> M1
    S3 --> M1
    S4 --> M1
    M1 --> V[Validation gate]
    V --> S5
    S5 --> P[Live listing]`,
        caption: "Kernel provides the substrate. Skill specific layer provides the variation. Validation gates between stages.",
      },
      after: [
        "The pattern survives the variation. The puzzle book skill and the coloring book skill share the kernel and diverge in the content generation stage. The KDP browser automation skill replaces the marketplace adapter with a browser driver but keeps the rest of the pipeline. The niche PDF skill swaps in a different content generation strategy and keeps everything else. The kernel has not had to change shape to accommodate any of these, which is the actual marker for whether the abstraction is doing real work.",
      ],
    },
    outcome: [
      "The suite has produced fifty plus digital products live on Amazon KDP. The marginal cost of a new product run is small enough that I can experiment with niches I would not otherwise have time for. The validation gates have caught real failures: malformed metadata, broken cover assets, listing copy that mismatched the interior. None of those failures reached a customer, which is the test of whether the gates were worth their complexity.",
      "The kernel template is now the starting point for every new skill in my own portfolio. It is the artifact I am most likely to recommend to another engineer building productized agentic workflows, because it concentrates the patterns that matter and lets the skill specific layer focus on the parts that genuinely differ between products.",
    ],
    next: [
      "The next iteration broadens the kernel. There is a small set of cross cutting concerns (cost tracking per run, observability, prompt versioning) that currently live inside individual skills and would be more useful as kernel features. I would also like to add a skill for the n8n workflow library so that the same productization pattern that ships books and PDFs also ships agentic workflows as a paid product. The pipeline is already there, the marketplace adapter is the missing piece.",
    ],
  },

  "fwdthink-rag-procurement": {
    slug: "fwdthink-rag-procurement",
    title: "Federal RAG and Procurement Research",
    tagline:
      "Production AI pipelines for a federal agency. Document understanding, case routing, evidence analysis, and procurement research over solicitation databases.",
    chips: ["Federal", "RAG", "GPT-4", "AWS Rekognition", "Vector store"],
    links: [
      { label: "Read more on the resume", href: "/resume/" },
    ],
    problem: [
      "Federal AI work has constraints that consumer AI does not. Every model output has to be traceable to a source document. Every classifier has to handle the full long tail of incoming inputs, including PDFs, scanned forms, and photographed handwritten statements. Every routing decision has to survive a reviewer asking why this complaint went to that investigator queue. The bar is not whether the system is smart; it is whether the system is auditable.",
      "FwdThink hired me to lead the production AI pipelines that process incoming Equal Employment Opportunity complaints for a federal agency. The intake process before the project was manual triage. A complaint arrived, a human read it, a human decided which investigator queue it belonged in, and the case sat in a backlog measured in weeks while the queues caught up. The downstream investigators then had to read every supporting document themselves to surface the relevant facts, which is the part of the job that is unscalable when the volume rises.",
      "The procurement side of the agency had a parallel problem. Acquisition officers needed to answer specific market questions (what was paid for this category of service in this region last quarter, which vendors hold the active contracts in this product class) by reading through contract databases, solicitation documents, and market reports. The desk research was multi day work for questions whose answers existed in the corpus the whole time.",
      "The constraints made obvious tools unsuitable. Off the shelf summarization fails when the answer has to cite the source document. Off the shelf classifiers fail on the long tail of intake formats. The system had to be built around evidence, not around clever prompting.",
    ],
    approach: [
      "The document understanding pipeline is the foundation. Incoming complaints land in a wide variety of formats, which means the first stage has to reduce that variation. PDFs go through a text extraction stage. Scanned forms and photographed statements go through AWS Rekognition for OCR. The OCR output flows into GPT-4 with a structured extraction prompt that pulls out complaint type, parties involved, alleged violations, and requested remedies. The structured output lands in a typed schema, which is the boundary that the rest of the system depends on. A pipeline that cannot reduce wild input to structured fields cannot be reasoned about further.",
      "The case routing classifier is an LLM based classifier, not a learned model trained from labeled data. Labeled data did not exist in sufficient volume for the agency to train a custom classifier; the LLM gets the structured fields plus a routing rubric and produces a queue assignment with a justification. The justification is what reviewers audit. A queue assignment without an explanation is a queue assignment that cannot be defended. The classifier output is treated as a recommendation; a human reviewer accepts or rejects it before the case actually moves. The throughput improvement comes from the classifier doing the heavy reading, not from removing the human from the loop.",
      "The evidence analysis module processes the supporting documents that follow the initial complaint. Emails, photos, personnel records, attached statements. The module runs the documents through Rekognition for image content where relevant and through GPT-4 for textual content, then produces an evidence map that summarizes the salient passages and links them back to the source document. Investigators previously spent the first day on a case hunting through the supporting material; the evidence map gives them the same set of facts in minutes, with citations they can verify before relying on.",
      "The procurement research tool is a separate retrieval system over the agency's contract databases, solicitation documents, and market reports. The corpus gets indexed into a vector store with citation provenance attached at the chunk level. Acquisition officers ask plain English questions and get sourced answers grounded in the underlying documents. Queries that touch the active contract registry produce both the model answer and a structured table of the contracts that informed it, because acquisition officers want both the prose summary and the verifiable underlying records.",
    ],
    architecture: {
      intro: [
        "Two pipelines feed the same downstream review queue. The complaint pipeline handles intake, classification, and evidence analysis. The procurement pipeline handles retrieval over the contract corpus. Both pipelines emit outputs that carry citation provenance through to the review surface.",
      ],
      diagram: {
        source: `flowchart TB
    subgraph Complaint pipeline
      A1[Intake] --> A2[PDF or scan or photo]
      A2 --> A3[OCR via Rekognition]
      A3 --> A4[GPT-4 structured extraction]
      A4 --> A5[Typed complaint schema]
      A5 --> A6[LLM routing classifier]
      A6 --> A7[Queue recommendation with justification]
      A5 --> A8[Evidence module]
      A8 --> A9[Evidence map with citations]
    end
    subgraph Procurement pipeline
      B1[Contract corpus] --> B2[Chunker]
      B2 --> B3[Vector index with provenance]
      B4[Acquisition officer query] --> B5[Hybrid retrieval]
      B3 --> B5
      B5 --> B6[GPT-4 with citation prompt]
      B6 --> B7[Sourced answer plus contract table]
    end
    A7 --> R[Review surface]
    A9 --> R
    B7 --> R`,
        caption: "Two pipelines, same review surface. Citation provenance flows through every stage.",
      },
      after: [
        "The unsexy parts were where the rigor lived. PII handling at every boundary, audit logging on every model invocation, retention policies aligned to agency record requirements, network segmentation around the model calls. None of these were the model side of the project but all of them were prerequisites for the model side actually being usable. A pipeline that cannot meet the agency's compliance posture is a pipeline that gets shelved no matter how clever the model.",
      ],
    },
    outcome: [
      "The intake backlog measured in weeks compressed into hours once the routing classifier started suggesting investigator assignments at intake. Investigators stopped spending their first day per case hunting through email exports for the relevant facts; the evidence module surfaced the salient passages with citations back to the source document, and the investigators got to spend their day on the legal analysis the agency actually hired them for. On the procurement side, acquisition officers got a tool that answered specific market questions with sourced excerpts in seconds rather than the multi day desk research the same questions used to take.",
      "The auditability was the part that made the project deployable. Every model output had a trail back to the document. Every queue recommendation had a justification that a reviewer could audit. The reviewers trusted the system not because the model was perfect but because the system never made an opaque claim. That is the part of federal AI work that does not show up in benchmarks but determines whether the work actually ships.",
    ],
    next: [
      "If I had this project to do over, I would invest more up front in the evaluation harness. The system worked, but the gates that would have caught a regression in model behavior across a release were thinner than they should have been. A federal AI system needs the offline evaluation suite as a first class deliverable, not as something the team writes when there is time. That lesson is the one that informs the Ivy offline toolkit work directly.",
    ],
  },

  "track-meet-tracker": {
    slug: "track-meet-tracker",
    title: "Track Meet Tracker",
    tagline:
      "A fan facing schedule for elite track and field. The ESPN style what is on tonight surface the sport never had.",
    chips: ["Next.js 15", "TypeScript", "Groq", "Llama 3.3", "iCal", "Track & Field"],
    links: [
      {
        label: "View repo on GitHub",
        href: "https://github.com/whodeanie/track-meet-tracker",
        external: true,
      },
    ],
    problem: [
      "Fans of professional and college football have ESPN. Fans of basketball have League Pass. Fans of track and field have an inbox full of newsletter spoilers and a USATF events page that reads like a directory of conference rooms. There is no surface that tells a casual fan which meets are on tonight, where to watch them, and which athletes are worth showing up for. The result is a sport whose audience misses meets they would have happily watched, because nobody is telling them in a way that respects their time.",
      "The closest existing surfaces fail in different ways. TFRRS has comprehensive NCAA logistics but the UX is built for coaches and meet directors, not for fans. The Diamond League site only covers Diamond League. World Athletics covers Continental Tour Gold but not the US college and pro circuit. FloTrack covers most of it but locks the answer behind a paywall and a content marketing wrapper that the casual fan never opens. None of these surfaces are doing anything wrong inside their own scope. They are just not the answer to the question a casual fan is actually asking.",
      "Success looks like this. A fan opens the home page, sees what is on this week and next week sorted by date, with broadcast info that flags free options first. They can filter by tier when they only care about a slice of the sport. They can click a meet for the broadcast logistics, marquee athletes, and event schedule. They can subscribe an iCal feed once and stop missing meets forever.",
    ],
    approach: [
      "The data model is a single TypeScript file checked into the repository. The reason it is not a scraped pipeline is that NCAA, USATF, Diamond League, and World Athletics each change their page layouts often enough that any naive scraper would break within months. Keeping the data as a committed file means the site survives source site changes, stays on the Vercel free tier, and gives a maintainer a single place to fix bad broadcast info with a pull request. A weekly refresh script prints a checklist of source URLs, which is the operationally honest version of the same idea. Automation is possible later when the source surfaces stabilize, but a checklist is what works today.",
      "The lead view splits upcoming meets into This Week, Next Week, and Upcoming buckets, with filter chips by tier on top. Each meet renders as a card with date, location, tier badge, a one sentence editorial summary, and the first few broadcast options. Free options carry a green outline so the eye finds them first, because the entire premise of the surface is making the casual fan succeed at watching, and the lowest friction path is a free option they did not know existed.",
      "The detail page covers broadcast logistics, schedule of marquee events within the meet, athletes worth watching, and the official meet page link. Free broadcasts render in a distinct block above paid options. Each meet exposes a single meet iCal feed at /api/calendar/[slug] for fans who only want one event on their calendar, and the full feed lives at /api/calendar.ics. The iCal path is preferred over email notifications because every phone and laptop calendar app already supports it, and the operational cost is zero.",
      "The AI weekly brief is a Groq Llama 3.3 70B paragraph that summarises the next two weeks in voice forward prose. The endpoint runs server side and the visitor never provides a key. The system prompt insists on 80 to 120 words, no dashes, no inventing athletes that did not appear in the data, and a tone that sounds like an informed friend who watches everything. When the GROQ_API_KEY is unset, the endpoint returns an off flag and the UI silently hides the brief. The rest of the site keeps working.",
    ],
    architecture: {
      intro: [
        "One TypeScript data file, four rendering surfaces, two API routes. Static at build time, refreshed weekly via a manual script. The whole stack runs on the Vercel free tier with no database.",
      ],
      diagram: {
        source: `flowchart TB
    A[src/data/meets.ts] --> B[lib/meets helpers]
    B --> C[Home page buckets]
    B --> D[Meet detail page]
    B --> E[iCal builder]
    E --> F[GET /api/calendar.ics]
    E --> G[GET /api/calendar/slug]
    B --> H[POST /api/groq/chat]
    H --> I[Groq Llama 3.3 70B]
    J[scripts/refresh-meets.ts] -.->|weekly checklist| A
    C --> K[Fan]
    D --> K
    F --> L[Calendar app subscription]
    G --> L`,
        caption: "Static data file, derived views, free iCal feed, optional server side AI brief.",
      },
      after: [
        "The unsexy parts are where the operational simplicity lives. Cache control headers on the iCal endpoint set a twelve hour s-maxage so calendar apps that poll aggressively do not cost anything. The detail pages are statically generated at build time via generateStaticParams, so the production hot path is a CDN read with no runtime cost. The Groq endpoint returns the off flag instead of an error when the key is missing, so a fork without the key still ships a working site. The data file refresh is a checklist, not a scraper, which is the right call for a project where source layouts change more often than the underlying meet calendar.",
      ],
    },
    outcome: [
      "The site fills a gap that the sport's existing surfaces do not. Casual fans get the answer to what is on tonight in one glance. Power fans get a calendar feed they can subscribe to once and stop thinking about. Coaches and meet directors get a clean place to point athletes and parents who want to follow along. The whole stack runs on Vercel free tier with no database, so the operational cost is zero indefinitely.",
      "The iCal feed is the most underrated part. Every phone and laptop calendar app already supports the subscription protocol. The cost of building a notification path that respects user permission, survives platform changes, and works across iOS, Android, macOS, and Windows is zero when you delegate to the calendar app the user already trusts. Building a custom notification path would have been weeks of work for an outcome the fan likes less.",
    ],
    next: [
      "The next iteration adds athlete entry lists for the major meets, pulled from World Athletics where they publish them and from TFRRS for NCAA championships. The data file scales to that addition without a schema change because each meet already carries a marquee athlete array. A weekly digest via Resend free tier is the obvious add when the audience exists to justify it. A past results archive is the natural place for the data file to grow once the upcoming window outgrows thirty days, at which point the file is going to want to split into seasonal partitions.",
    ],
  },
};

export const CASE_STUDY_SLUGS = Object.keys(CASE_STUDIES);
