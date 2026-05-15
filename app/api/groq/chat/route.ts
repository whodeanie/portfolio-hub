// Server side Groq proxy. Visitors do NOT bring their own key.
// The GROQ_API_KEY env var on Vercel handles all calls.

import { NextResponse } from "next/server";

export const runtime = "edge";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface RequestBody {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages_required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "groq_unavailable" }, { status: 503 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model ?? DEFAULT_MODEL,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.maxTokens ?? 600,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `groq_error_${res.status}`, details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "groq_empty_response" }, { status: 502 });
    }
    return NextResponse.json({ content: content.trim() });
  } catch (err) {
    return NextResponse.json(
      { error: "groq_fetch_failed", details: (err as Error).message },
      { status: 502 }
    );
  }
}
