import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/auth/admin";

const body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const { token, expiresAt } = await createAdminSession(admin.id);
  const res = NextResponse.json({
    data: { email: admin.email, id: admin.id, expiresAt: expiresAt.toISOString() },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
  return res;
}
