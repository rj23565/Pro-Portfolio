"use client";
import { useEffect, useState } from "react";
export default function ContactPage(){
  const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState(""); const [err,setErr]=useState("");
  function csrf(){return document.cookie.split("; ").find(c=>c.trim().startsWith("csrf_token="))?.split("=")[1]||"";}
  useEffect(()=>{ fetch("/api/admin/site").then(r=>r.json()).then(d=>{ setData(d.profile); setLoading(false);});},[]);
  async function save(){
    if(!data) return;
    const res=await fetch("/api/admin/site",{method:"POST", headers:{"Content-Type":"application/json","x-csrf-token":csrf()}, body: JSON.stringify({ profile: { email:data.email, whatsapp:data.whatsapp, mobile:data.mobile, location:data.location }, social: data.social })});
    const j=await res.json();
    if(!res.ok){ setErr(j.error||"Save failed"); return; }
    setMsg("Contact & social links saved. Social links are hidden publicly until URLs are set.");
  }
  if(loading) return <div className="p-8">Loading…</div>;
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-semibold">Contact & Social</h1><p className="text-sm text-ink/60">Direct contact methods shown on site. Social links stay hidden until you provide URLs.</p></div>
      {msg&&<div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>}
      {err&&<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
      <div className="rounded-2xl bg-white border border-ink/10 p-6 space-y-4">
        <h3 className="font-semibold">Direct contact (always visible)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block"><span className="font-mono text-xs tracking-widest">EMAIL</span><input value={data.email} onChange={e=>setData({...data,email:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
          <label className="block"><span className="font-mono text-xs tracking-widest">WHATSAPP</span><input value={data.whatsapp} onChange={e=>setData({...data,whatsapp:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
          <label className="block"><span className="font-mono text-xs tracking-widest">MOBILE</span><input value={data.mobile} onChange={e=>setData({...data,mobile:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
          <label className="block"><span className="font-mono text-xs tracking-widest">LOCATION</span><input value={data.location} onChange={e=>setData({...data,location:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-ink/10 p-6 space-y-4">
        <h3 className="font-semibold">Social links (hidden until configured)</h3>
        <p className="text-xs text-ink/60">Leave empty to keep hidden. Enter full https URLs.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {["instagram","behance","dribbble","linkedin","website"].map(k=> (
            <label key={k} className="block"><span className="font-mono text-xs tracking-widest">{k.toUpperCase()}</span><input value={data.social?.[k]||""} onChange={e=>setData({...data, social:{...data.social, [k]:e.target.value}})} placeholder="https://..." className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
          ))}
        </div>
        <button onClick={save} className="rounded-full bg-ink text-white px-8 py-3 font-semibold">Save contact & social</button>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        <strong>No public contact form</strong> — site shows only the confirmed direct methods above, as requested. No enquiry form is exposed.
      </div>
    </div>
  );
}
