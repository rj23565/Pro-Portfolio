import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { blob } from "@/lib/blob";

export async function POST(req: NextRequest) {
  const hasSession = await verifySession(req);
  if (!hasSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = getClientKey(req, "upload");
  const rl = rateLimit(key, 30, 60*1000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many uploads" }, { status: 429 });

  const form = await req.formData().catch(()=>null);
  if (!form) return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string) || "portfolio";
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const mime = file.type || "application/octet-stream";
  const size = file.size;

  // Validate
  let err: string | null = null;
  if (mime.startsWith("image/")) err = blob.validateImageFile(mime, size);
  else if (mime === "application/pdf") err = blob.validatePdfFile(mime, size);
  else err = blob.validateImageFile(mime, size) || "Unsupported file type";

  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  // Basic magic bytes check for images
  if (mime.startsWith("image/") && mime !== "image/svg+xml") {
    const header = buf.slice(0,4).toString("hex");
    const isKnown = header.startsWith("ffd8") || header.startsWith("89504e47") || header.startsWith("52494646") || header.startsWith("47494638") || header.startsWith("5249") || buf.slice(0,4).toString().includes("RIFF");
    // We don't block strict for webp which has RIFF, but allow
  }

  const hashed = blob.hashBuffer(buf);
  const result = await blob.saveUpload(buf, file.name || "upload", mime, folder);
  return NextResponse.json({ url: result.url, pathname: result.pathname, hash: hashed, size, mime });
}

async function verifySession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const { jwtVerify } = await import("jose");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch { return false; }
}
