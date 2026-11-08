import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStore } from "@/lib/db";
import { notFound } from "next/navigation";
import { accentSurface } from "@/lib/contrast";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const store = await getStore();
  const p = store.profile;
  const accent = p.accentColor || "#C9A96A";
  const onAccent = accentSurface(accent);
  const proj = store.projects.find((x) => x.id === params.id && x.status === "published");
  if (!proj) return notFound();

  const isTextile = proj.category.toLowerCase() === "textile";
  const gallery = proj.images ?? [];

  return (
    <div className="min-h-screen bg-ivory">
      <Header accent={accent} />

      <article className="pt-24 mx-auto max-w-7xl px-6 lg:px-8">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-4 py-2 text-sm text-ink/80 hover:bg-ink hover:text-white transition"
        >
          <span aria-hidden="true">←</span> Back to work
        </Link>

        <header className="mt-8 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            {/* Textile work carries the single label "Textile" and nothing else:
                no category eyebrow, no repeated title, no description. */}
            {isTextile ? (
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
                Textile
              </h1>
            ) : (
              <>
                <div className="font-mono text-[11px] tracking-[0.2em] text-ink/55">
                  {proj.category.toUpperCase()}
                </div>
                <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-ink">
                  {proj.title}
                </h1>
              </>
            )}

            {!isTextile && proj.description ? (
              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-[15px] leading-7 text-ink/70">
                {proj.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-widest text-ink/50">
              {isTextile ? null : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden="true" />
                  SCREEN PRINTING
                </span>
              )}
              {gallery.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-white border border-ink/10 px-3 py-1.5">
                  {String(gallery.length + (proj.coverImage ? 1 : 0)).padStart(2, "0")} IMAGES
                </span>
              ) : null}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-[24px] bg-white border border-ink/5 p-6 shadow-soft">
              <div className="font-mono text-[11px] tracking-widest text-ink/55">CONTACT FOR SIMILAR WORK</div>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Available for commissions in {isTextile ? "textile design" : "screen-printing and apparel graphics"}.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`mailto:${p.email}`}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  Email
                </a>
                <a
                  href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
                  style={onAccent}
                >
                  WhatsApp
                </a>
              </div>
              <div className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/55">
                Timelines are typically 2–4 weeks, depending on scope.
              </div>
            </div>
          </aside>
        </header>

        {proj.coverImage ? (
          <div className="mt-10 rounded-[24px] overflow-hidden bg-white border border-ink/5 shadow-soft">
            <img
              src={proj.coverImage}
              alt={isTextile ? "Textile work" : proj.title}
              className="w-full max-h-[720px] object-cover"
            />
          </div>
        ) : null}

        {gallery.length > 0 ? (
          <div className={`mt-6 grid gap-6 ${gallery.length === 1 ? "" : "md:grid-cols-2"}`}>
            {gallery.map((img, i) => (
              <div key={i} className="rounded-[20px] overflow-hidden bg-white border border-ink/5 shadow-soft">
                <img
                  src={img}
                  alt={isTextile ? `Textile work ${i + 1}` : `${proj.title} — image ${i + 1}`}
                  className="w-full max-h-[720px] object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/10 pt-6 pb-4">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-5 py-2.5 text-sm text-ink/80 hover:bg-ink hover:text-white transition"
          >
            <span aria-hidden="true">←</span> All work
          </Link>
          <a
            href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Wahab, I saw your work and would like to discuss a project.")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition"
            style={onAccent}
          >
            Start a project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>

      <Footer
        accent={accent}
        email={p.email}
        whatsapp={p.whatsapp}
        mobile={p.mobile}
        location={p.location}
        seoTitle={p.seoDescription || p.heroSubtitle}
      />
    </div>
  );
}
