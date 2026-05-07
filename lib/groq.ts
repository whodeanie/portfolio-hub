// Tiny client side Groq helper. Bring your own key, stored in localStorage,
// with an optional NEXT_PUBLIC_GROQ_API_KEY fallback for local dev. The API
// is OpenAI compatible at https://api.groq.com/openai/v1.

const STORAGE_KEY = "kdj_groq_api_key";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function getStoredKey(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();
  const fallback = (process.env.NEXT_PUBLIC_GROQ_API_KEY || "").trim();
  return fallback.length > 0 ? fallback : null;
}

export function setStoredKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearStoredKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqOptions = {
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

export async function chatCompletion(
  messages: ChatMessage[],
  opts: GroqOptions = {},
): Promise<string> {
  const key = getStoredKey();
  if (!key) throw new Error("missing_groq_key");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 600,
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`groq_error_${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("groq_empty_response");
  return content.trim();
}
