import { prisma } from '@/lib/prisma'
import { toProductPublic, type ProductPublic } from '@/shared/lib/serializers/product'

export interface CatalogSection {
	id: string
	name: string
	slug: string
	products: ProductPublic[]
}

export async function loadCatalog(): Promise<CatalogSection[]> {
	const categories = await prisma.category.findMany({
		orderBy: { sortOrder: 'asc' },
		include: {
			products: {
				where: { isActive: true },
				orderBy: { createdAt: 'desc' },
				include: { category: { select: { id: true, name: true, slug: true } } },
			},
		},
	})

	return categories
		.filter((c) => c.products.length > 0)
		.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			products: c.products.map(toProductPublic),
		}))
}

export async function loadRecommended(categoryId: string, excludeId: string, limit = 8): Promise<ProductPublic[]> {
	const rows = await prisma.product.findMany({
		where: { isActive: true, categoryId, NOT: { id: excludeId } },
		orderBy: { createdAt: 'desc' },
		take: limit,
		include: { category: { select: { id: true, name: true, slug: true } } },
	})
	return rows.map(toProductPublic)
}

export async function loadProductForPage(productId: string) {
	const row = await prisma.product.findFirst({
		where: { id: productId, isActive: true },
		include: { category: { select: { id: true, name: true, slug: true } } },
	})
	if (!row) return null
	return toProductPublic(row)
}
