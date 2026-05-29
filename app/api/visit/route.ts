import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface VisitPayload {
  path?: string;
  referrer?: string;
  screen?: string;
  timezone?: string;
  title?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var visitAlertRateLimit: Map<string, RateLimitEntry> | undefined;
}

const rateLimit = globalThis.visitAlertRateLimit ?? new Map<string, RateLimitEntry>();
globalThis.visitAlertRateLimit = rateLimit;

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|linkedinbot|twitterbot|vercel|uptime/i;

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  return (
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getRequestOriginAllowed(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) return true;

  try {
    const originHost = new URL(origin).host;
    const allowedHosts = new Set(
      (process.env.VISIT_ALERT_ALLOWED_HOSTS ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    );

    return originHost === host || allowedHosts.has(originHost);
  } catch {
    return false;
  }
}

function isRateLimited(clientKey: string) {
  const cooldownMinutes = Number(process.env.VISIT_ALERT_COOLDOWN_MINUTES ?? 30);
  const windowMs = Math.max(cooldownMinutes, 1) * 60 * 1000;
  const now = Date.now();
  const current = rateLimit.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimit.set(clientKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  rateLimit.set(clientKey, current);
  return true;
}

function locationFromHeaders(request: NextRequest) {
  const city = request.headers.get('x-vercel-ip-city');
  const region = request.headers.get('x-vercel-ip-country-region');
  const country = request.headers.get('x-vercel-ip-country');

  return [city, region, country].filter(Boolean).join(', ') || 'Unknown location';
}

function compactUserAgent(userAgent: string) {
  if (/mobile|iphone|android/i.test(userAgent)) return 'Mobile browser';
  if (/ipad|tablet/i.test(userAgent)) return 'Tablet browser';
  if (/macintosh|windows|linux/i.test(userAgent)) return 'Desktop browser';

  return 'Browser';
}

function trimLine(value: string | undefined, fallback: string) {
  const clean = value?.replace(/\s+/g, ' ').trim();

  return clean ? clean.slice(0, 140) : fallback;
}

function buildMessage(request: NextRequest, payload: VisitPayload) {
  const userAgent = request.headers.get('user-agent') ?? '';
  const timestamp = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Chicago',
  }).format(new Date());

  return [
    `Kerry hub visit: ${trimLine(payload.path, '/')}`,
    `When: ${timestamp} CT`,
    `Where: ${locationFromHeaders(request)}`,
    `Device: ${compactUserAgent(userAgent)}, ${trimLine(payload.screen, 'Unknown screen')}`,
    `Referrer: ${trimLine(payload.referrer, 'Direct / unknown')}`,
    `Timezone: ${trimLine(payload.timezone, 'Unknown timezone')}`,
  ].join('\n');
}

async function sendTwilioSms(message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.VISIT_ALERT_TO_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    return { configured: false, sent: false };
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      body: new URLSearchParams({ Body: message, From: from, To: to }),
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    }
  );

  if (!response.ok) {
    throw new Error(`Twilio SMS failed: ${response.status} ${await response.text()}`);
  }

  return { configured: true, sent: true };
}

export async function POST(request: NextRequest) {
  if (!getRequestOriginAllowed(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  if (BOT_PATTERN.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: 'bot' });
  }

  if (isRateLimited(getClientKey(request))) {
    return NextResponse.json({ ok: true, skipped: 'rate-limited' });
  }

  const payload = (await request.json().catch(() => ({}))) as VisitPayload;

  try {
    const sms = await sendTwilioSms(buildMessage(request, payload));

    return NextResponse.json({
      ok: true,
      smsConfigured: sms.configured,
      smsSent: sms.sent,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
