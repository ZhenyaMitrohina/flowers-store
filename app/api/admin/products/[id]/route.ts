import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookieStore, adminUnauthorized } from "@/lib/auth/admin";
import { productPatchSchema } from "@/lib/validation/product";
import { toProductAdmin, capImageUrls } from "@/lib/serializers/product";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  const row = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!row) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ data: toProductAdmin(row) });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  const parsed = productPatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  if (d.discountType === "PERCENT" && d.discountValue) {
    const v = new Prisma.Decimal(String(d.discountValue));
    if (v.greaterThan(100)) {
      return NextResponse.json({ error: "Скидка % не больше 100" }, { status: 400 });
    }
  }
  const data: Prisma.ProductUpdateInput = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.description !== undefined) data.description = d.description;
  if (d.price !== undefined) data.price = new Prisma.Decimal(String(d.price));
  if (d.discountType !== undefined) data.discountType = d.discountType;
  if (d.discountValue !== undefined) data.discountValue = new Prisma.Decimal(String(d.discountValue));
  if (d.imageUrls !== undefined) data.imageUrls = capImageUrls(d.imageUrls);
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.categoryId !== undefined) data.category = { connect: { id: d.categoryId } };
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Пусто" }, { status: 400 });
  }
  try {
    const row = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ data: toProductAdmin(row) });
  } catch {
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не найден" }, { status: 404 });
  }
}
