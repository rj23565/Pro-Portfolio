import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const CSRF_COOKIE = "csrf_token";

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set to a long random string (>=16 chars)");
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string): Promise<string> { return bcrypt.hash(pw, 12); }
export async function verifyPassword(pw: string, hash: string): Promise<boolean> { return bcrypt.compare(pw, hash); }

export async function createSession(userId: string = "admin") {
  const secret = getSecret();
  const token = await new SignJWT({ sub: userId, iat: Math.floor(Date.now()/1000) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const csrf = crypto.randomUUID();
  const isProd = process.env.NODE_ENV === "production";
  cookies().set(SESSION_COOKIE, token, { httpOnly: true, secure: isProd, sameSite: "strict", path: "/", maxAge: 60*60*24*7 });
  cookies().set(CSRF_COOKIE, csrf, { httpOnly: false, secure: isProd, sameSite: "strict", path: "/", maxAge: 60*60*24*7 });
  return { token, csrf };
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try { await jwtVerify(token, getSecret()); return true; } catch { return false; }
}

export function getSessionFromCookies(): string | null {
  const c = cookies().get(SESSION_COOKIE)?.value;
  return c || null;
}

export async function requireSession(): Promise<boolean> {
  const t = getSessionFromCookies();
  if (!t) return false;
  return verifySessionToken(t);
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(CSRF_COOKIE);
}

export function getCsrfToken(): string | null {
  return cookies().get(CSRF_COOKIE)?.value || null;
}
