import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, deleteSessionByToken } from "@/lib/auth/admin";

export async function POST() {
  const c = await cookies();
  const raw = c.get(ADMIN_SESSION_COOKIE)?.value;
  if (raw) {
    await deleteSessionByToken(raw);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
