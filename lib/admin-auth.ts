import { SignJWT, jwtVerify } from "jose";

/**
 * Admin auth uses a short, signed JWT in an HttpOnly cookie. The secret is
 * derived from ADMIN_PASSWORD so Kerry only has to set one env var. The token
 * carries no useful data, it just proves "this client knew the password at
 * cookie issue time".
 *
 * Cookie name: kdj_admin
 * Cookie lifetime: 14 days
 *
 * If ADMIN_PASSWORD is not set the middleware fails closed: any /admin/* route
 * returns 401, including /admin/login. Kerry has to set the env before the
 * admin surface comes online. This is intentional, the gate is the security
 * boundary.
 */

export const ADMIN_COOKIE_NAME = "kdj_admin";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecretKey(): Uint8Array | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  // Pad to at least 32 bytes for HS256, derive from password deterministically.
  const padded = pw.padEnd(32, "_");
  return new TextEncoder().encode(padded);
}

export async function issueAdminToken(): Promise<string | null> {
  const key = getSecretKey();
  if (!key) return null;
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = getSecretKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.admin === true;
  } catch {
    return false;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // still consume time, but result must be false
    let acc = 1;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      acc |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false;
  }
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acc === 0;
}
