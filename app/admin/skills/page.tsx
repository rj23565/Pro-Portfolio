"use client";
import { useEffect, useState } from "react";
type Skill={id:string; name:string; level:string; category:string; order:number};
export default function SkillsPage(){
  const [list,setList]=useState<Skill[]>([]); const [editing,setEditing]=useState<Partial<Skill>|null>(null); const [err,setErr]=useState(""); const [msg,setMsg]=useState("");
  function csrf(){return document.cookie.split("; ").find(c=>c.trim().startsWith("csrf_token="))?.split("=")[1]||"";}
  async function load(){ const r=await fetch("/api/admin/skills"); if(r.ok) setList(await r.json());}
  useEffect(()=>{load()},[]);
  async function save(){ if(!editing?.name){setErr("Name required");return;} const res=await fetch("/api/admin/skills",{method:"POST",headers:{"Content-Type":"application/json","x-csrf-token":csrf()},body:JSON.stringify(editing)}); if(!res.ok){ const j=await res.json(); setErr(j.error);return;} setList(await res.json()); setEditing(null); setMsg("Saved");}
  async function del(id:string){ if(!confirm("Delete?"))return; await fetch(`/api/admin/skills?id=${id}`,{method:"DELETE",headers:{"x-csrf-token":csrf()}}); load();}
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-semibold">Skills & Tools</h1><p className="text-sm text-ink/60">Shown only when you provide facts — nothing invented.</p></div><button onClick={()=>setEditing({name:"",category:"Tools",level:"advanced",order:list.length})} className="rounded-full bg-ink text-white px-6 py-2.5 text-sm font-semibold">Add skill</button></div>
      {msg&&<div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{msg}</div>}
      {err&&<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
      {editing && (
        <div className="rounded-2xl bg-white border border-ink/10 p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <label className="block"><span className="font-mono text-xs tracking-widest">NAME</span><input value={editing.name||""} onChange={e=>setEditing({...editing,name:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" placeholder="e.g. Adobe Photoshop" /></label>
            <label className="block"><span className="font-mono text-xs tracking-widest">CATEGORY</span><input value={editing.category||""} onChange={e=>setEditing({...editing,category:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
            <label className="block"><span className="font-mono text-xs tracking-widest">LEVEL</span><select value={editing.level||"advanced"} onChange={e=>setEditing({...editing,level:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"><option value="expert">expert</option><option value="advanced">advanced</option><option value="intermediate">intermediate</option><option value="learning">learning</option></select></label>
          </div>
          <label className="block"><span className="font-mono text-xs tracking-widest">ORDER</span><input type="number" value={editing.order??0} onChange={e=>setEditing({...editing,order:parseInt(e.target.value)||0})} className="mt-2 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm" /></label>
          <div className="flex gap-2"><button onClick={save} className="rounded-full bg-ink text-white px-6 py-2.5 text-sm font-semibold">Save</button><button onClick={()=>setEditing(null)} className="rounded-full bg-white border border-ink/15 px-6 py-2.5 text-sm">Cancel</button></div>
        </div>
      )}
      <div className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ivory-soft font-mono text-xs tracking-widest text-ink/60"><tr><th className="text-left px-4 py-3">NAME</th><th className="text-left px-4 py-3">CATEGORY</th><th className="text-left px-4 py-3">LEVEL</th><th className="text-right px-4 py-3">ACTIONS</th></tr></thead>
          <tbody>{list.length===0? <tr><td colSpan={4} className="px-4 py-8 text-center text-ink/50">No skills yet — add facts; public section stays hidden until provided.</td></tr> : list.sort((a,b)=>a.order-b.order).map(s=> <tr key={s.id} className="border-t border-ink/5"><td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3">{s.category}</td><td className="px-4 py-3">{s.level}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={()=>setEditing(s)} className="rounded-full bg-ivory-soft px-3 py-1.5 text-xs">Edit</button><button onClick={()=>del(s.id)} className="rounded-full bg-red-50 text-red-700 px-3 py-1.5 text-xs">Delete</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
