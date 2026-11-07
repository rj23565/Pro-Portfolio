import { getStore } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const store = await getStore();
  const hasDb = !!process.env.DATABASE_URL;
  const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const hasSessionSecret = !!process.env.SESSION_SECRET;
  const published = store.projects.filter(p=>p.status==="published").length;
  const drafts = store.projects.filter(p=>p.status==="draft").length;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white border border-ink/10 p-6 shadow-soft">
        <h1 className="font-display text-2xl font-semibold">Welcome, Wahab</h1>
        <p className="mt-2 text-sm text-ink/60">Manage your portfolio. Drafts stay private until you publish. Existing work is retained when adding new work — duplicates are flagged via image hash.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/projects" className="rounded-full bg-ink text-white px-5 py-2.5 text-sm font-medium">Manage Projects</Link>
          <Link href="/admin/profile" className="rounded-full bg-white border border-ink/15 px-5 py-2.5 text-sm font-medium">Edit Profile & Hero</Link>
        </div>
      </div>

      {!hasDb || !hasBlob || !hasSessionSecret ? (
        <div className="rounded-[24px] border border-amber-300 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-900">Deployment check</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900 space-y-1">
            {!hasSessionSecret && <li><strong>SESSION_SECRET</strong> missing — sessions will not work. Set a 32+ char random string in Vercel env.</li>}
            {!hasDb && <li><strong>DATABASE_URL</strong> not set — using temporary file storage. On Vercel, data will NOT persist across deployments. Set Neon/Vercel Postgres URL.</li>}
            {!hasBlob && <li><strong>BLOB_READ_WRITE_TOKEN</strong> not set — uploads saved to local filesystem (ephemeral on Vercel). Set Vercel Blob token for durable storage.</li>}
          </ul>
          <div className="mt-3 text-xs text-amber-800">See DEPLOYMENT.md and .env.example for required Vercel configuration.</div>
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">✓ Storage and session configured correctly.</div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-ink/10 p-5">
          <div className="font-mono text-xs tracking-widest text-ink/60">PUBLISHED</div>
          <div className="mt-2 font-display text-3xl font-semibold">{published}</div>
          <div className="text-xs text-ink/60">Visible on public site</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/10 p-5">
          <div className="font-mono text-xs tracking-widest text-ink/60">DRAFTS</div>
          <div className="mt-2 font-display text-3xl font-semibold">{drafts}</div>
          <div className="text-xs text-ink/60">Private until published</div>
        </div>
        <div className="rounded-2xl bg-white border border-ink/10 p-5">
          <div className="font-mono text-xs tracking-widest text-ink/60">PROFILE PHOTO</div>
          <div className="mt-2 text-sm font-medium">{store.profile.profilePhoto ? "✓ Set" : "Not set — reserved"}</div>
          <div className="text-xs text-ink/60">{store.profile.resumeUrl ? "Résumé ✓" : "Résumé not uploaded"}</div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white border border-ink/10 p-6">
        <h3 className="font-semibold">Quick actions</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <Link href="/admin/projects" className="rounded-xl bg-ivory-soft p-4 hover:shadow-soft">
            <div className="font-medium">Add project with gallery</div>
            <div className="text-ink/60 text-xs mt-1">Supports Textile label-only mode, duplicate detection, ordered galleries.</div>
          </Link>
          <Link href="/admin/profile" className="rounded-xl bg-ivory-soft p-4 hover:shadow-soft">
            <div className="font-medium">Upload portrait exactly as supplied</div>
            <div className="text-ink/60 text-xs mt-1">Face/hair never altered — only background/layout styled.</div>
          </Link>
          <Link href="/admin/branding" className="rounded-xl bg-ivory-soft p-4 hover:shadow-soft">
            <div className="font-medium">Edit accent color & SEO</div>
            <div className="text-ink/60 text-xs mt-1">Accent is live site-wide; SEO fields validated.</div>
          </Link>
          <a href="/" target="_blank" className="rounded-xl bg-ivory-soft p-4 hover:shadow-soft">
            <div className="font-medium">View public site</div>
            <div className="text-ink/60 text-xs mt-1">Check mobile, tablet, desktop layouts.</div>
          </a>
        </div>
      </div>

      <div className="rounded-2xl bg-ink text-white p-6">
        <h3 className="font-semibold">Important notes</h3>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-white/80">
          <li>When you later provide work, existing work is retained — new images are appended, exact duplicates are blocked.</li>
          <li>For Textile category, only the label “Textile” is shown publicly — no project descriptions.</li>
          <li>Homepage featured-work slot is reserved for your website-services graphic — upload it later via Profile → Featured Project.</li>
          <li>Profile photo is used exactly as supplied; only background/surrounding layout is styled.</li>
          <li>Delivery timing remains approximate: 2–4 weeks, scope-dependent.</li>
        </ul>
      </div>
    </div>
  );
}
