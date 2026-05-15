// Server side Groq proxy for tailoring a resume against a job description.
// The GROQ_API_KEY env var on Vercel handles all calls. Visitors do NOT bring their own key.

import { NextResponse } from "next/server";

export const runtime = "edge";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface RequestBody {
  jobDescription?: string;
  resumeText?: string;
  jobTitle?: string;
  company?: string;
  tone?: string;
}

// Compact resume baked into the endpoint so callers that only have a job
// description can hit this endpoint without shipping the full resume on every
// call. Stays in sync with /public/resume.pdf by hand.
const DEFAULT_RESUME = `KERRY DEAN JR. Software Engineer, Chicago IL, kerrydean81@gmail.com, linkedin.com/in/kerrydeanjr, github.com/whodeanie.

SUMMARY. 9 plus years shipping production systems across federal AI, healthcare AI, agtech, and enterprise. Last two years on LLM products, RAG, agentic systems, FHIR clinical AI, Claude Agent SDK, n8n, MCP.

EXPERIENCE.
Traverse Technologies, Senior Technical Lead, June 2025 to November 2025. Led Dash, the corporate travel product. Shipped Choice Hotels integration (partner API, availability search, booking, rate and loyalty sync, phased rollout). SSO and directory sync with Okta and Azure AD. C# .NET, TypeScript, React, AWS, Azure, GitHub Actions.

WellBe Senior Medical, Senior Software Engineer, June 2023 to February 2025. Led Luminate clinical copilot for senior home visits. Built FHIR compliant APIs, offline first sync (Firebase plus AWS), predictive analytics. Managed a team of seven engineers. HIPAA boundary.

FwdThink, Senior Generative AI Software Engineer, June 2024 to December 2024. Federal procurement RAG, Pinecone, hybrid retrieval, cross encoder reranker, citation grounded generation, over 90 percent faithfulness at launch, cut confident hallucination rate from roughly 11 percent. LLM case routing classifier with audit log and escalation queue. Document understanding pipeline (Rekognition plus GPT-4) for EEO complaints.

Syngenta, Senior Software Engineer, May 2021 to June 2023. Global agtech dashboards. Contributed core components to Syngenta's open source React UI library (map widget, virtual scrolling grid, charts). ReactJS, TypeScript, Python, AWS Lambda, GraphQL, DynamoDB.

Argonne National Laboratory, Software Developer Consultant, November 2020 to April 2021. Python ETL pipelines into Neo4j, fleet electrification modeling, TCO dashboard.

Enablon, Software Engineer, February 2018 to October 2020. Sustainability platform. ReactJS, Redux, TypeScript, Node, C#, AWS, SQL Server.

Group O, Software Developer, October 2016 to January 2018. React, Redux, Angular, ASP.NET, C#, SQL Server, MongoDB.

EDUCATION. University of Iowa, BS Computer Science, 2012 to 2016. Academic All Big Ten student athlete (track and field, long jump 7.00m, triple jump 14.84m).

SELECTED AI PROJECTS.
Claude Agent SDK Production Skills. Four production skills: n8n pack generation, KDP publishing, browser automation, niche PDF generation. Open source template at github.com/whodeanie/claude-skill-template.
AI Product Publishing Suite. 50 plus digital products live on Amazon KDP. Anthropic Claude, OpenAI GPT-4, LangChain, Pinecone, image generation, programmatic listing.
n8n Agentic Workflow Library. 41 packs, 291 workflows. Function and tool calling, RAG retrieval, hybrid vector search, multi step orchestration. github.com/whodeanie/n8n-agentic-workflows.
MCP RAG Starter. Hybrid retrieval (BM25 plus dense plus RRF), citation provenance, offline evaluation harness. github.com/whodeanie/mcp-rag-starter.
NBA Predict Pro. Calibrated voting plus stacking ensemble, walk forward CV, Brier 0.218. Llama 3.3 70B explanations via Groq. Educational only.
Quant Signal Engine. Walk forward backtests for RSI, MA cross, Bollinger with capped Kelly sizing. Live demo on Vercel free tier.

SKILLS. Anthropic Claude API, Claude Agent SDK, OpenAI GPT-4, Google Gemini, LangChain, LlamaIndex, Pinecone, Weaviate, FAISS, RAG, hybrid retrieval, vector search, embeddings, reranking, prompt engineering, function calling, tool use, agentic workflows, fine tuning, evaluation harnesses (LangSmith, Braintrust, Phoenix), Model Context Protocol (MCP), PyTorch, Hugging Face, MLflow, TypeScript, React, Next.js, Python, AWS (Lambda, Bedrock, Rekognition, S3), Azure, GCP, Docker, GitHub Actions, Firebase, Vercel, Postgres, DynamoDB, BigQuery, Redis, Neo4j, C#, Java, SQL, GraphQL, REST, FHIR, ASP.NET, Spring, Vue, Node, .NET, Entity Framework.`;

const SYSTEM_PROMPT = [
  "You are a resume tailoring assistant.",
  "Only reorder, re-emphasize, or compress facts that already exist in the candidate's resume.",
  "NEVER invent companies, titles, dates, projects, technologies, metrics, or any other facts.",
  "If the JD asks for a skill the candidate does not have, simply do not emphasize that skill.",
  "Use first person voice consistent with the source resume.",
  "Do not use em dashes, en dashes, or sentence break hyphens. Use commas, periods, or parentheses instead.",
  "Output Markdown only with sections SUMMARY, EXPERIENCE, PROJECTS, SKILLS.",
].join(" ");

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
  // Fall back to the baked default resume when the caller does not ship one.
  const resumeText =
    typeof body.resumeText === "string" && body.resumeText.trim().length > 0
      ? body.resumeText.trim()
      : DEFAULT_RESUME;
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const tone = typeof body.tone === "string" && body.tone.trim().length > 0 ? body.tone.trim() : "professional and direct";

  if (!jobDescription) {
    return NextResponse.json({ ok: false, error: "jobDescription_required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "groq_unavailable" }, { status: 503 });
  }

  const targetLine = [company, jobTitle].filter(Boolean).join(", ");
  const userPrompt = [
    "Tone: " + tone + ".",
    targetLine ? "Target role: " + targetLine + "." : "",
    "",
    "JOB DESCRIPTION:",
    jobDescription,
    "",
    "CANDIDATE RESUME (source of truth, do not invent beyond this):",
    resumeText,
    "",
    "Produce a tailored Markdown resume with the sections SUMMARY, EXPERIENCE, PROJECTS, SKILLS in that order. Reorder and re-emphasize content to fit the JD. Do not invent."
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2400,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `groq_error_${res.status}`, details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ ok: false, error: "groq_empty_response" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, content: content.trim() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "groq_fetch_failed", details: (err as Error).message },
      { status: 502 }
    );
  }
}
