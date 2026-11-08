import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/Badge";
import { getStore } from "@/lib/db";
import { safeUrl } from "@/lib/sanitize";
import { accentSurface } from "@/lib/contrast";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await getStore();
  const p = store.profile;
  const accent = p.accentColor || "#C9A96A";
  const onAccent = accentSurface(accent);
  const published = store.projects.filter(x => x.status === "published").sort((a,b)=> a.order - b.order);
  const services = [...store.services].sort((a,b)=> a.order - b.order);
  const skills = [...store.skills].sort((a,b)=> a.order - b.order);
  const education = [...store.education].sort((a,b)=> a.order - b.order);
  const hasSocial = p.social && Object.values(p.social).some(v => v && v.trim().length > 0);

  // featured work resolution
  let featured = null as any;
  if (p.featuredProjectId) featured = store.projects.find(x => x.id === p.featuredProjectId) || null;
  // else fallback to first published with featured flag
  if (!featured) featured = store.projects.find(x=> x.featured && x.status==="published") || null;

  return (
    <div className="min-h-screen bg-ivory">
      <Header accent={accent} />
      {/* Hero */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory to-ivory-warm" />
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full blur-[80px] opacity-20" style={{ background: `linear-gradient(135deg, ${accent} 0%, #8B5CF6 60%, #EC4899 100%)` }} />
          <div className="absolute top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[90px] opacity-10" style={{ background: `linear-gradient(135deg, #1A1540 0%, #4A2D7A 100%)` }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-3 py-1.5 shadow-soft">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: accent }} />
                <span className="font-mono text-[11px] tracking-widest text-ink/70">AVAILABLE FOR SELECT PROJECTS • FAISALABAD</span>
              </div>
              <h1 className="mt-6 font-display text-4xl md:text-5xl lg:text-[56px] font-semibold leading-[0.95] tracking-tight text-ink">
                {p.heroTitle || "Crafting visual identities that feel royal, refined, and unmistakably yours."}
              </h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-7 text-ink/70">
                {p.heroSubtitle || "Graphic Designer & Web Builder based in Faisalabad — blending thoughtful strategy with elegant design to help brands stand apart."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="#work" className="inline-flex items-center justify-center rounded-full px-8 py-3.5 font-semibold shadow-royal transition hover:translate-y-[-1px]" style={onAccent}>
                  View selected work
                </Link>
                <Link href="#contact" className="inline-flex items-center justify-center rounded-full bg-white border border-ink/15 px-8 py-3.5 font-semibold text-ink hover:bg-ink hover:text-white transition">
                  Direct contact
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs text-ink/60">
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-4 py-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Typically 2–4 weeks, scope-dependent</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-4 py-2">✦ No templates — bespoke</span>
              </div>

              {/* Contact quick strip */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <a href={`mailto:${p.email}`} className="rounded-2xl bg-white border border-ink/10 p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/50">EMAIL</div>
                  <div className="mt-1 text-sm font-medium break-all">{p.email}</div>
                </a>
                <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noreferrer" className="rounded-2xl bg-white border border-ink/10 p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/50">WHATSAPP</div>
                  <div className="mt-1 text-sm font-medium">{p.whatsapp}</div>
                </a>
                <a href={`tel:${p.mobile.replace(/\s/g,"")}`} className="rounded-2xl bg-white border border-ink/10 p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/50">MOBILE</div>
                  <div className="mt-1 text-sm font-medium">{p.mobile}</div>
                </a>
              </div>
            </div>

            {/* Portrait card - reserved place for supplied photo */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-[420px]">
                <div className="absolute -inset-4 -z-10 rounded-[36px] blur-2xl opacity-20" style={{ background: `linear-gradient(135deg, ${accent} 0%, #8B5Bff 100%)` }} />
                <div className="rounded-[32px] bg-white p-3 shadow-royal border border-ink/5">
                  <div className="rounded-[24px] overflow-hidden bg-ivory-soft aspect-[4/5] relative grid place-items-center">
                    {p.profilePhoto ? (
                      // Use plain img to avoid next/image remote restrictions for local uploads; but next/image works for blob too
                      <img src={p.profilePhoto} alt={`${p.name} portrait`} className="h-full w-full object-cover" style={{ objectPosition: "center top" }} />
                    ) : (
                      <div className="p-8 text-center">
                        <div className="mx-auto h-20 w-20 rounded-full bg-white border border-ink/10 grid place-items-center font-display text-3xl text-ink/30">WA</div>
                        <div className="mt-4 font-display text-2xl font-semibold">{p.name}</div>
                        <div className="mt-1 font-mono text-[11px] tracking-widest text-ink/55">{p.role.toUpperCase()}</div>
                        <div className="mt-4 h-px w-16 mx-auto" style={{ background: accent }} />
                        <p className="mt-4 text-sm leading-6 text-ink/60">Designing considered identities and digital experiences from Faisalabad, Pakistan.</p>
                      </div>
                    )}
                    {/* decorative corner */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/90 backdrop-blur border border-white p-3 flex items-center justify-between">
                      <div>
                        <div className="font-display font-semibold leading-none">{p.name}</div>
                        <div className="font-mono text-[11px] tracking-widest text-ink/60">{p.role}</div>
                      </div>
                      <div className="h-8 w-8 rounded-full grid place-items-center text-sm" style={onAccent}>✦</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] tracking-widest text-ink/50">
                  <span className="h-px w-8 bg-ink/20" /> FAISALABAD • PUNJAB • PAKISTAN <span className="h-px w-8 bg-ink/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured work.
          Renders the real featured project once one is chosen in the admin.
          Until then a designed, self-contained showcase band holds the slot —
          no fabricated imagery, no admin instructions in public view. */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
        {featured ? (
          <Link
            href={`/project/${featured.id}`}
            className="group block rounded-[28px] bg-ink text-white overflow-hidden relative shadow-royal"
          >
            <div className="absolute inset-0 opacity-25" style={{ background: `linear-gradient(135deg, ${accent} 0%, #6D5BFF 50%, #EC4899 100%)` }} />
            <div className="relative grid md:grid-cols-12">
              <div className="md:col-span-7 p-7 md:p-9">
                <div className="font-mono text-[11px] tracking-[0.2em] text-white/70">FEATURED WORK</div>
                <h3 className="mt-3 font-display text-2xl md:text-3xl font-semibold leading-tight">{featured.title}</h3>
                {featured.category.toLowerCase() !== "textile" && featured.description ? (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 line-clamp-2">{featured.description}</p>
                ) : null}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink">
                  View project <span aria-hidden="true">↗</span>
                </div>
              </div>
              <div className="md:col-span-5 relative min-h-[180px] md:min-h-0">
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-white/5">
                    <span className="font-mono text-[11px] tracking-widest text-white/60">{featured.category.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-[28px] bg-ink text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${accent} 0%, #6D5BFF 55%, #EC4899 100%)` }} />
            <div className="relative grid md:grid-cols-12 items-center">
              <div className="md:col-span-7 p-7 md:p-9">
                <div className="font-mono text-[11px] tracking-[0.2em] text-white/70">SIGNATURE PROJECT</div>
                <h3 className="mt-3 font-display text-2xl md:text-3xl font-semibold leading-tight">
                  A spotlight for the next piece of work
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                  This space is held for a signature website project — the kind of build that ties brand, typography, and interaction together.
                </p>
              </div>
              <div className="md:col-span-5 p-7 md:p-9">
                <div className="rounded-2xl border border-white/20 bg-white/[0.07] backdrop-blur p-6">
                  <div className="font-mono text-[11px] tracking-widest text-white/60">AVAILABLE TO COMMISSION</div>
                  <p className="mt-3 text-sm leading-6 text-white/85">
                    Building something that deserves this slot? Let&apos;s talk through it.
                  </p>
                  <a
                    href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ivory-soft transition"
                  >
                    Start a conversation <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Selected Work */}
      <section id="work" className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Badge>SELECTED WORK</Badge>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">Work curated with care</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink/70">A considered selection of screen-printing and textile work — apparel graphics built around typography, texture, and detail.</p>
          </div>
          <div className="hidden md:block font-mono text-xs tracking-widest text-ink/50">{String(published.length).padStart(2, "0")} PROJECTS</div>
        </div>

        {published.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Selected work is being prepared" description="New case studies are on the way. In the meantime, get in touch to see relevant work or discuss a project." hint="Reach out directly — email or WhatsApp." />
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {published.map(proj => (
              <Link key={proj.id} href={`/project/${proj.id}`} className="group rounded-[24px] bg-white border border-ink/5 overflow-hidden shadow-soft hover:shadow-royal hover:translate-y-[-2px] transition">
                <div className="aspect-[4/3] overflow-hidden bg-ivory-soft relative">
                  {proj.coverImage ? (
                    <img src={proj.coverImage} alt={proj.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500" />
                  ) : (
                    <div className="h-full grid place-items-center text-ink/30 font-mono text-xs tracking-widest">{proj.category.toUpperCase()}</div>
                  )}
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 font-mono text-[11px] tracking-widest">{proj.category}</div>
                </div>
                <div className="p-5 flex flex-col min-h-[136px]">
                  {/* Textile work is presented under the "Textile" label alone.
                      The chip on the image already carries that label, so the body
                      adds no title and no description — nothing is duplicated. */}
                  {proj.category.toLowerCase() === "textile" ? null : (
                    <>
                      <h3 className="font-display text-lg font-semibold leading-tight">{proj.title}</h3>
                      {proj.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">{proj.description}</p>
                      ) : null}
                    </>
                  )}
                  <div className="mt-auto pt-4 flex items-center gap-2 font-mono text-xs text-ink/60">
                    <span className="h-6 w-6 rounded-full grid place-items-center bg-ivory-soft">↗</span> View project
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 lg:px-8 mt-20">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Badge accent={accent}>ABOUT • PROFILE</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold">About Wahab</h2>
            <div className="mt-6 rounded-[24px] bg-white border border-ink/5 p-6 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-ivory-soft border border-ink/10">
                  {p.profilePhoto ? <img src={p.profilePhoto} alt={p.name} className="h-full w-full object-cover" /> : <div className="h-full grid place-items-center text-ink/50">WA</div>}
                </div>
                <div>
                  <div className="font-display font-semibold">{p.name}</div>
                  <div className="font-mono text-xs tracking-widest text-ink/60">{p.role}</div>
                  <div className="text-xs text-ink/60">{p.location} {p.age ? `• Age ${p.age}` : ""}</div>
                </div>
              </div>
              {p.bio ? (
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-ink/75">{p.bio}</p>
              ) : (
                <p className="mt-5 text-sm leading-6 text-ink/70">Wahab is a graphic designer and web builder working across brand identity, textile graphics, and considered digital experiences. Every project is approached with care for type, colour, and craft.</p>
              )}
              {p.resumeUrl && (
                <a href={p.resumeUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-white transition">Download Résumé ↗</a>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[28px] p-[1px]" style={{ background: `linear-gradient(135deg, ${accent} 0%, #8B5CF6 100%)` }}>
              <div className="rounded-[27px] bg-white p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold">What I do</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">Focused on distinctive brand and web presence — from concept to refined delivery. Every project is considered, no generic templates.</p>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-ivory-soft p-5">
                    <div className="h-8 w-8 rounded-full grid place-items-center bg-white border border-ink/10">✦</div>
                    <div className="mt-3 font-semibold">Graphic Design</div>
                    <div className="mt-1 text-sm leading-6 text-ink/65">Brand identities, textile graphics, and art direction that feel premium and memorable.</div>
                  </div>
                  <div className="rounded-2xl bg-ivory-soft p-5">
                    <div className="h-8 w-8 rounded-full grid place-items-center bg-white border border-ink/10">◐</div>
                    <div className="mt-3 font-semibold">Web Builder</div>
                    <div className="mt-1 text-sm leading-6 text-ink/65">Clean, fast, responsive websites that translate your brand into a refined digital experience.</div>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-ink text-white p-5 flex items-center justify-between">
                  <div className="text-sm">Typical delivery: <span className="font-semibold">2–4 weeks</span>, depending on scope.</div>
                  <div className="h-8 w-8 rounded-full grid place-items-center bg-white/15">◷</div>
                </div>
              </div>
            </div>

            {/* Skills & Education only when provided */}
            {(skills.length > 0 || education.length > 0) && (
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                {skills.length > 0 && (
                  <div className="rounded-[24px] bg-white border border-ink/5 p-6 shadow-soft">
                    <h4 className="font-mono text-xs tracking-widest text-ink/60">SKILLS & TOOLS</h4>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map(s=> <span key={s.id} className="rounded-full bg-ivory-soft border border-ink/10 px-3 py-1.5 text-xs font-medium">{s.name} <span className="text-ink/50">• {s.category}</span></span>)}
                    </div>
                  </div>
                )}
                {education.length > 0 && (
                  <div className="rounded-[24px] bg-white border border-ink/5 p-6 shadow-soft">
                    <h4 className="font-mono text-xs tracking-widest text-ink/60">EDUCATION</h4>
                    <div className="mt-4 space-y-3">
                      {education.map(e=> (
                        <div key={e.id} className="rounded-xl bg-ivory-soft p-3">
                          <div className="text-sm font-semibold">{e.title}</div>
                          <div className="text-xs text-ink/60">{e.institution} {e.year && `• ${e.year}`}</div>
                          {e.description && <div className="mt-1 text-xs leading-5 text-ink/70">{e.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="flex items-baseline justify-between">
          <div>
            <Badge>SERVICES</Badge>
            <h2 className="mt-3 font-display text-3xl font-semibold">Services, shaped to your goals</h2>
          </div>
          <div className="hidden md:block font-mono text-xs text-ink/50">APPROX 2–4 WEEKS</div>
        </div>
        {services.length === 0 ? (
          <div className="mt-6 rounded-[24px] bg-white border border-ink/5 p-8 text-center">
            <div className="mx-auto max-w-xl">
              <h3 className="font-display text-lg font-semibold">Let&apos;s discuss what you need</h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Brand identity, screen-printing graphics, textile design, and web builds are the usual focus.
                Tell me about the project and I&apos;ll confirm scope, deliverables, and timing directly.
              </p>
              <a
                href={`mailto:${p.email}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Email me <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {services.map(svc=> (
              <div key={svc.id} className="rounded-[24px] bg-white border border-ink/5 p-6 shadow-soft hover:shadow-royal transition">
                <div className="h-10 w-10 rounded-xl grid place-items-center" style={onAccent}>{svc.icon === "web" ? "◐" : svc.icon === "brand" ? "✦" : "⬢"}</div>
                <h3 className="mt-4 font-display text-lg font-semibold">{svc.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{svc.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="rounded-[28px] bg-white border border-ink/5 shadow-soft overflow-hidden">
          <div className="grid lg:grid-cols-5">
            <div className="lg:col-span-2 p-8 bg-ink text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${accent} 0%, #EC4899 100%)` }} />
              <div className="relative">
                <div className="font-mono text-xs tracking-widest text-white/70">PROCESS</div>
                <h2 className="mt-3 font-display text-3xl font-semibold">A calm, collaborative path</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">Clear steps, thoughtful revisions, and consistent communication from first conversation to final delivery.</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 font-mono text-xs">2–4 WEEKS TYPICAL • SCOPE-DEPENDENT</div>
              </div>
            </div>
            <div className="lg:col-span-3 p-6 md:p-8 grid sm:grid-cols-2 gap-6">
              {[
                { n: "01", t: "Discover", d: "We clarify your goals, audience, and references. You share inspirations; I map the direction." },
                { n: "02", t: "Concept", d: "Initial directions explored — mood, palette, type, and layout. We align before refinement." },
                { n: "03", t: "Refine", d: "Chosen direction polished with care. Revisions focused on craft, not endless loops." },
                { n: "04", t: "Deliver", d: "Final files, guidance, and launch support. Clean handoff, ready to use everywhere." },
              ].map(step=> (
                <div key={step.n} className="rounded-2xl bg-ivory-soft p-5">
                  <div className="font-mono text-xs tracking-widest text-ink/50">{step.n}</div>
                  <div className="mt-2 font-display text-lg font-semibold">{step.t}</div>
                  <div className="mt-1 text-sm leading-6 text-ink/65">{step.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact - no form, direct methods only */}
      <section id="contact" className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
        <div className="rounded-[28px] overflow-hidden shadow-royal" style={{ background: `linear-gradient(135deg, #1A1540 0%, #2E2152 40%, ${accent} 100%)` }}>
          <div className="grid lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-8 md:p-10 text-white">
              <div className="font-mono text-xs tracking-[0.2em] text-white/70">DIRECT CONTACT</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Let&apos;s make something enduring</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">No forms, no waiting on a queue — reach me directly and we&apos;ll talk through what you need.</p>
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <a href={`mailto:${p.email}`} className="rounded-2xl bg-white text-ink p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/60">EMAIL</div>
                  <div className="mt-1 text-sm font-semibold break-all">{p.email}</div>
                  <div className="mt-2 inline-flex rounded-full bg-ink text-white px-3 py-1 text-xs">Send email</div>
                </a>
                <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g,"")}?text=${encodeURIComponent("Hello Wahab, I'd like to discuss a project.")}`} target="_blank" rel="noreferrer" className="rounded-2xl bg-white text-ink p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/60">WHATSAPP</div>
                  <div className="mt-1 text-sm font-semibold">{p.whatsapp}</div>
                  <div className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium" style={onAccent}>Message on WhatsApp</div>
                </a>
                <a href={`tel:${p.mobile.replace(/\s/g,"")}`} className="rounded-2xl bg-white text-ink p-4 hover:shadow-soft transition">
                  <div className="font-mono text-[11px] tracking-widest text-ink/60">MOBILE</div>
                  <div className="mt-1 text-sm font-semibold">{p.mobile}</div>
                  <div className="mt-2 inline-flex rounded-full bg-ink text-white px-3 py-1 text-xs">Call now</div>
                </a>
              </div>
              {hasSocial ? (
                <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-5">
                  <div className="font-mono text-xs tracking-widest text-white/70">SOCIAL</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(p.social).filter(([,v])=> v).map(([k,v])=> {
                      const url = safeUrl(v as string);
                      if (!url) return null;
                      return <a key={k} href={url} target="_blank" rel="noreferrer" className="rounded-full bg-white text-ink px-4 py-2 text-sm font-medium hover:bg-ivory-soft transition">{k} ↗</a>;
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="lg:col-span-5 bg-white p-8 md:p-10">
              <h3 className="font-display text-xl font-semibold">Project basics</h3>
              <div className="mt-4 space-y-4 text-sm leading-6 text-ink/70">
                <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-ivory-soft grid place-items-center text-ink">⦿</span><span><strong className="text-ink">Share your idea</strong> — brand, textile, or website. Include references you admire.</span></div>
                <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-ivory-soft grid place-items-center text-ink">⦿</span><span><strong className="text-ink">Scope & timing</strong> — I&apos;ll confirm deliverables and an approximate 2–4 week window.</span></div>
                <div className="flex gap-3"><span className="h-6 w-6 rounded-full bg-ivory-soft grid place-items-center text-ink">⦿</span><span><strong className="text-ink">Direct line</strong> — updates via WhatsApp or email, whichever you prefer.</span></div>
              </div>
              <div className="mt-6 rounded-2xl bg-ivory-soft p-4">
                <div className="font-mono text-xs tracking-widest text-ink/60">LOCATION</div>
                <div className="mt-1 text-sm font-medium">{p.location}</div>
                <div className="mt-2 text-xs leading-5 text-ink/60">Available for remote collaboration worldwide — proudly based in Faisalabad.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer accent={accent} email={p.email} whatsapp={p.whatsapp} mobile={p.mobile} location={p.location} seoTitle={p.seoDescription || p.heroSubtitle} />
    </div>
  );
}
