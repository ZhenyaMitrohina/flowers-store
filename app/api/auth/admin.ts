import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 7;

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createAdminSession(adminId: string) {
  const token = randomToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.adminSession.create({
    data: { adminId, tokenHash, expiresAt },
  });
  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  await prisma.adminSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function getAdminFromCookieStore() {
  const c = await cookies();
  const raw = c.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return getAdminBySessionToken(raw);
}

export async function getAdminBySessionToken(token: string) {
  const session = await prisma.adminSession.findFirst({
    where: { tokenHash: hashSessionToken(token), expiresAt: { gt: new Date() } },
    include: { admin: { select: { id: true, email: true, createdAt: true } } },
  });
  if (!session) return null;
  return session.admin;
}
