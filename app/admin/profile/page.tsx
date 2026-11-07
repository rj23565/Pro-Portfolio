"use client";
import { useEffect, useState } from "react";

type Profile = any;

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [photoProgress, setPhotoProgress] = useState<number | null>(null);
  const [resumeProgress, setResumeProgress] = useState<number | null>(null);

  useEffect(()=> {
    fetch("/api/admin/site").then(r=>r.json()).then(d=> { setData(d.profile); setLoading(false); }).catch(()=> setLoading(false));
  }, []);

  function getCsrf() { return document.cookie.split("; ").find(c=>c.trim().startsWith("csrf_token="))?.split("=")[1] || ""; }

  async function save() {
    if (!data) return;
    setSaving(true); setErr(""); setMsg("");
    try {
      const res = await fetch("/api/admin/site", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ profile: data }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Save failed");
      setMsg("Saved successfully");
    } catch(e:any){ setErr(e.message); } finally { setSaving(false); }
  }

  async function uploadFile(file: File, folder: string, onProgress: (p:number)=>void): Promise<string> {
    return new Promise(async (resolve, reject)=> {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/image");
      xhr.setRequestHeader("x-csrf-token", getCsrf());
      xhr.upload.onprogress = (e)=> { if (e.lengthComputable) onProgress(Math.round(e.loaded/e.total*100)); };
      xhr.onload = ()=> {
        if (xhr.status>=200 && xhr.status<300) {
          try { const j = JSON.parse(xhr.responseText); resolve(j.url); } catch { reject(new Error("Invalid response")); }
        } else {
          try { const j = JSON.parse(xhr.responseText); reject(new Error(j.error || "Upload failed")); } catch { reject(new Error("Upload failed")); }
        }
      };
      xhr.onerror = ()=> reject(new Error("Network error"));
      xhr.send(form);
    });
  }

  if (loading) return <div className="p-8">Loading…</div>;
  if (!data) return <div className="p-8">Failed to load</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile & Hero</h1>
        <p className="text-sm text-ink/60">Manage your public identity. Age is editable and optional. Portrait is used exactly as supplied — face/hair never altered.</p>
      </div>

      {msg && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>}
      {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[20px] bg-white border border-ink/10 p-6 space-y-4">
            <h3 className="font-semibold">Public identity</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" value={data.name} onChange={v=>setData({...data, name:v})} />
              <Field label="Role" value={data.role} onChange={v=>setData({...data, role:v})} />
              <Field label="Location" value={data.location} onChange={v=>setData({...data, location:v})} />
              <Field label="Age (editable, optional)" value={data.age ?? ""} onChange={v=>setData({...data, age: v===""? null: parseInt(v)||null })} placeholder="Leave empty to hide" type="number" />
              <Field label="Email" value={data.email} onChange={v=>setData({...data, email:v})} />
              <Field label="WhatsApp (+92…)" value={data.whatsapp} onChange={v=>setData({...data, whatsapp:v})} />
              <Field label="Mobile" value={data.mobile} onChange={v=>setData({...data, mobile:v})} />
            </div>
            <Area label="Bio / About (shown in About section)" value={data.bio || ""} onChange={v=>setData({...data, bio:v})} placeholder="Your story, approach, and values. Leave empty to show placeholder." />
          </div>

          <div className="rounded-[20px] bg-white border border-ink/10 p-6 space-y-4">
            <h3 className="font-semibold">Hero</h3>
            <Field label="Hero title" value={data.heroTitle} onChange={v=>setData({...data, heroTitle:v})} />
            <Area label="Hero subtitle" value={data.heroSubtitle} onChange={v=>setData({...data, heroSubtitle:v})} />
            <div className="rounded-xl bg-ivory-soft p-4">
              <div className="font-mono text-xs tracking-widest text-ink/60">FEATURED WORK SELECTION</div>
              <p className="text-xs text-ink/60 mt-1">Reserved for your website-services graphic. Enter a published Project ID, or leave empty to show awaiting state. You will provide this graphic later.</p>
              <input value={data.featuredProjectId || ""} onChange={e=>setData({...data, featuredProjectId: e.target.value || null})} placeholder="e.g. proj-id — leave empty until you supply graphic" className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <button onClick={save} disabled={saving} className="rounded-full bg-ink text-white px-8 py-3 font-semibold hover:bg-ink-light disabled:opacity-50">{saving ? "Saving…" : "Save profile & hero"}</button>
        </div>

        <div className="space-y-6">
          <div className="rounded-[20px] bg-white border border-ink/10 p-6">
            <h3 className="font-semibold">Profile photo</h3>
            <p className="text-xs text-ink/60 mt-1">Used exactly as supplied. We never alter face shape or hair. Only background/layout is styled.</p>
            <div className="mt-4 aspect-[4/5] rounded-2xl overflow-hidden bg-ivory-soft border border-ink/10 grid place-items-center relative">
              {data.profilePhoto ? <img src={data.profilePhoto} alt="profile" className="h-full w-full object-cover" /> : <span className="text-sm text-ink/40">No photo — reserved place</span>}
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Upload portrait</span>
              <input type="file" accept="image/*" onChange={async e=> {
                const f = e.target.files?.[0]; if(!f) return;
                setPhotoProgress(0); setErr("");
                try{
                  const url = await uploadFile(f, "profile", p=>setPhotoProgress(p));
                  setData((prev:any)=> ({...prev, profilePhoto: url}));
                  // auto-save photo field via api
                  await fetch("/api/admin/site", { method:"POST", headers:{ "Content-Type":"application/json", "x-csrf-token": getCsrf()}, body: JSON.stringify({ profilePhoto: url })});
                  setMsg("Portrait uploaded");
                } catch(err:any){ setErr(err.message);} finally { setPhotoProgress(null); }
              }} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-white hover:file:bg-ink-light file:font-medium" />
            </label>
            {photoProgress !== null && <div className="mt-2 h-2 rounded-full bg-ivory-soft overflow-hidden"><div className="h-full bg-ink transition-all" style={{width: `${photoProgress}%`}} /></div>}
            {data.profilePhoto && <button onClick={async()=>{ await fetch("/api/admin/site",{method:"POST",headers:{"Content-Type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({profilePhoto:""})}); setData({...data, profilePhoto:""}); }} className="mt-2 text-xs text-red-600 hover:underline">Remove photo</button>}
          </div>

          <div className="rounded-[20px] bg-white border border-ink/10 p-6">
            <h3 className="font-semibold">Résumé PDF</h3>
            <p className="text-xs text-ink/60 mt-1">Secure PDF upload, max 10MB.</p>
            {data.resumeUrl ? <a href={data.resumeUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl bg-ivory-soft p-3 text-sm break-all">{data.resumeUrl} ↗</a> : <div className="mt-3 text-sm text-ink/40">No résumé uploaded</div>}
            <label className="mt-3 block">
              <input type="file" accept="application/pdf" onChange={async e=>{
                const f=e.target.files?.[0]; if(!f) return;
                setResumeProgress(0);
                try{ const url=await uploadFile(f,"resume",p=>setResumeProgress(p)); setData((prev:any)=>({...prev, resumeUrl:url})); await fetch("/api/admin/site",{method:"POST",headers:{"Content-Type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({resumeUrl:url})}); setMsg("Résumé uploaded");} catch(err:any){setErr(err.message);} finally{setResumeProgress(null);}
              }} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-white file:font-medium" />
            </label>
            {resumeProgress!==null && <div className="mt-2 h-2 rounded-full bg-ivory-soft overflow-hidden"><div className="h-full bg-ink" style={{width:`${resumeProgress}%`}} /></div>}
            {data.resumeUrl && <button onClick={async()=>{await fetch("/api/admin/site",{method:"POST",headers:{"Content-Type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({resumeUrl:""})}); setData({...data,resumeUrl:""});}} className="mt-2 text-xs text-red-600 hover:underline">Remove résumé</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({label, value, onChange, placeholder, type="text"}:{label:string; value:any; onChange:(v:string)=>void; placeholder?:string; type?:string}){
  return (
    <label className="block">
      <span className="font-mono text-xs tracking-widest text-ink/60">{label}</span>
      <input type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none" />
    </label>
  );
}
function Area({label, value, onChange, placeholder}:{label:string; value:string; onChange:(v:string)=>void; placeholder?:string}){
  return (
    <label className="block">
      <span className="font-mono text-xs tracking-widest text-ink/60">{label}</span>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm focus:border-ink focus:ring-2 focus:ring-ink/10 outline-none" />
    </label>
  );
}
