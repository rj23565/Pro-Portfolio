import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { getStore } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  let store;
  try { store = await getStore(); } catch { store = null; }
  const title = store?.profile.seoTitle || "Wahab Ahmad — Graphic Designer & Web Builder | Faisalabad";
  const description = store?.profile.seoDescription || "Premium branding, textile, and web design by Wahab Ahmad in Faisalabad, Punjab, Pakistan. Elegant, royal visual identities crafted with care.";
  return {
    title,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wahabahmad.vercel.app"),
    openGraph: { title, description, type: "website", locale: "en_PK" },
    twitter: { card: "summary_large_image", title, description },
    icons: { icon: "/favicon.ico" }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let accent = "#C9A96A";
  try {
    const s = await getStore();
    accent = s.profile.accentColor || s.branding.accentColor || "#C9A96A";
  } catch {}
  return (
    <html lang="en">
      <body style={{ ["--accent" as any]: accent, ["--accent-strong" as any]: accent }} className="font-body">
        {children}
      </body>
    </html>
  );
}
