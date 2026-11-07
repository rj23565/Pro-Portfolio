import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "./lib/auth-edge";

const ADMIN_PATHS = ["/admin"];
const PUBLIC_ADMIN = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
  const isPublicAdmin = PUBLIC_ADMIN.some(p => pathname === p || pathname.startsWith(p));

  // CSRF / Same-origin for state-changing requests
  if (["POST","PUT","PATCH","DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    const referer = req.headers.get("referer");
    // Allow same-origin; if Origin header present it must match host
    if (origin) {
      try {
        const o = new URL(origin);
        if (o.host !== host) {
          return new NextResponse("Forbidden: cross-origin", { status: 403 });
        }
      } catch { return new NextResponse("Forbidden", { status: 403 }); }
    } else if (referer) {
      try {
        const r = new URL(referer);
        if (r.host !== host) {
          return new NextResponse("Forbidden: cross-origin referer", { status: 403 });
        }
      } catch {}
    }
    // CSRF token check for admin APIs: expect x-csrf-token header matches cookie
    if (pathname.startsWith("/api/")) {
      const csrfHeader = req.headers.get("x-csrf-token");
      const csrfCookie = req.cookies.get("csrf_token")?.value;
      // Only enforce if session exists; login route is exempt
      const hasSession = req.cookies.get("session")?.value;
      if (hasSession && !pathname.includes("/api/auth")) {
        if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
          return new NextResponse(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
      }
    }
  }

  if (isAdmin && !isPublicAdmin) {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const valid = await verifySessionEdge(session);
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete("session");
      return res;
    }
  }

  // Rate limit headers passthrough (actual limiting in route handlers)
  const res = NextResponse.next();
  // Security headers already in next.config but add here for edge
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"]
};
