import { Suspense } from "react";
import Link from "next/link";
import {
  fetchDailyPageviews,
  fetchTopPages,
  fetchTopReferrers,
  fetchGeo,
  fetchDevices,
  fetchTrackedEventCounts,
  fetchProjectClickBreakdown,
  fetchRecentSessions,
  fetchResumeToContactConversion,
  fetchKpiSummary,
  fetchUtmBreakdown,
  isPosthogConfigured,
  sessionReplayUrl
} from "../../../lib/posthog-server";
import PageviewsChart from "./PageviewsChart";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  title: "Analytics. Admin only.",
  robots: { index: false, follow: false }
};

function NotConfiguredPanel() {
  return (
    <div className="mt-10 rounded-lg border border-[var(--rule)] p-6">
      <h2 className="serif text-2xl font-medium">PostHog not configured.</h2>
      <p className="mt-3 text-sm text-[var(--fg)]/80 leading-relaxed">
        Set <code className="font-mono">POSTHOG_API_KEY</code> (personal API key with read scope)
        and optionally <code className="font-mono">POSTHOG_PROJECT_ID</code> in Vercel, then redeploy.
        See <code className="font-mono">ADMIN_ANALYTICS_SETUP.md</code> at the repo root.
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--rule)] p-5">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-36 truncate text-sm" title={label}>
        {label}
      </div>
      <div className="flex-1 rounded bg-[var(--rule)]/40 overflow-hidden">
        <div
          className="h-2 rounded"
          style={{ width: `${pct}%`, background: "var(--accent)" }}
        />
      </div>
      <div className="w-12 text-right font-mono text-xs text-[var(--fg)]/80">{value}</div>
    </div>
  );
}

async function PageviewsCard({ days }: { days: number }) {
  const data = await fetchDailyPageviews(days);
  return (
    <Card title={`Pageviews last ${days} days`}>
      {data === null ? (
        <p className="text-sm text-[var(--fg)]/60">Could not load pageviews.</p>
      ) : (
        <PageviewsChart data={data} />
      )}
    </Card>
  );
}

async function TopPagesCard({ days }: { days: number }) {
  const rows = await fetchTopPages(days, 10);
  const max = rows ? Math.max(0, ...rows.map((r) => r.pageviews)) : 0;
  return (
    <Card title={`Top pages last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No pages tracked yet.</p>
      ) : (
        <div>
          {rows.map((r) => (
            <BarRow key={r.path} label={r.path} value={r.pageviews} max={max} />
          ))}
        </div>
      )}
    </Card>
  );
}

async function TopReferrersCard({ days }: { days: number }) {
  const rows = await fetchTopReferrers(days, 10);
  const max = rows ? Math.max(0, ...rows.map((r) => r.visits)) : 0;
  return (
    <Card title={`Top referrers last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No referrer data yet.</p>
      ) : (
        <div>
          {rows.map((r) => (
            <BarRow key={r.referrer} label={r.referrer} value={r.visits} max={max} />
          ))}
        </div>
      )}
    </Card>
  );
}

