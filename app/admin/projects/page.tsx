"use client";
import { useEffect, useState } from "react";

type Project = { id:string; title:string; category:string; description:string; order:number; status:"draft"|"published"; coverImage:string; images:string[]; featured:boolean; createdAt:string; updatedAt:string };

export default function ProjectsPage(){
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<number | null>(null);

  function csrf(){ return document.cookie.split("; ").find(c=>c.trim().startsWith("csrf_token="))?.split("=")[1] || ""; }

  async function load(){
    const res = await fetch("/api/admin/projects");
    if(res.ok){ const j=await res.json(); setProjects(j); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function startNew(){ setEditing({ title:"", category:"", description:"", order: projects.length, status:"draft", coverImage:"", images:[], featured:false }); setErr(""); setMsg(""); }
  function startEdit(p:Project){ setEditing({...p}); setErr(""); setMsg(""); }

  async function save(){
    if(!editing) return;
    setErr(""); setMsg("");
    if(!editing.title || !editing.category) { setErr("Title and category are required"); return; }
    try{
      const res = await fetch("/api/admin/projects", { method:"POST", headers:{ "Content-Type":"application/json", "x-csrf-token": csrf() }, body: JSON.stringify(editing)});
      const j = await res.json();
      if(!res.ok) throw new Error(j.error || "Save failed");
      setProjects(j);
      setEditing(null);
      setMsg("Project saved. Drafts stay private until published.");
    }catch(e:any){ setErr(e.message); }
  }

  async function del(id:string){
    if(!confirm("Delete project?")) return;
    const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, { method:"DELETE", headers:{ "x-csrf-token": csrf() }});
    if(res.ok) load(); else setErr("Delete failed");
  }

  async function uploadFiles(files: FileList, target: "cover"|"gallery"){
    if(!editing) return;
    for(let i=0;i<files.length;i++){
      const file = files[i];
      setUploading(0);
      const form = new FormData(); form.append("file", file); form.append("folder", "projects");
      const xhr = new XMLHttpRequest();
      xhr.open("POST","/api/upload/image");
      xhr.setRequestHeader("x-csrf-token", csrf());
      await new Promise<void>((resolve,reject)=>{
        xhr.upload.onprogress = e=> { if(e.lengthComputable) setUploading(Math.round(e.loaded/e.total*100)); };
        xhr.onload = ()=> {
          if(xhr.status>=200 && xhr.status<300){
            const j = JSON.parse(xhr.responseText);
            // duplicate detection: avoid exact duplicate URL
            if(target==="cover"){
              if(editing.coverImage === j.url) { setErr("Duplicate image ignored — exact same file already as cover."); }
              else setEditing(prev=> prev? {...prev, coverImage: j.url}:prev);
            } else {
              setEditing(prev=> {
                if(!prev) return prev;
                const existing = prev.images || [];
                if(existing.includes(j.url)) {
                  setErr("Duplicate image ignored — exact URL already in gallery.");
                  return prev;
                }
                // retain existing work: append distinct
                return {...prev, images: [...existing, j.url] };
              });
            }
            resolve();
          } else {
            try{ const j=JSON.parse(xhr.responseText); setErr(j.error||"Upload failed"); }catch{ setErr("Upload failed"); }
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = ()=> { setErr("Network error"); reject(new Error("Network")); };
        xhr.send(form);
      });
      setUploading(null);
    }
  }

  if(loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Projects & Galleries</h1>
          <p className="text-sm text-ink/60">Create, order, and publish. For Textile, only label “Textile” is shown publicly — no description. Duplicates are blocked. Existing work retained when adding new.</p>
        </div>
        <button onClick={startNew} className="rounded-full bg-ink text-white px-6 py-2.5 text-sm font-semibold">New project</button>
      </div>

      {msg && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>}
      {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

      {editing ? (
        <div className="rounded-[24px] bg-white border border-ink/10 p-6 space-y-4">
          <h3 className="font-semibold">{editing.id ? "Edit project" : "New project"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block"><span className="font-mono text-xs tracking-widest text-ink/60">TITLE *</span><input value={editing.title||""} onChange={e=>setEditing({...editing, title:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" placeholder="e.g. Royal Textile Collection" /></label>
            <label className="block"><span className="font-mono text-xs tracking-widest text-ink/60">CATEGORY *</span><input value={editing.category||""} onChange={e=>setEditing({...editing, category:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" placeholder="Textile, Branding, Web, etc." /><span className="text-xs text-ink/50">If Textile — description will be hidden publicly; only “Textile” label shows.</span></label>
            <label className="block"><span className="font-mono text-xs tracking-widest text-ink/60">ORDER</span><input type="number" value={editing.order??0} onChange={e=>setEditing({...editing, order: parseInt(e.target.value)||0})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
            <label className="block"><span className="font-mono text-xs tracking-widest text-ink/60">STATUS</span><select value={editing.status} onChange={e=>setEditing({...editing, status:e.target.value as any})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"><option value="draft">Draft — private until published</option><option value="published">Published — visible on site</option></select></label>
          </div>
          <label className="block"><span className="font-mono text-xs tracking-widest text-ink/60">DESCRIPTION</span><textarea value={editing.description||""} onChange={e=>setEditing({...editing, description:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm" placeholder="Will be hidden for Textile category on public site" /></label>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-ivory-soft p-4">
              <div className="font-mono text-xs tracking-widest">COVER IMAGE</div>
              {editing.coverImage ? <img src={editing.coverImage} alt="cover" className="mt-3 rounded-xl w-full object-cover max-h-48" /> : <div className="mt-3 rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/50">No cover — upload to set</div>}
              <input type="file" accept="image/*" onChange={e=> e.target.files && uploadFiles(e.target.files, "cover")} className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-white" />
              {editing.coverImage && <button onClick={()=>setEditing({...editing, coverImage:""})} className="mt-2 text-xs text-red-600 hover:underline">Remove cover</button>}
            </div>
            <div className="rounded-xl bg-ivory-soft p-4">
              <div className="font-mono text-xs tracking-widest">GALLERY ({(editing.images||[]).length} images)</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(editing.images||[]).map((url, idx)=> (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`img ${idx}`} className="h-20 w-full object-cover rounded-lg" />
                    <button onClick={()=>setEditing({...editing, images: (editing.images||[]).filter((_,i)=>i!==idx)})} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white text-xs grid place-items-center opacity-90">×</button>
                  </div>
                ))}
              </div>
              {(editing.images||[]).length===0 && <div className="mt-3 text-sm text-ink/50">No gallery images yet — add distinct images; duplicates are blocked.</div>}
              <input type="file" accept="image/*" multiple onChange={e=> e.target.files && uploadFiles(e.target.files, "gallery")} className="mt-3 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-white" />
              <div className="mt-2 text-xs text-ink/60">When you later provide work, we retain existing work — new distinct images are appended. Exact duplicates are ignored.</div>
            </div>
          </div>
          {uploading!==null && <div className="h-2 rounded-full bg-ivory-soft overflow-hidden"><div className="h-full bg-ink" style={{width:`${uploading}%`}} /></div>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={e=>setEditing({...editing, featured:e.target.checked})} /> Mark as featured (homepage spotlight alternative)</label>
          <div className="flex gap-3">
            <button onClick={save} className="rounded-full bg-ink text-white px-6 py-2.5 text-sm font-semibold">Save project</button>
            <button onClick={()=>setEditing(null)} className="rounded-full bg-white border border-ink/15 px-6 py-2.5 text-sm">Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[20px] bg-white border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory-soft text-ink/60 font-mono text-xs tracking-widest">
              <tr><th className="text-left px-4 py-3">TITLE</th><th className="text-left px-4 py-3">CATEGORY</th><th className="text-left px-4 py-3">STATUS</th><th className="text-left px-4 py-3">ORDER</th><th className="text-left px-4 py-3">IMAGES</th><th className="text-right px-4 py-3">ACTIONS</th></tr>
            </thead>
            <tbody>
              {projects.length===0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">No projects yet. Create your first — initially empty is intentional.</td></tr> : projects.sort((a,b)=>a.order-b.order).map(p=> (
                <tr key={p.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium">{p.title} {p.featured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs">featured</span>}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${p.status==="published"?"bg-green-100 text-green-700":"bg-ink/10 text-ink"}`}>{p.status}</span></td>
                  <td className="px-4 py-3">{p.order}</td>
                  <td className="px-4 py-3">{p.images.length + (p.coverImage?1:0)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={()=>startEdit(p)} className="rounded-full bg-ivory-soft px-3 py-1.5 text-xs hover:bg-ink hover:text-white">Edit</button>
                    <button onClick={()=>del(p.id)} className="rounded-full bg-red-50 text-red-700 px-3 py-1.5 text-xs hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
