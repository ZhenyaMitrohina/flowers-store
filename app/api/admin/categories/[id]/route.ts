import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookieStore, adminUnauthorized } from "@/lib/auth/admin";
import { categoryPatchSchema } from "@/lib/validation/category";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  const parsed = categoryPatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Пусто" }, { status: 400 });
  }
  try {
    const row = await prisma.category.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ data: row });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  const n = await prisma.product.count({ where: { categoryId: id } });
  if (n > 0) {
    return NextResponse.json({ error: "Сначала перенесите товары в другую категорию" }, { status: 409 });
  }
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не удалено" }, { status: 400 });
  }
}