async function GeoCard({ days }: { days: number }) {
  const rows = await fetchGeo(days, 20);
  return (
    <Card title={`Geography last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No geo data yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              <th className="py-1">Country</th>
              <th className="py-1">City</th>
              <th className="py-1 text-right">Visits</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.country}-${r.city}-${i}`} className="border-t border-[var(--rule)]/50">
                <td className="py-1">{r.country}</td>
                <td className="py-1 text-[var(--fg)]/70">{r.city}</td>
                <td className="py-1 text-right font-mono">{r.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

async function DevicesCard({ days }: { days: number }) {
  const rows = await fetchDevices(days);
  const max = rows ? Math.max(0, ...rows.map((r) => r.visits)) : 0;
  return (
    <Card title={`Devices last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No device data yet.</p>
      ) : (
        <div>
          {rows.map((r) => (
            <BarRow key={r.device} label={r.device} value={r.visits} max={max} />
          ))}
        </div>
      )}
    </Card>
  );
}

async function EventCountsCard({ days }: { days: number }) {
  const rows = await fetchTrackedEventCounts(days);
  return (
    <Card title={`Custom events last ${days} days`}>
      {!rows ? (
        <p className="text-sm text-[var(--fg)]/60">Could not load events.</p>
      ) : (
        <ul className="text-sm">
          {rows.map((r) => (
            <li
              key={r.event}
              className="flex items-center justify-between py-1 border-b border-[var(--rule)]/40 last:border-b-0"
            >
              <span className="font-mono text-xs">{r.event}</span>
              <span className="font-mono text-xs text-[var(--fg)]/80">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

async function ProjectClicksCard({ days }: { days: number }) {
  const rows = await fetchProjectClickBreakdown(days, 15);
  const max = rows ? Math.max(0, ...rows.map((r) => r.clicks)) : 0;
  return (
    <Card title={`Project card clicks last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No project clicks tracked yet.</p>
      ) : (
        <div>
          {rows.map((r) => (
            <BarRow key={r.project_title} label={r.project_title} value={r.clicks} max={max} />
          ))}
        </div>
      )}
    </Card>
  );
}

async function ConversionCard({ days }: { days: number }) {
  const c = await fetchResumeToContactConversion(days);
  return (
    <Card title={`Resume to contact, last ${days} days`}>
      {!c ? (
        <p className="text-sm text-[var(--fg)]/60">No conversion data yet.</p>
      ) : (
        <div>
          <div className="text-3xl font-medium">{c.rate_pct}%</div>
          <p className="mt-2 text-xs text-[var(--fg)]/70">
            {c.also_contacted} of {c.resume_clickers} resume PDF viewers also submitted the contact form.
          </p>
        </div>
      )}
    </Card>
  );
}

// -- KPI summary row -------------------------------------------------------

function pctDelta(current: number, prev: number): { label: string; tone: "up" | "down" | "flat" } {
  if (prev === 0 && current === 0) return { label: "no change", tone: "flat" };
  if (prev === 0) return { label: "new", tone: "up" };
  const pct = ((current - prev) / prev) * 100;
  if (Math.abs(pct) < 1) return { label: "no change", tone: "flat" };
  const rounded = Math.round(pct);
  return {
    label: `${rounded > 0 ? "+" : ""}${rounded}% vs prior`,
    tone: rounded > 0 ? "up" : "down"
  };
}

function Kpi({
  label,
  value,
  current,
  prev
}: {
  label: string;
  value: number;
  current: number;
  prev: number;
}) {
  const delta = pctDelta(current, prev);
  const toneColor =
    delta.tone === "up"
      ? "var(--accent)"
      : delta.tone === "down"
        ? "#c46a4f"
        : "var(--muted)";
  return (
    <div className="rounded-lg border border-[var(--rule)] p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-3xl font-medium leading-none">{value.toLocaleString()}</div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: toneColor }}>
        {delta.label}
      </div>
    </div>
  );
}

