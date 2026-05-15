// Server side proxy is at /api/groq/chat. Visitors do NOT bring their own key.
// The GROQ_API_KEY env var on Vercel powers all calls.

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqOptions = {
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  model?: string;
};

export async function chatCompletion(
  messages: ChatMessage[],
  opts: GroqOptions = {},
): Promise<string> {
  const res = await fetch("/api/groq/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      model: opts.model,
    }),
    signal: opts.signal,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errCode = data?.error || `http_${res.status}`;
    if (errCode === "groq_unavailable") throw new Error("groq_unavailable");
    throw new Error(errCode);
  }

  const content = data?.content;
  if (typeof content !== "string") throw new Error("groq_empty_response");
  return content.trim();
}

// Compatibility shims kept so existing imports do not break on this rewrite.
// They are no ops now since visitors no longer bring keys.
export function getStoredKey(): string | null {
  return null;
}
export function setStoredKey(_key: string): void {
  // no op
}
export function clearStoredKey(): void {
  // no op
}
