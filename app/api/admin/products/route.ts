import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookieStore, adminUnauthorized } from '@/app/api/auth/admin'
import { productCreateSchema } from '@/shared/lib/validation/product'
import { toProductAdmin, capImageUrls } from '@/shared/lib/serializers/product'

export async function GET() {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const rows = await prisma.product.findMany({
		orderBy: { createdAt: 'desc' },
		include: { category: { select: { id: true, name: true, slug: true } } },
	})
	return NextResponse.json({ data: rows.map(toProductAdmin) })
}

export async function POST(request: Request) {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const parsed = productCreateSchema.safeParse(await request.json().catch(() => ({})))
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const d = parsed.data
	const imageUrls = capImageUrls(d.imageUrls)
	const price = new Prisma.Decimal(d.price)
	const discountValue = new Prisma.Decimal(d.discountValue)
	if (d.discountType === 'PERCENT' && discountValue.greaterThan(100)) {
		return NextResponse.json({ error: 'Скидка % не больше 100' }, { status: 400 })
	}
	const row = await prisma.product.create({
		data: {
			name: d.name,
			description: d.description,
			price,
			discountType: d.discountType,
			discountValue,
			imageUrls,
			isActive: d.isActive,
			categoryId: d.categoryId,
		},
		include: { category: { select: { id: true, name: true, slug: true } } },
	})
	return NextResponse.json({ data: toProductAdmin(row) }, { status: 201 })
}
