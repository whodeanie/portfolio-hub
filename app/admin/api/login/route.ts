import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  issueAdminToken,
  timingSafeEqual
} from "../../../../lib/admin-auth";

export const runtime = "nodejs";

/**
 * POST body: { password: string, next?: string }
 * On success: sets the kdj_admin cookie, returns { ok: true, redirect }.
 * On failure: returns 401 with { ok: false }.
 *
 * If ADMIN_PASSWORD is unset the endpoint returns 503 so Kerry can tell the
 * admin is not configured rather than guessing the password is wrong.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD not set on server" },
      { status: 503 }
    );
  }
  let body: { password?: string; next?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const supplied = (body.password || "").toString();
  if (!timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }
  const token = await issueAdminToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Token issue failed" }, { status: 500 });
  }
  const next = body.next && body.next.startsWith("/admin") ? body.next : "/admin/analytics";
  const res = NextResponse.json({ ok: true, redirect: next });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });
  return res;
}
