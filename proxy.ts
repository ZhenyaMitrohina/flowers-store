import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

export function proxy(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (!p.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (p === "/api/admin/auth/login" && request.method === "POST") {
    return NextResponse.next();
  }
  if (!request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
