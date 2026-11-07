import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // allow login page to render without sidebar check; middleware already protects
  const token = cookies().get("session")?.value;
  let authed = false;
  if (token) { try { authed = await verifySessionToken(token); } catch {} }

  // If not authed and not on login, middleware will redirect; we still render minimal
  const isLogin = false; // layout wraps all admin; login page will handle its own minimal UI but we can still show children

  if (!authed) {
    // for login we just render children without nav
    return <div className="min-h-screen bg-ivory">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] flex">
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="h-[72px] px-6 flex items-center gap-3 border-b border-ink/5">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-ink text-white font-display font-bold">W</span>
          <div>
            <div className="font-display font-semibold leading-none">Wahab Admin</div>
            <div className="font-mono text-[11px] tracking-widest text-ink/50">SECURE PANEL</div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: "/admin", label: "Dashboard", icon: "◈" },
            { href: "/admin/profile", label: "Profile & Hero", icon: "◐" },
            { href: "/admin/projects", label: "Projects & Gallery", icon: "⬢" },
            { href: "/admin/services", label: "Services", icon: "✦" },
            { href: "/admin/skills", label: "Skills & Tools", icon: "⬣" },
            { href: "/admin/education", label: "Education", icon: "▭" },
            { href: "/admin/contact", label: "Contact & Social", icon: "✉" },
            { href: "/admin/branding", label: "Branding & SEO", icon: "◆" },
          ].map(item=> (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ivory-soft transition">
              <span className="h-8 w-8 grid place-items-center rounded-lg bg-ivory-soft text-ink/70 text-xs">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-ink/5">
          <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl bg-ivory-soft px-3 py-2.5 text-sm font-medium">View site ↗</a>
          <form action="/api/auth/logout" method="post" className="mt-2">
            <button type="submit" className="w-full rounded-xl bg-ink text-white px-3 py-2.5 text-sm font-medium hover:bg-ink-light transition">Sign out</button>
          </form>
          <div className="mt-3 font-mono text-[10px] leading-4 text-ink/40">Session protected • HttpOnly • SameSite Strict • CSRF</div>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-[56px] flex items-center justify-between px-4 bg-white border-b border-ink/10">
          <Link href="/admin" className="font-display font-semibold">Wahab Admin</Link>
          <Link href="/" className="rounded-full bg-ivory-soft px-3 py-1.5 text-xs">View site</Link>
        </div>
        <main className="p-6 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
