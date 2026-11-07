"use client";
import { useEffect, useState } from "react";
export default function BrandingPage(){
  const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState(""); const [err,setErr]=useState("");
  function csrf(){return document.cookie.split("; ").find(c=>c.trim().startsWith("csrf_token="))?.split("=")[1]||"";}
  useEffect(()=>{ fetch("/api/admin/site").then(r=>r.json()).then(d=>{ setData(d.profile); setLoading(false);});},[]);
  async function save(){
    const res=await fetch("/api/admin/site",{method:"POST", headers:{"Content-Type":"application/json","x-csrf-token":csrf()}, body: JSON.stringify({ profile: data })});
    const j=await res.json();
    if(!res.ok){ setErr(j.error); return; } setMsg("Branding & SEO saved. Accent color is live site-wide.");
  }
  if(loading) return <div className="p-8">Loading…</div>;
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-semibold">Branding & SEO</h1><p className="text-sm text-ink/60">Accent color is editable and applied via CSS variable across the site. SEO fields power metadata.</p></div>
      {msg&&<div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>}
      {err&&<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
      <div className="rounded-2xl bg-white border border-ink/10 p-6 space-y-4">
        <label className="block"><span className="font-mono text-xs tracking-widest">ACCENT COLOR (editable)</span>
          <div className="mt-2 flex items-center gap-3">
            <input type="color" value={data.accentColor||"#C9A96A"} onChange={e=>setData({...data, accentColor:e.target.value})} className="h-10 w-10 rounded-lg border border-ink/15 p-1" />
            <input value={data.accentColor||""} onChange={e=>setData({...data, accentColor:e.target.value})} placeholder="#C9A96A" className="flex-1 rounded-xl border border-ink/15 px-4 py-2.5 text-sm" />
            <span className="h-8 w-8 rounded-full" style={{background:data.accentColor}} />
          </div>
          <span className="text-xs text-ink/50">Default: #C9A96A (restrained gold). Keep it tasteful and accessible.</span>
        </label>
        <label className="block"><span className="font-mono text-xs tracking-widest">SEO TITLE</span><input value={data.seoTitle||""} onChange={e=>setData({...data, seoTitle:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" maxLength={120} /><div className="text-xs text-ink/50 text-right">{(data.seoTitle||"").length}/120</div></label>
        <label className="block"><span className="font-mono text-xs tracking-widest">SEO DESCRIPTION</span><textarea value={data.seoDescription||""} onChange={e=>setData({...data, seoDescription:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm" maxLength={300} /><div className="text-xs text-ink/50 text-right">{(data.seoDescription||"").length}/300</div></label>
        <button onClick={save} className="rounded-full bg-ink text-white px-8 py-3 font-semibold">Save branding & SEO</button>
      </div>
      <div className="rounded-xl bg-ivory-soft p-4 text-xs leading-5 text-ink/60">
        Typography: locally hosted via next/font — Cormorant Garamond (headings), Manrope (body), IBM Plex Mono (labels). No external font CDN beyond Google Fonts fallback is used; fonts are self-hosted via Next.js optimization.
      </div>
    </div>
  );
}
