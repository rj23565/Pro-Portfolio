import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { educationSchema } from "@/lib/validation";
async function isAuthed(req: NextRequest): Promise<boolean> { const t=req.cookies.get("session")?.value; if(!t) return false; const s=process.env.SESSION_SECRET; if(!s) return false; try{ const {jwtVerify}=await import("jose"); await jwtVerify(t, new TextEncoder().encode(s)); return true;}catch{return false;}}
export async function GET(req: NextRequest){ if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401}); const st=await db.getStore(); return NextResponse.json(st.education); }
export async function POST(req: NextRequest){
  if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  if (Array.isArray(body.education)) {
    for (const it of body.education) { const p=educationSchema.safeParse(it); if(!p.success) return NextResponse.json({error:p.error.errors[0].message},{status:400}); }
    const normalized = body.education.map((it:any,idx:number)=> ({ id: it.id||`edu-${Date.now()}-${idx}`, title: it.title, institution: it.institution||"", year: it.year||"", description: it.description||"", order: typeof it.order==="number"?it.order:idx }));
    await db.updateStore(d=> ({...d, education: normalized}));
    return NextResponse.json(normalized);
  } else {
    const parsed=educationSchema.safeParse(body); if(!parsed.success) return NextResponse.json({error:parsed.error.errors[0].message},{status:400});
    const d=parsed.data; const st=await db.getStore(); let education=[...st.education];
    if(d.id){ const i=education.findIndex(s=>s.id===d.id); if(i>=0) education[i]={...education[i],...d} as any; else education.push({id:d.id,title:d.title,institution:d.institution||"",year:d.year||"",description:d.description||"",order:d.order||0});}
    else education.push({id:`edu-${Date.now()}`,title:d.title,institution:d.institution||"",year:d.year||"",description:d.description||"",order:d.order||0});
    await db.updateStore(s=>({...s, education}));
    return NextResponse.json(education);
  }
}
export async function DELETE(req: NextRequest){ if(!await isAuthed(req)) return NextResponse.json({error:"Unauthorized"},{status:401}); const id=new URL(req.url).searchParams.get("id"); const st=await db.getStore(); const education=st.education.filter(x=>x.id!==id); await db.updateStore(d=>({...d, education})); return NextResponse.json({ok:true});}
