import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookieStore, adminUnauthorized } from "@/lib/auth/admin";
import { orderAdminListQuery } from "@/lib/validation/order";
import { toOrderAdmin } from "@/lib/serializers/order";

export async function GET(request: Request) {
  const admin = await getAdminFromCookieStore();
  if (!admin) return adminUnauthorized();
  const url = new URL(request.url);
  const parsed = orderAdminListQuery.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Параметры", details: parsed.error.flatten() }, { status: 400 });
  }
  const { status, from, to, page, limit } = parsed.data;
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: { include: { product: true } }, payments: true },
    }),
  ]);
  return NextResponse.json({
    data: rows.map(toOrderAdmin),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}
