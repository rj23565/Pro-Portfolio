import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest){
  const accept = req.headers.get("accept") || "";
  const isJson = accept.includes("application/json") || req.headers.get("content-type")?.includes("json");
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const res = isJson ? NextResponse.json({ ok: true }) : NextResponse.redirect(new URL("/admin/login", base));
  res.cookies.delete("session");
  res.cookies.delete("csrf_token");
  return res;
}
export async function GET(req: NextRequest){
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/admin/login", base));
  res.cookies.delete("session");
  res.cookies.delete("csrf_token");
  return res;
}
