/**
 * Server side PostHog REST client. Uses fetch + the personal API key.
 *
 * Why fetch and not posthog-node: posthog-node is for *sending* events.
 * For *reading* (HogQL queries, sessions list) the official method is the
 * REST API with a personal API key, which is what this module does.
 *
 * All functions return null on any error and never throw. The dashboard page
 * renders a "not configured" or "no data yet" panel rather than crashing.
 *
 * Required env vars:
 *  - POSTHOG_API_KEY     personal API key (phx_..., read scope is fine)
 *  - POSTHOG_PROJECT_ID  numeric project id from PostHog. If unset we attempt
 *                        to resolve it from /api/projects/@current.
 *  - NEXT_PUBLIC_POSTHOG_HOST defaults to https://us.i.posthog.com
 */

const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");

export function isPosthogConfigured(): boolean {
  return Boolean(process.env.POSTHOG_API_KEY);
}

let cachedProjectId: string | null = null;

async function ph(path: string, init?: RequestInit): Promise<Response | null> {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  try {
    return await fetch(`${HOST}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init?.headers || {})
      },
      // Always fetch fresh data for the dashboard.
      cache: "no-store"
    });
  } catch {
    return null;
  }
}

export async function getProjectId(): Promise<string | null> {
  if (cachedProjectId) return cachedProjectId;
  const fromEnv = process.env.POSTHOG_PROJECT_ID;
  if (fromEnv) {
    cachedProjectId = fromEnv;
    return cachedProjectId;
  }
  const res = await ph("/api/projects/@current/");
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    if (data && (data.id || data.id === 0)) {
      cachedProjectId = String(data.id);
      return cachedProjectId;
    }
  } catch {
    return null;
  }
  return null;
}

async function hogql<T>(query: string): Promise<T[] | null> {
  const projectId = await getProjectId();
  if (!projectId) return null;
  const res = await ph(`/api/projects/${projectId}/query/`, {
    method: "POST",
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query }
    })
  });
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    const rows: unknown[] = data?.results || [];
    const columns: string[] = data?.columns || [];
    return rows.map((row) => {
      const r = row as unknown[];
      const out: Record<string, unknown> = {};
      columns.forEach((c, i) => {
        out[c] = r[i];
      });
      return out as unknown as T;
    });
  } catch {
    return null;
  }
}

// -- Public query helpers ---------------------------------------------------

export type DailyPageviews = { day: string; pageviews: number };
export async function fetchDailyPageviews(days: number): Promise<DailyPageviews[] | null> {
  const q = `
    SELECT
      toDate(timestamp) AS day,
      count() AS pageviews
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY day
    ORDER BY day ASC
  `;
  type Row = { day: string; pageviews: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({
        day: String(r.day).slice(0, 10),
        pageviews: Number(r.pageviews) || 0
      }))
    : null;
}

export type TopPage = { path: string; pageviews: number };
export async function fetchTopPages(days: number, limit = 10): Promise<TopPage[] | null> {
  const q = `
    SELECT
      properties.$pathname AS path,
      count() AS pageviews
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND properties.$pathname IS NOT NULL
    GROUP BY path
    ORDER BY pageviews DESC
    LIMIT ${limit}
  `;
  type Row = { path: string; pageviews: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({ path: String(r.path || "/"), pageviews: Number(r.pageviews) || 0 }))
    : null;
}

export type TopReferrer = { referrer: string; visits: number };
export async function fetchTopReferrers(days: number, limit = 10): Promise<TopReferrer[] | null> {
  const q = `
    SELECT
      coalesce(nullIf(properties.$referring_domain, ''), 'direct') AS referrer,
      count() AS visits
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY referrer
    ORDER BY visits DESC
    LIMIT ${limit}
  `;
  type Row = { referrer: string; visits: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({ referrer: String(r.referrer || "direct"), visits: Number(r.visits) || 0 }))
    : null;
}

export type GeoRow = { country: string; city: string; visits: number };
export async function fetchGeo(days: number, limit = 20): Promise<GeoRow[] | null> {
  const q = `
    SELECT
      coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') AS country,
      coalesce(nullIf(properties.$geoip_city_name, ''), 'Unknown')    AS city,
      count() AS visits
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY country, city
    ORDER BY visits DESC
    LIMIT ${limit}
  `;
  type Row = { country: string; city: string; visits: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({
        country: String(r.country || "Unknown"),
        city: String(r.city || "Unknown"),
        visits: Number(r.visits) || 0
      }))
    : null;
}

export type DeviceRow = { device: string; visits: number };
export async function fetchDevices(days: number): Promise<DeviceRow[] | null> {
  const q = `
    SELECT
      coalesce(nullIf(properties.$device_type, ''), 'unknown') AS device,
      count() AS visits
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY device
    ORDER BY visits DESC
  `;
  type Row = { device: string; visits: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({ device: String(r.device || "unknown"), visits: Number(r.visits) || 0 }))
    : null;
}

export type EventCount = { event: string; count: number };
export async function fetchTrackedEventCounts(days: number): Promise<EventCount[] | null> {
  const tracked = [
    "resume_pdf_clicked",
    "project_card_clicked",
    "contact_form_submitted",
    "github_link_clicked",
    "external_link_clicked"
  ];
  const list = tracked.map((e) => `'${e}'`).join(",");
  const q = `
    SELECT event, count() AS c
    FROM events
    WHERE event IN (${list})
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY event
    ORDER BY c DESC
  `;
  type Row = { event: string; c: number };
  const rows = await hogql<Row>(q);
  if (!rows) return null;
  // Ensure every tracked event appears, with 0 if absent.
  const found = new Map(rows.map((r) => [String(r.event), Number(r.c) || 0]));
  return tracked.map((e) => ({ event: e, count: found.get(e) || 0 }));
}

export type ProjectClick = { project_title: string; clicks: number };
export async function fetchProjectClickBreakdown(days: number, limit = 15): Promise<ProjectClick[] | null> {
  const q = `
    SELECT
      coalesce(properties.project_title, 'Unknown') AS project_title,
      count() AS clicks
    FROM events
    WHERE event = 'project_card_clicked'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY project_title
    ORDER BY clicks DESC
    LIMIT ${limit}
  `;
  type Row = { project_title: string; clicks: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({
        project_title: String(r.project_title || "Unknown"),
        clicks: Number(r.clicks) || 0
      }))
    : null;
}

export type Session = {
  session_id: string;
  start: string;
  duration_seconds: number;
  country: string;
  city: string;
  device: string;
  pages: string[];
  referrer: string;
  utm_source: string;
  utm_campaign: string;
};

export async function fetchRecentSessions(limit = 20): Promise<Session[] | null> {
  // argMin grabs the value tied to the earliest timestamp in the session, so
  // referrer + UTM reflect how the visitor first arrived rather than whatever
  // the last page in the session happened to carry.
  const q = `
    SELECT
      $session_id AS session_id,
      min(timestamp) AS start_ts,
      dateDiff('second', min(timestamp), max(timestamp)) AS duration_seconds,
      any(properties.$geoip_country_name) AS country,
      any(properties.$geoip_city_name) AS city,
      any(properties.$device_type) AS device,
      arraySlice(groupArray(properties.$pathname), 1, 20) AS pages,
      argMin(properties.$referring_domain, timestamp) AS referrer,
      argMin(properties.utm_source, timestamp)        AS utm_source,
      argMin(properties.utm_campaign, timestamp)      AS utm_campaign
    FROM events
    WHERE event = '$pageview'
      AND $session_id IS NOT NULL
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY session_id
    ORDER BY start_ts DESC
    LIMIT ${limit}
  `;
  type Row = {
    session_id: string;
    start_ts: string;
    duration_seconds: number;
    country: string;
    city: string;
    device: string;
    pages: string[];
    referrer: string;
    utm_source: string;
    utm_campaign: string;
  };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({
        session_id: String(r.session_id || ""),
        start: String(r.start_ts || ""),
        duration_seconds: Number(r.duration_seconds) || 0,
        country: String(r.country || "Unknown"),
        city: String(r.city || ""),
        device: String(r.device || "unknown"),
        pages: Array.isArray(r.pages) ? r.pages.filter(Boolean).map(String) : [],
        referrer: String(r.referrer || ""),
        utm_source: String(r.utm_source || ""),
        utm_campaign: String(r.utm_campaign || "")
      }))
    : null;
}

/**
 * Conversion: % of unique users who fired resume_pdf_clicked and then later
 * fired contact_form_submitted within the same time window.
 */
export async function fetchResumeToContactConversion(days: number): Promise<{
  resume_clickers: number;
  also_contacted: number;
  rate_pct: number;
} | null> {
  const q = `
    WITH resume_users AS (
      SELECT distinct_id, min(timestamp) AS first_resume_at
      FROM events
      WHERE event = 'resume_pdf_clicked'
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY distinct_id
    ),
    contact_users AS (
      SELECT distinct_id, min(timestamp) AS first_contact_at
      FROM events
      WHERE event = 'contact_form_submitted'
        AND timestamp >= now() - INTERVAL ${days} DAY
      GROUP BY distinct_id
    )
    SELECT
      count(distinct r.distinct_id) AS resume_clickers,
      count(distinct c.distinct_id) AS also_contacted
    FROM resume_users r
    LEFT JOIN contact_users c
      ON c.distinct_id = r.distinct_id AND c.first_contact_at >= r.first_resume_at
  `;
  type Row = { resume_clickers: number; also_contacted: number };
  const rows = await hogql<Row>(q);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  const resume_clickers = Number(r.resume_clickers) || 0;
  const also_contacted = Number(r.also_contacted) || 0;
  const rate_pct = resume_clickers === 0 ? 0 : Math.round((also_contacted / resume_clickers) * 1000) / 10;
  return { resume_clickers, also_contacted, rate_pct };
}

export function sessionReplayUrl(sessionId: string): string {
  // PostHog hosts the same replay viewer regardless of region.
  return `${HOST}/replay/${encodeURIComponent(sessionId)}`;
}

// -- KPI summary -----------------------------------------------------------

export type KpiSummary = {
  visits: number;
  visits_prev: number;
  unique_visitors: number;
  unique_visitors_prev: number;
  resume_pdf_clicks: number;
  resume_pdf_clicks_prev: number;
  contact_submits: number;
  contact_submits_prev: number;
};

export async function fetchKpiSummary(days: number): Promise<KpiSummary | null> {
  // Two windows: current = last N days, previous = the N days before that.
  // Computed in a single HogQL query so the dashboard pays one round trip.
  const q = `
    SELECT
      countIf(event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY) AS visits,
      countIf(event = '$pageview' AND timestamp >= now() - INTERVAL ${days * 2} DAY AND timestamp < now() - INTERVAL ${days} DAY) AS visits_prev,

      uniqIf(distinct_id, event = '$pageview' AND timestamp >= now() - INTERVAL ${days} DAY) AS unique_visitors,
      uniqIf(distinct_id, event = '$pageview' AND timestamp >= now() - INTERVAL ${days * 2} DAY AND timestamp < now() - INTERVAL ${days} DAY) AS unique_visitors_prev,

      countIf(event = 'resume_pdf_clicked' AND timestamp >= now() - INTERVAL ${days} DAY) AS resume_pdf_clicks,
      countIf(event = 'resume_pdf_clicked' AND timestamp >= now() - INTERVAL ${days * 2} DAY AND timestamp < now() - INTERVAL ${days} DAY) AS resume_pdf_clicks_prev,

      countIf(event = 'contact_form_submitted' AND timestamp >= now() - INTERVAL ${days} DAY) AS contact_submits,
      countIf(event = 'contact_form_submitted' AND timestamp >= now() - INTERVAL ${days * 2} DAY AND timestamp < now() - INTERVAL ${days} DAY) AS contact_submits_prev
    FROM events
    WHERE timestamp >= now() - INTERVAL ${days * 2} DAY
  `;
  const rows = await hogql<Record<string, number>>(q);
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  const n = (k: string) => Number(r[k]) || 0;
  return {
    visits: n("visits"),
    visits_prev: n("visits_prev"),
    unique_visitors: n("unique_visitors"),
    unique_visitors_prev: n("unique_visitors_prev"),
    resume_pdf_clicks: n("resume_pdf_clicks"),
    resume_pdf_clicks_prev: n("resume_pdf_clicks_prev"),
    contact_submits: n("contact_submits"),
    contact_submits_prev: n("contact_submits_prev")
  };
}

// -- UTM campaign breakdown ------------------------------------------------

export type UtmRow = {
  campaign: string;
  source: string;
  medium: string;
  visits: number;
  unique_visitors: number;
};

export async function fetchUtmBreakdown(days: number, limit = 20): Promise<UtmRow[] | null> {
  const q = `
    SELECT
      coalesce(nullIf(properties.utm_campaign, ''), '(none)') AS campaign,
      coalesce(nullIf(properties.utm_source, ''),   '(none)') AS source,
      coalesce(nullIf(properties.utm_medium, ''),   '(none)') AS medium,
      count() AS visits,
      uniq(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${days} DAY
      AND (
        properties.utm_campaign IS NOT NULL
        OR properties.utm_source IS NOT NULL
        OR properties.utm_medium IS NOT NULL
      )
    GROUP BY campaign, source, medium
    ORDER BY visits DESC
    LIMIT ${limit}
  `;
  type Row = { campaign: string; source: string; medium: string; visits: number; unique_visitors: number };
  const rows = await hogql<Row>(q);
  return rows
    ? rows.map((r) => ({
        campaign: String(r.campaign || "(none)"),
        source: String(r.source || "(none)"),
        medium: String(r.medium || "(none)"),
        visits: Number(r.visits) || 0,
        unique_visitors: Number(r.unique_visitors) || 0
      }))
    : null;
}
