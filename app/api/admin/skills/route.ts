import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skillSchema } from "@/lib/validation";
async function isAuthed(req: NextRequest): Promise<boolean> {
  const t = req.cookies.get("session")?.value; if(!t) return false; const s=process.env.SESSION_SECRET; if(!s) return false; try{ const { jwtVerify }=await import("jose"); await jwtVerify(t, new TextEncoder().encode(s)); return true;}catch{return false;}
}
export async function GET(req: NextRequest){ if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401}); const st=await db.getStore(); return NextResponse.json(st.skills); }
export async function POST(req: NextRequest){
  if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  if (Array.isArray(body.skills)) {
    for (const it of body.skills) { const p=skillSchema.safeParse(it); if(!p.success) return NextResponse.json({error:p.error.errors[0].message},{status:400}); }
    const normalized = body.skills.map((it:any,idx:number)=> ({ id: it.id||`skill-${Date.now()}-${idx}`, name: it.name, level: it.level||"advanced", category: it.category||"Tools", order: typeof it.order==="number"?it.order:idx }));
    await db.updateStore(d=> ({...d, skills: normalized}));
    return NextResponse.json(normalized);
  } else {
    const parsed=skillSchema.safeParse(body); if(!parsed.success) return NextResponse.json({error:parsed.error.errors[0].message},{status:400});
    const d=parsed.data; const st=await db.getStore(); let skills=[...st.skills];
    if(d.id){ const i=skills.findIndex(s=>s.id===d.id); if(i>=0) skills[i]={...skills[i],...d} as any; else skills.push({id:d.id,name:d.name,level:d.level||"advanced",category:d.category||"Tools",order:d.order||0});}
    else skills.push({id:`skill-${Date.now()}`,name:d.name,level:d.level||"advanced",category:d.category||"Tools",order:d.order||0});
    await db.updateStore(s=>({...s, skills}));
    return NextResponse.json(skills);
  }
}
export async function DELETE(req: NextRequest){ if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401}); const id=new URL(req.url).searchParams.get("id"); const st=await db.getStore(); const skills=st.skills.filter(x=>x.id!==id); await db.updateStore(d=>({...d, skills})); return NextResponse.json({ok:true});}
