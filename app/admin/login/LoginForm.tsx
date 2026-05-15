"use client";

import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "denied" | "noconfig">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setStatus("noconfig");
        setMessage(data.error || "Admin not configured.");
        return;
      }
      if (!res.ok || !data.ok) {
        setStatus("denied");
        setMessage(data.error || "Incorrect password.");
        return;
      }
      window.location.href = data.redirect || "/admin/analytics";
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      <label className="block">
        <span className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
          Password
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading" || status === "noconfig"}
        className="w-full rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-[var(--bg)] hover:opacity-90 disabled:opacity-40"
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
      {message ? (
        <p className="text-sm text-[var(--fg)]/80">{message}</p>
      ) : null}
    </form>
  );
}
