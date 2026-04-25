import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookieStore, adminUnauthorized } from "@/lib/auth/admin";
import { categoryCreateSchema } from "@/lib/validation/category";

export async function GET() {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const parsed = categoryCreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const row = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Не удалось создать (slug уникален?)" }, { status: 409 });
  }
}
