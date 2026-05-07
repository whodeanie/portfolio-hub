"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

type Props = {
  sections: Section[];
  variant: "mobile" | "desktop";
};

export default function CaseStudyTOC({ sections, variant }: Props) {
  const [active, setActive] = useState<string>(sections[0]?.id || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visibility = new Map<string, number>();
    const observers: IntersectionObserver[] = [];

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibility.set(entry.target.id, entry.intersectionRatio);
          });
          let bestId = "";
          let bestRatio = 0;
          visibility.forEach((ratio, id) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestId = id;
            }
          });
          if (bestId) setActive(bestId);
        },
        {
          rootMargin: "-80px 0px -50% 0px",
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
      setOpen(false);
    }
  };

  if (variant === "desktop") {
    return (
      <nav
        aria-label="Section navigation"
        className="sticky top-24 self-start"
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
          Contents
        </div>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                className={`toc-link ${active === s.id ? "active" : ""}`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-2 z-30"
    >
      <details
        open={open}
        onToggle={(e) =>
          setOpen((e.currentTarget as HTMLDetailsElement).open)
        }
        className="rounded-lg border border-[var(--rule)] bg-[var(--bg)]/95 backdrop-blur"
      >
        <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] flex items-center justify-between">
          <span>
            Contents
            <span className="text-[var(--accent)] ml-2">
              {sections.find((s) => s.id === active)?.label || ""}
            </span>
          </span>
          <span className="text-[var(--accent)]">{open ? "−" : "+"}</span>
        </summary>
        <ul className="px-2 pb-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                className={`toc-link ${active === s.id ? "active" : ""}`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
