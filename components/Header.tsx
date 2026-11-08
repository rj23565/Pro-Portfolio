"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { accentSurface } from "@/lib/contrast";

export default function Header({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onAccent = accentSurface(accent);
  useEffect(()=> {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h);
    return ()=> window.removeEventListener("scroll", h);
  }, []);
  const nav = [
    { href: "#work", label: "Work" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition ${scrolled ? "glass shadow-soft" : "bg-transparent"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-ink font-display text-lg font-bold" style={{ color: accent }} aria-hidden="true">W</span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-bold tracking-tight text-ink">Wahab Ahmad</span>
            <span className="font-mono text-[11px] tracking-widest text-ink/60">GRAPHIC & WEB</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(n=> (
            <Link key={n.href} href={n.href} className="px-4 py-2 rounded-full text-sm font-medium text-ink/80 hover:text-ink hover:bg-ink/[0.06] transition">{n.label}</Link>
          ))}
          <Link href="#contact" className="ml-3 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-royal transition hover:opacity-90" style={onAccent}>
            <span className="h-2 w-2 rounded-full bg-current opacity-70" aria-hidden="true" /> Let&apos;s talk
          </Link>
        </nav>
        <button aria-label="Open menu" aria-expanded={open} onClick={()=>setOpen(!open)} className="md:hidden h-10 w-10 rounded-full bg-ink text-white grid place-items-center">
          <span className="h-0.5 w-5 bg-white block relative">
            <span className={`absolute inset-0 bg-white transition ${open ? "rotate-45" : "-translate-y-1.5"}`}></span>
            <span className={`absolute inset-0 bg-white transition ${open ? "-rotate-45" : "translate-y-1.5"}`}></span>
          </span>
        </button>
      </div>
      {open && (
        <div className="md:hidden mx-4 mb-4 rounded-2xl bg-white shadow-royal p-4 border border-ink/5">
          <div className="flex flex-col gap-1">
            {nav.map(n=> <Link key={n.href} href={n.href} onClick={()=>setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-ivory-soft font-medium">{n.label}</Link>)}
            <Link href="#contact" onClick={()=>setOpen(false)} className="mt-2 rounded-full px-6 py-3 text-center font-semibold" style={onAccent}>Contact directly</Link>
          </div>
        </div>
      )}
    </header>
  );
}
