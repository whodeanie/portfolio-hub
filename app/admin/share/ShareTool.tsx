"use client";

import { useEffect, useState } from "react";

type SentRecord = {
  id: string;
  taggedUrl: string;
  baseUrl: string;
  recipient: string;
  source: string;
  medium: string;
  campaign: string;
  createdAt: string;
};

const STORAGE_KEY = "kdj_admin_sent_links_v1";

type Template = {
  id: string;
  label: string;
  source: string;
  medium: string;
  hint: string;
};

const TEMPLATES: Template[] = [
  { id: "resume_email", label: "Resume email", source: "resume", medium: "email", hint: "Paste into the body of a resume submission email." },
  { id: "linkedin_dm", label: "LinkedIn DM", source: "linkedin", medium: "dm", hint: "Send when DMing a recruiter on LinkedIn." },
  { id: "linkedin_post", label: "LinkedIn post", source: "linkedin", medium: "post", hint: "Use in a public LinkedIn post." },
  { id: "cold_outreach", label: "Cold outreach", source: "cold", medium: "email", hint: "First touch cold email to a hiring manager." },
  { id: "twitter_dm", label: "X / Twitter DM", source: "twitter", medium: "dm", hint: "Send when DMing on X / Twitter." },
  { id: "referral", label: "Referral", source: "referral", medium: "email", hint: "Friend forwarding the portfolio on your behalf." },
  { id: "github_readme", label: "GitHub README", source: "github", medium: "readme", hint: "Link from a GitHub repo README." }
];

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildTaggedUrl(opts: {
  base: string;
  source: string;
  medium: string;
  campaign: string;
}): string {
  let baseUrl: URL;
  try {
    baseUrl = new URL(opts.base);
  } catch {
    // Allow bare hostnames like kerrydean-hub.vercel.app/?p=1
    baseUrl = new URL(`https://${opts.base.replace(/^\/+/, "")}`);
  }
  baseUrl.searchParams.set("utm_source", slugify(opts.source) || "resume");
  baseUrl.searchParams.set("utm_medium", slugify(opts.medium) || "email");
  baseUrl.searchParams.set("utm_campaign", slugify(opts.campaign));
  return baseUrl.toString();
}

function loadList(): SentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as SentRecord[];
    return [];
  } catch {
    return [];
  }
}

function saveList(list: SentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

export default function ShareTool() {
  const [base, setBase] = useState("https://kerrydean-hub.vercel.app/");
  const [recipient, setRecipient] = useState("");
  const [source, setSource] = useState("resume");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("");
  const [tagged, setTagged] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [list, setList] = useState<SentRecord[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>("resume_email");

  function applyTemplate(t: Template) {
    setSource(t.source);
    setMedium(t.medium);
    setActiveTemplate(t.id);
  }

  useEffect(() => {
    setList(loadList());
  }, []);

  useEffect(() => {
    setCampaign((c) => (c ? c : slugify(recipient)));
  }, [recipient]);

  function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recipient.trim()) return;
    const url = buildTaggedUrl({
      base,
      source,
      medium,
      campaign: campaign || slugify(recipient)
    });
    setTagged(url);
    setCopied(false);
    const record: SentRecord = {
      id: crypto.randomUUID(),
      taggedUrl: url,
      baseUrl: base,
      recipient: recipient.trim(),
      source,
      medium,
      campaign: campaign || slugify(recipient),
      createdAt: new Date().toISOString()
    };
    const next = [record, ...list].slice(0, 200);
    setList(next);
    saveList(next);
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  function remove(id: string) {
    const next = list.filter((r) => r.id !== id);
    setList(next);
    saveList(next);
  }

  function clearAll() {
    if (typeof window === "undefined") return;
    if (!window.confirm("Clear the entire sent list on this device?")) return;
    setList([]);
    saveList([]);
  }

  const uniqueRecipients = new Set(list.map((r) => r.recipient.toLowerCase())).size;

  const activeHint = TEMPLATES.find((t) => t.id === activeTemplate)?.hint;

  return (
    <div className="mt-10 space-y-10">
      <form onSubmit={onGenerate} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Quick template
          </label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => {
              const on = activeTemplate === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="rounded-full px-3 py-1 text-xs font-mono uppercase tracking-widest border transition-colors"
                  style={{
                    color: on ? "var(--bg)" : "var(--fg)",
                    background: on ? "var(--accent)" : "transparent",
                    borderColor: on ? "var(--accent)" : "var(--rule)"
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {activeHint ? (
            <p className="mt-2 text-xs text-[var(--fg)]/60">{activeHint}</p>
          ) : null}
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Base URL
          </label>
          <input
            type="text"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Recipient (e.g. anthropic-rovi-hiring)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            placeholder="anthropic-rovi-hiring"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              utm_source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              utm_medium
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              utm_campaign
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="w-full rounded-md border border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="auto fills from recipient"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-[var(--bg)] hover:opacity-90"
        >
          Generate tagged link
        </button>
      </form>

      {tagged ? (
        <section className="rounded-lg border border-[var(--rule)] p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
            Tagged URL
          </h2>
          <p className="mt-3 break-all font-mono text-sm">{tagged}</p>
          <button
            type="button"
            onClick={() => copy(tagged)}
            className="mt-3 rounded-md border border-[var(--rule)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </section>
      ) : null}

      <section>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h2 className="serif text-2xl font-medium">Sent list</h2>
            <p className="mt-1 text-xs text-[var(--fg)]/70">
              {list.length} link{list.length === 1 ? "" : "s"} created
              {uniqueRecipients > 0 ? `, ${uniqueRecipients} unique recipient${uniqueRecipients === 1 ? "" : "s"}` : ""}.
              Stored only on this device.
            </p>
          </div>
          {list.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--accent)]"
            >
              Clear all
            </button>
          ) : null}
        </div>
        {list.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--fg)]/60">No links generated yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-[var(--rule)] p-4"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="font-mono text-xs text-[var(--fg)]/85">{r.recipient}</div>
                  <div className="font-mono text-[10px] text-[var(--muted)]">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className="mt-2 break-all font-mono text-[12px]">{r.taggedUrl}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => copy(r.taggedUrl)}
                    className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--accent)]"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--accent)]"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
