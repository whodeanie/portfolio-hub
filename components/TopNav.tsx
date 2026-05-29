"use client";

import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Resume' },
  { href: '/work', label: 'Case studies' },
  { href: '/coach', label: 'Coaching' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/play', label: 'Play' },
  { href: '/contact', label: 'Contact' },
];

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--rule)]">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="serif text-lg font-medium hover:text-[var(--accent)] transition-colors">
          Kerry Dean Jr.
        </Link>
        <ul className="hidden items-center gap-5 sm:gap-7 md:flex">
          {LINKS.slice(1).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-widest text-[var(--fg)]/70 hover:text-[var(--accent)] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
