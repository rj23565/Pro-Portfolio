import type { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://wahabahmad.vercel.app";
  return [{ url: base, lastModified: new Date() }];
}
