import { z } from "zod";

export const urlSchema = z.string().trim().max(2048).refine(v => {
  if (!v) return true; // allow empty (means hidden)
  try {
    const u = new URL(v);
    return ["https:", "http:", "mailto:", "tel:"].includes(u.protocol) || v.startsWith("https://") || v.startsWith("http://") || v.startsWith("mailto:") || v.startsWith("tel:") || v.startsWith("https://wa.me") || v.startsWith("https://whatsapp");
  } catch { return false; }
}, "Invalid URL");

export const socialLinksSchema = z.object({
  instagram: z.string().max(500).optional().default(""),
  behance: z.string().max(500).optional().default(""),
  dribbble: z.string().max(500).optional().default(""),
  linkedin: z.string().max(500).optional().default(""),
  website: z.string().max(500).optional().default(""),
}).partial();

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120),
  age: z.union([z.number().int().min(0).max(120), z.null()]).optional(),
  bio: z.string().max(5000).optional().default(""),
  heroTitle: z.string().trim().max(200).optional().default(""),
  heroSubtitle: z.string().trim().max(800).optional().default(""),
  email: z.string().email().max(254),
  whatsapp: z.string().trim().max(30),
  mobile: z.string().trim().max(30),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Hex color required").optional(),
  seoTitle: z.string().max(120).optional().default(""),
  seoDescription: z.string().max(300).optional().default(""),
  social: socialLinksSchema.optional().default({}),
  featuredProjectId: z.string().max(100).optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(1).max(150),
  category: z.string().trim().min(1).max(80), // e.g. Branding, Textile, Web
  description: z.string().max(5000).optional().default(""),
  order: z.number().int().min(0).max(10000).optional().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  coverImage: z.string().max(2000).optional().default(""),
  images: z.array(z.string().max(2000)).max(30).optional().default([]),
  featured: z.boolean().optional().default(false),
});

export const serviceSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(800).optional().default(""),
  icon: z.string().max(50).optional().default("spark"),
  order: z.number().int().min(0).max(1000).optional().default(0),
});

export const skillSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(1).max(80),
  level: z.enum(["expert","advanced","intermediate","learning"]).optional().default("advanced"),
  category: z.string().max(80).optional().default("Tools"),
  order: z.number().int().min(0).max(1000).optional().default(0),
});

export const educationSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(1).max(150),
  institution: z.string().trim().max(150).optional().default(""),
  year: z.string().trim().max(30).optional().default(""),
  description: z.string().max(1000).optional().default(""),
  order: z.number().int().min(0).max(1000).optional().default(0),
});

export const loginSchema = z.object({
  password: z.string().min(4).max(200),
  csrfToken: z.string().optional(),
});

export function sanitizeText(input: string): string {
  // Basic sanitization: strip control chars, limit length, no HTML allowed (we escape on render)
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

export function isSafeUrl(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url, "https://example.com");
    // Only allow https, http, mailto, tel, wa.me
    if (["https:", "http:", "mailto:", "tel:"].includes(u.protocol)) return true;
    return false;
  } catch { return false; }
}
