import Link from "next/link";
export default function Footer({ accent, email, whatsapp, mobile, location, seoTitle }: { accent: string; email: string; whatsapp: string; mobile: string; location: string; seoTitle: string }) {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl grid place-items-center bg-ink font-display font-bold" style={{ color: accent }} aria-hidden="true">W</span>
              <span className="font-display font-bold text-lg">Wahab Ahmad</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/70 max-w-sm">
              {seoTitle}
            </p>
            <p className="mt-4 font-mono text-xs tracking-widest text-ink/50">BASED IN {location.toUpperCase()}</p>
          </div>
          <div>
            <h3 className="font-mono text-xs tracking-widest text-ink/60">DIRECT CONTACT</h3>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`mailto:${email}`} className="block hover:underline underline-offset-4">{email}</a>
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer" className="block hover:underline underline-offset-4">WhatsApp: {whatsapp}</a>
              <a href={`tel:${mobile.replace(/\s/g,"")}`} className="block hover:underline underline-offset-4">Mobile: {mobile}</a>
            </div>
          </div>
          <div>
            <h3 className="font-mono text-xs tracking-widest text-ink/60">APPROACH</h3>
            <p className="mt-4 text-sm leading-6 text-ink/70">Timelines are typically 2–4 weeks, depending on scope and revisions. No rush promises — quality and precision come first.</p>
            <div className="mt-6 flex gap-3">
              <span className="h-8 w-8 rounded-full bg-ivory-soft grid place-items-center text-ink/70 text-xs">©</span>
              <span className="text-xs leading-5 text-ink/60">© {new Date().getFullYear()} Wahab Ahmad. All rights reserved.<br/>Made with care in Faisalabad.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
