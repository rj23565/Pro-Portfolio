import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, hashPassword } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const key = getClientKey(req, "login");
  const rl = rateLimit(key, 5, 60*1000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs/1000)) } });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { password } = parsed.data;

  const hash = await db.getPasswordHash();
  if (!hash) return NextResponse.json({ error: "No admin configured. Visit /admin/setup first." }, { status: 400 });

  const ok = await verifyPassword(password, hash);
  if (!ok) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  // create session - need to call without cookies() outside request? Use NextResponse cookies
  // We'll manually set cookies via response
  const { SignJWT } = await import("jose");
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return NextResponse.json({ error: "Server misconfigured: SESSION_SECRET" }, { status: 500 });
  const keyEnc = new TextEncoder().encode(secret);
  const token = await new SignJWT({ sub: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(keyEnc);
  const csrf = crypto.randomUUID();
  const isProd = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, { httpOnly: true, secure: isProd, sameSite: "strict", path: "/", maxAge: 60*60*24*7 });
  res.cookies.set("csrf_token", csrf, { httpOnly: false, secure: isProd, sameSite: "strict", path: "/", maxAge: 60*60*24*7 });
  return res;
}
