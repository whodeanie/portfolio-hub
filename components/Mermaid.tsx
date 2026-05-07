"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  chart: string;
  caption?: string;
};

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      render: (
        id: string,
        text: string
      ) => Promise<{ svg: string }>;
    };
    __mermaidLoaded?: Promise<void>;
  }
}

const MERMAID_CDN =
  "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

function loadMermaid(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.__mermaidLoaded) return window.__mermaidLoaded;
  window.__mermaidLoaded = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.type = "module";
    s.innerHTML = `
      import mermaid from "${MERMAID_CDN}";
      window.mermaid = mermaid;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        themeVariables: {
          background: "transparent",
          primaryColor: "#F1E9DA",
          primaryTextColor: "#1F1B15",
          primaryBorderColor: "#A67340",
          lineColor: "#9a8f7e",
          secondaryColor: "#EBE0CE",
          tertiaryColor: "#F8F4ED",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontSize: "14px"
        },
        flowchart: { curve: "basis", padding: 16, useMaxWidth: true }
      });
      window.dispatchEvent(new Event("mermaid:loaded"));
    `;
    s.onerror = () => reject(new Error("mermaid script failed to load"));
    window.addEventListener("mermaid:loaded", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
  return window.__mermaidLoaded;
}

export default function Mermaid({ chart, caption }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const idRef = useRef<string>("m" + Math.random().toString(36).slice(2, 10));

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then(async () => {
        if (cancelled || !window.mermaid) return;
        try {
          const out = await window.mermaid.render(idRef.current, chart);
          if (!cancelled) setSvg(out.svg);
        } catch (e: unknown) {
          if (!cancelled) {
            setErr(e instanceof Error ? e.message : String(e));
          }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <figure className="my-10">
      <div
        ref={ref}
        className="mermaid-host rounded-lg border border-[var(--rule)] bg-[var(--bg)] p-6 overflow-x-auto"
        dangerouslySetInnerHTML={{
          __html: svg
            ? svg
            : err
              ? `<pre class="text-xs text-red-600">${err}</pre>`
              : `<div class="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] py-8 text-center">Loading diagram…</div>`,
        }}
      />
      {caption ? (
        <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)] text-center">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
