import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./lib/admin-auth";

/**
 * Gates /admin/* behind a signed cookie. /admin/login itself is allowed so
 * users can reach the form to authenticate.
 *
 * If ADMIN_PASSWORD is not set in the environment, verifyAdminToken always
 * returns false and only /admin/login is reachable. The login form will then
 * show a "setup needed" message because the POST handler also checks the env.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Always allow the login page and login/logout API.
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname.startsWith("/admin/api/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ok = await verifyAdminToken(token);
  if (ok) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"]
};
