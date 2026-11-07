import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStore } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const store = await getStore();
  const p = store.profile;
  const accent = p.accentColor || "#C9A96A";
  const proj = store.projects.find(x => x.id === params.id && x.status === "published");
  if (!proj) return notFound();

  const isTextile = proj.category.toLowerCase() === "textile";

  return (
    <div className="min-h-screen bg-ivory">
      <Header accent={accent} />
      <div className="pt-24 mx-auto max-w-7xl px-6 lg:px-8">
        <Link href="/#work" className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-4 py-2 text-sm">← Back to work</Link>
        <div className="mt-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="font-mono text-xs tracking-widest text-ink/60">{proj.category.toUpperCase()}</div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">{proj.title}</h1>
            {!isTextile && proj.description ? (
              <p className="mt-4 max-w-2xl whitespace-pre-wrap leading-7 text-ink/75">{proj.description}</p>
            ) : isTextile ? (
              <p className="mt-4 font-mono text-xs tracking-widest text-ink/60">TEXTILE</p>
            ) : null}
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white border border-ink/10 p-5">
              <div className="font-mono text-xs tracking-widest text-ink/60">CONTACT FOR SIMILAR WORK</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`mailto:${p.email}`} className="rounded-full bg-ink text-white px-4 py-2 text-sm">Email</a>
                <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" className="rounded-full px-4 py-2 text-sm text-white" style={{ background: accent }}>WhatsApp</a>
              </div>
              <div className="mt-4 text-xs leading-5 text-ink/60">Timelines typically 2–4 weeks, scope-dependent.</div>
            </div>
          </div>
        </div>

        {proj.coverImage && (
          <div className="mt-8 rounded-[24px] overflow-hidden bg-white border border-ink/5 shadow-soft">
            <img src={proj.coverImage} alt={proj.title} className="w-full object-cover" />
          </div>
        )}

        {proj.images && proj.images.length > 0 && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {proj.images.map((img, i) => (
              <div key={i} className="rounded-[20px] overflow-hidden bg-white border border-ink/5 shadow-soft">
                <img src={img} alt={`${proj.title} ${i+1}`} className="w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {!isTextile && proj.images.length === 0 && !proj.coverImage && (
          <div className="mt-8 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/60">No images yet — gallery will appear here once added.</div>
        )}
      </div>
      <Footer accent={accent} email={p.email} whatsapp={p.whatsapp} mobile={p.mobile} location={p.location} seoTitle={p.seoDescription || p.heroSubtitle} />
    </div>
  );
}
