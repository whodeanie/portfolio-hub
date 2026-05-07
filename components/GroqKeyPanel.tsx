"use client";

import { useEffect, useState } from "react";
import { clearStoredKey, getStoredKey, setStoredKey } from "../lib/groq";

type Props = {
  label?: string;
  onChange?: (hasKey: boolean) => void;
};

export default function GroqKeyPanel({ label = "AI features", onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const present = !!getStoredKey();
    setHasKey(present);
    onChange?.(present);
  }, [onChange]);

  function save() {
    if (!draft.trim()) return;
    setStoredKey(draft);
    setDraft("");
    setHasKey(true);
    setOpen(false);
    onChange?.(true);
  }

  function clear() {
    clearStoredKey();
    setHasKey(false);
    onChange?.(false);
  }

  return (
    <div className="rounded-lg border border-[var(--rule)] p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: hasKey ? "#A6D49A" : "#D49A7A" }}
            aria-hidden
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {label}: {hasKey ? "ready" : "needs Groq key"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:opacity-80"
        >
          {hasKey ? "Manage" : "Connect"}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-[var(--fg)]/70 leading-relaxed">
            Paste a Groq API key (starts with <code className="font-mono">gsk_</code>).
            It is stored only in your browser. Get a free one at console.groq.com.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="gsk_..."
              className="flex-1 font-mono text-xs px-2 py-1.5 rounded border border-[var(--rule)] bg-transparent"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--accent)] text-[var(--accent)] disabled:opacity-40"
            >
              Save
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={clear}
                className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
