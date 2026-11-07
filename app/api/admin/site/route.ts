import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const t = req.cookies.get("session")?.value;
  if (!t) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try { const { jwtVerify } = await import("jose"); await jwtVerify(t, new TextEncoder().encode(secret)); return true; } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await db.getStore();
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // bounded body
  const text = await req.text();
  if (text.length > 50_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  let body: any;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Support partial updates; validate relevant fields
  // We expect { profile: {...}, profilePhoto, resumeUrl, accentColor, social, featuredProjectId, etc }
  // We'll merge with existing and validate via profileSchema where applicable

  const store = await db.getStore();
  let nextProfile = { ...store.profile };

  if (body.profile) {
    // Validate profile subset
    const toValidate = { ...nextProfile, ...body.profile, social: body.profile.social || nextProfile.social };
    // Ensure age handling: empty string => null
    if (toValidate.age === "" || toValidate.age === undefined) toValidate.age = null;
    if (typeof toValidate.age === "string") {
      const n = parseInt(toValidate.age, 10);
      toValidate.age = isNaN(n) ? null : n;
    }
    const parsed = profileSchema.safeParse(toValidate);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    nextProfile = { ...nextProfile, ...parsed.data } as any;
  }

  // Direct fields: profilePhoto, resumeUrl, accentColor, etc if sent top-level
  if (typeof body.profilePhoto === "string") nextProfile.profilePhoto = body.profilePhoto.slice(0,2000);
  if (typeof body.resumeUrl === "string") nextProfile.resumeUrl = body.resumeUrl.slice(0,2000);
  if (typeof body.accentColor === "string") {
    if (!/^#([0-9a-fA-F]{6})$/.test(body.accentColor)) return NextResponse.json({ error: "Invalid accent hex" }, { status: 400 });
    nextProfile.accentColor = body.accentColor;
  }

  // Validate URLs for social if provided
  if (body.social) {
    for (const [k,v] of Object.entries(body.social as Record<string,string>)) {
      if (v && v.length > 0) {
        try {
          const u = new URL(v);
          if (!["https:", "http:", "mailto:", "tel:"].includes(u.protocol)) return NextResponse.json({ error: `Invalid URL for ${k}` }, { status: 400 });
        } catch { return NextResponse.json({ error: `Invalid URL for ${k}` }, { status: 400 }); }
      }
    }
    nextProfile.social = { ...nextProfile.social, ...body.social };
  }

  // featuredProjectId may be null
  if ("featuredProjectId" in body) {
    const v = body.featuredProjectId;
    if (v === null || v === "" ) nextProfile.featuredProjectId = null;
    else if (typeof v === "string") nextProfile.featuredProjectId = v.slice(0,100);
  }

  await db.updateStore(d => ({ ...d, profile: nextProfile, branding: { accentColor: nextProfile.accentColor } }));
  const updated = await db.getStore();
  return NextResponse.json(updated);
}
