import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8).max(200),
  setupToken: z.string().optional()
});

export async function POST(req: NextRequest) {
  const key = getClientKey(req, "setup");
  const rl = rateLimit(key, 5, 60*1000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json().catch(()=>null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existingHash = await db.getPasswordHash();
  const requiredToken = process.env.ADMIN_SETUP_TOKEN;

  // If admin already exists, require setup token
  if (existingHash) {
    if (!requiredToken) return NextResponse.json({ error: "Admin already configured. Set ADMIN_SETUP_TOKEN to allow rotation, or reset via database." }, { status: 403 });
    if (parsed.data.setupToken !== requiredToken) return NextResponse.json({ error: "Invalid setup token" }, { status: 403 });
  } else {
    // No admin yet: if token required, enforce it
    if (requiredToken && parsed.data.setupToken !== requiredToken) {
      return NextResponse.json({ error: "Invalid setup token" }, { status: 403 });
    }
  }

  const hash = await hashPassword(parsed.data.password);
  await db.setPasswordHash(hash);
  return NextResponse.json({ ok: true });
}
