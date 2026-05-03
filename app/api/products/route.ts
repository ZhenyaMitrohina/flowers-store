import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toProductPublic } from '@/shared/lib/serializers/product'
import { productListQuery } from '@/shared/lib/validation/product-list'

export async function GET(request: Request) {
	const url = new URL(request.url)
	const params = {
		q: url.searchParams.get('q') ?? url.searchParams.get('search') ?? undefined,
		search: url.searchParams.get('search') ?? undefined,
		categorySlug:
			url.searchParams.get('categorySlug') ?? url.searchParams.get('category') ?? undefined,
		category: url.searchParams.get('category') ?? undefined,
		page: url.searchParams.get('page') ?? undefined,
		limit: url.searchParams.get('limit') ?? undefined,
	}
	const parsed = productListQuery.safeParse(params)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Неверные параметры запроса', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const { q, categorySlug, page, limit } = parsed.data

	const where = {
		isActive: true,
		...(q
			? {
					name: { contains: q, mode: 'insensitive' as const },
				}
			: {}),
		...(categorySlug ? { category: { slug: categorySlug } } : {}),
	}

	const [total, rows] = await Promise.all([
		prisma.product.count({ where }),
		prisma.product.findMany({
			where,
			include: { category: { select: { id: true, name: true, slug: true } } },
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		}),
	])

	return NextResponse.json({
		data: rows.map(toProductPublic),
		meta: {
			page,
			limit,
			total,
			totalPages: Math.max(1, Math.ceil(total / limit)),
		},
	})
}