async function KpiSummaryRow({ days }: { days: number }) {
  const k = await fetchKpiSummary(days);
  if (!k) {
    return (
      <div className="rounded-lg border border-[var(--rule)] p-5 text-sm text-[var(--fg)]/60">
        No data yet. Visit the homepage in a private window to populate the KPIs.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Kpi label="Visits" value={k.visits} current={k.visits} prev={k.visits_prev} />
      <Kpi
        label="Unique visitors"
        value={k.unique_visitors}
        current={k.unique_visitors}
        prev={k.unique_visitors_prev}
      />
      <Kpi
        label="Resume PDF clicks"
        value={k.resume_pdf_clicks}
        current={k.resume_pdf_clicks}
        prev={k.resume_pdf_clicks_prev}
      />
      <Kpi
        label="Contact submits"
        value={k.contact_submits}
        current={k.contact_submits}
        prev={k.contact_submits_prev}
      />
    </div>
  );
}

// -- UTM breakdown ---------------------------------------------------------

async function UtmBreakdownCard({ days }: { days: number }) {
  const rows = await fetchUtmBreakdown(days, 20);
  return (
    <Card title={`Campaign attribution last ${days} days`}>
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">
          No tagged traffic yet. Build a link in <code className="font-mono">/admin/share</code> and send it.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                <th className="py-1">Campaign</th>
                <th className="py-1">Source</th>
                <th className="py-1">Medium</th>
                <th className="py-1 text-right">Visits</th>
                <th className="py-1 text-right">Unique</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.campaign}-${r.source}-${r.medium}-${i}`}
                  className="border-t border-[var(--rule)]/50"
                >
                  <td className="py-1.5 font-mono text-xs">{r.campaign}</td>
                  <td className="py-1.5 font-mono text-xs text-[var(--fg)]/80">{r.source}</td>
                  <td className="py-1.5 font-mono text-xs text-[var(--fg)]/70">{r.medium}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{r.visits}</td>
                  <td className="py-1.5 text-right font-mono text-xs text-[var(--fg)]/80">
                    {r.unique_visitors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function formatTimestamp(s: string): string {
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

async function RecentSessionsCard() {
  const rows = await fetchRecentSessions(20);
  return (
    <Card title="Recent sessions">
      {!rows || rows.length === 0 ? (
        <p className="text-sm text-[var(--fg)]/60">No sessions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                <th className="py-1">When</th>
                <th className="py-1">Geo</th>
                <th className="py-1">Device</th>
                <th className="py-1">Source</th>
                <th className="py-1">Pages</th>
                <th className="py-1 text-right">Duration</th>
                <th className="py-1 text-right">Replay</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.session_id} className="border-t border-[var(--rule)]/50 align-top">
                  <td className="py-2 whitespace-nowrap">{formatTimestamp(s.start)}</td>
                  <td className="py-2 whitespace-nowrap">
                    {s.country}
                    {s.city ? `, ${s.city}` : ""}
                  </td>
                  <td className="py-2 whitespace-nowrap font-mono text-xs">{s.device}</td>
                  <td className="py-2 whitespace-nowrap">
                    {s.utm_campaign ? (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)]">
                        {s.utm_campaign}
                      </span>
                    ) : s.referrer ? (
                      <span className="font-mono text-[11px] text-[var(--fg)]/80">{s.referrer}</span>
                    ) : (
                      <span className="font-mono text-[11px] text-[var(--muted)]">direct</span>
                    )}
                    {s.utm_source ? (
                      <span className="ml-1 font-mono text-[10px] text-[var(--fg)]/60">
                        via {s.utm_source}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.pages.map((p, i) => (
                        <code
                          key={`${s.session_id}-${i}-${p}`}
                          className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--rule)]/40"
                        >
                          {p}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right font-mono text-xs whitespace-nowrap">
                    {formatDuration(s.duration_seconds)}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <a
                      href={sessionReplayUrl(s.session_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] uppercase tracking-widest text-[var(--accent)] hover:underline"
                    >
                      Watch ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="h-32 rounded-lg border border-[var(--rule)]/50 animate-pulse" />
  );
}

export default function AdminAnalyticsPage({
  searchParams
}: {
  searchParams?: { range?: string };
}) {
  const days = searchParams?.range === "7" ? 7 : 30;
  if (!isPosthogConfigured()) {
    return (
      <main className="min-h-screen px-6 sm:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <Header days={days} />
          <NotConfiguredPanel />
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16">
      <div className="mx-auto max-w-6xl">
        <Header days={days} />

        <div className="mt-8">
          <Suspense fallback={<Skeleton />}>
            <KpiSummaryRow days={days} />
          </Suspense>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Suspense fallback={<Skeleton />}>
              <PageviewsCard days={days} />
            </Suspense>
          </div>
          <Suspense fallback={<Skeleton />}>
            <ConversionCard days={days} />
          </Suspense>
        </div>

        <div className="mt-4">
          <Suspense fallback={<Skeleton />}>
            <UtmBreakdownCard days={days} />
          </Suspense>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Suspense fallback={<Skeleton />}>
            <TopPagesCard days={days} />
          </Suspense>
          <Suspense fallback={<Skeleton />}>
            <TopReferrersCard days={days} />
          </Suspense>
          <Suspense fallback={<Skeleton />}>
            <DevicesCard days={days} />
          </Suspense>
          <Suspense fallback={<Skeleton />}>
            <EventCountsCard days={days} />
          </Suspense>
          <Suspense fallback={<Skeleton />}>
            <ProjectClicksCard days={days} />
          </Suspense>
          <Suspense fallback={<Skeleton />}>
            <GeoCard days={days} />
          </Suspense>
        </div>

        <div className="mt-4">
          <Suspense fallback={<Skeleton />}>
            <RecentSessionsCard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function Header({ days }: { days: number }) {
  return (
    <header className="flex items-baseline justify-between gap-4 flex-wrap">
      <div>
        <h1 className="serif text-4xl font-medium tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--fg)]/70">Private. Data refreshes on each visit.</p>
      </div>
      <nav className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest">
        <Link
          href="/admin/analytics?range=7"
          className={days === 7 ? "text-[var(--accent)]" : "text-[var(--fg)]/70 hover:text-[var(--accent)]"}
        >
          7 days
        </Link>
        <Link
          href="/admin/analytics?range=30"
          className={days === 30 ? "text-[var(--accent)]" : "text-[var(--fg)]/70 hover:text-[var(--accent)]"}
        >
          30 days
        </Link>
        <Link href="/admin/share" className="text-[var(--fg)]/70 hover:text-[var(--accent)]">
          Share helper
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}

