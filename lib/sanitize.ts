export function escapeHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
export function safeUrl(url: string): string | null {
  if (!url) return null;
  const t = url.trim();
  if (t.startsWith("mailto:") || t.startsWith("tel:") || t.startsWith("https://wa.me") || t.startsWith("https://api.whatsapp.com")) return t;
  try {
    const u = new URL(t);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
    if (u.protocol === "mailto:" || u.protocol === "tel:") return u.toString();
    return null;
  } catch { return null; }
}
