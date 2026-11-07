import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

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
  return NextResponse.json(store.projects);
}

export async function POST(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = getClientKey(req, "projects-post");
  const rl = rateLimit(key, 20, 60*1000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const bodyText = await req.text();
  if (bodyText.length > 100_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const body = JSON.parse(bodyText);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed", details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;

  // For Textile, strip description publicly but we still store but will hide; enforce no description required
  // Duplicate image detection: we check hashes? But we only have URLs; we can check exact duplicate URLs to avoid
  // Retain existing work when adding new work: we append distinct images

  const store = await db.getStore();
  let projects = [...store.projects];

  // Check duplicate images within request: dedupe
  if (data.images) data.images = [...new Set(data.images)];
  if (data.coverImage && data.images.includes(data.coverImage)) {
    // keep but not duplicate separately
  }

  if (data.id) {
    const idx = projects.findIndex(p=>p.id===data.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existing = projects[idx];
    // retain existing work when adding new work: merge images, avoid exact duplicates
    let mergedImages = data.images || [];
    // If update provides new images, we merge distinct: keep existing + new distinct
    // But if data.images is explicit list from admin (full gallery), we should respect it but dedupe
    // We'll dedupe by URL exact match
    const distinct = [...new Set(mergedImages)];
    projects[idx] = {
      ...existing,
      title: data.title,
      category: data.category,
      description: data.description || "",
      order: data.order ?? existing.order,
      status: data.status,
      coverImage: data.coverImage || existing.coverImage,
      images: distinct,
      featured: data.featured ?? existing.featured,
      updatedAt: new Date().toISOString()
    };
  } else {
    const id = data.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40) + "-" + Math.random().toString(36).slice(2,6);
    const proj = {
      id,
      title: data.title,
      category: data.category,
      description: data.description || "",
      order: data.order ?? projects.length,
      status: data.status,
      coverImage: data.coverImage || "",
      images: data.images ? [...new Set(data.images)] : [],
      featured: data.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.push(proj);
  }

  // Ensure ordering uniqueness not required
  await db.updateStore(d => ({ ...d, projects }));
  const updated = await db.getStore();
  return NextResponse.json(updated.projects);
}

export async function DELETE(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const store = await db.getStore();
  const projects = store.projects.filter(p=>p.id!==id);
  await db.updateStore(d => ({ ...d, projects, profile: d.profile.featuredProjectId===id ? { ...d.profile, featuredProjectId: null } : d.profile }));
  return NextResponse.json({ ok: true });
}
