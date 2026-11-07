import { put, del } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function extFromMime(mime: string): string {
  const map: Record<string,string> = {
    "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg",
    "application/pdf": ".pdf"
  };
  return map[mime] || ".bin";
}

function isBlobConfigured(): boolean { return !!process.env.BLOB_READ_WRITE_TOKEN; }

export async function saveUpload(buffer: Buffer, originalName: string, mime: string, folder: string = "portfolio"): Promise<{ url: string; pathname: string }> {
  const ext = path.extname(originalName) || extFromMime(mime);
  const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60) || "file";
  const id = crypto.randomUUID();
  const filename = `${folder}/${id}-${safeBase}${ext.startsWith(".") ? "" : ext}`;

  if (isBlobConfigured()) {
    const blob = await put(filename, buffer, { access: "public", contentType: mime, addRandomSuffix: false });
    return { url: blob.url, pathname: blob.pathname };
  } else {
    // Local fallback for dev — NOT durable on Vercel; warn in admin
    const fullPath = path.join(UPLOAD_DIR, filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    const url = `/uploads/${filename}`;
    return { url, pathname: filename };
  }
}

export async function deleteUpload(pathname: string): Promise<void> {
  if (isBlobConfigured()) {
    try { await del(pathname.startsWith("http") ? pathname : `https://${pathname}`); } catch {}
    // also try pathname directly
    try { if (!pathname.startsWith("http")) await del(pathname); } catch {}
  } else {
    try {
      const full = path.join(UPLOAD_DIR, pathname);
      await fs.unlink(full);
    } catch {}
  }
}

export function validateImageFile(mime: string, size: number): string | null {
  const allowed = ["image/jpeg","image/jpg","image/png","image/webp","image/gif","image/svg+xml"];
  if (!allowed.includes(mime)) return `Unsupported image type: ${mime}. Allowed: JPG, PNG, WebP, GIF, SVG.`;
  if (size > 5 * 1024 * 1024) return "Image too large. Max 5MB.";
  return null;
}
export function validatePdfFile(mime: string, size: number): string | null {
  if (mime !== "application/pdf") return "Only PDF allowed for résumé.";
  if (size > 10 * 1024 * 1024) return "PDF too large. Max 10MB.";
  return null;
}

// Duplicate detection via hash buffer
export function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export const blob = { saveUpload, deleteUpload, validateImageFile, validatePdfFile, hashBuffer, isBlobConfigured };
