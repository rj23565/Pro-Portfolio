import { db } from "./db";
export async function getSeo() {
  const store = await db.getStore();
  return {
    title: store.profile.seoTitle || `${store.profile.name} — ${store.profile.role}`,
    description: store.profile.seoDescription || store.profile.heroSubtitle || "Portfolio of Wahab Ahmad",
    accent: store.profile.accentColor || "#C9A96A",
    profile: store.profile,
  };
}
