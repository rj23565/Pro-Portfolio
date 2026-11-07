import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceSchema } from "@/lib/validation";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const t = req.cookies.get("session")?.value;
  if (!t) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try { const { jwtVerify } = await import("jose"); await jwtVerify(t, new TextEncoder().encode(secret)); return true; } catch { return false; }
}
export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = await db.getStore();
  return NextResponse.json(s.services);
}
export async function POST(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Expect { services: [...] } or single
  if (Array.isArray(body.services)) {
    const list = body.services;
    // validate each
    for (const item of list) {
      const p = serviceSchema.safeParse(item);
      if (!p.success) return NextResponse.json({ error: p.error.errors[0].message }, { status: 400 });
    }
    // assign ids if missing
    const normalized = list.map((it:any, idx:number)=> ({ id: it.id || `svc-${Date.now()}-${idx}`, title: it.title, description: it.description || "", icon: it.icon || "spark", order: typeof it.order==="number"?it.order:idx }));
    await db.updateStore(d=> ({ ...d, services: normalized }));
    return NextResponse.json(normalized);
  } else {
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const d = parsed.data;
    const store = await db.getStore();
    let services = [...store.services];
    if (d.id) {
      const i = services.findIndex(s=>s.id===d.id);
      if (i>=0) services[i] = { ...services[i], ...d } as any;
      else services.push({ id: d.id, title: d.title, description: d.description||"", icon: d.icon||"spark", order: d.order||0 });
    } else {
      services.push({ id: `svc-${Date.now()}`, title: d.title, description: d.description||"", icon: d.icon||"spark", order: d.order||0 });
    }
    await db.updateStore(store=> ({ ...store, services }));
    return NextResponse.json(services);
  }
}
export async function DELETE(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const s = await db.getStore();
  const services = s.services.filter(x=>x.id!==id);
  await db.updateStore(d=> ({ ...d, services }));
  return NextResponse.json({ ok: true });
}
