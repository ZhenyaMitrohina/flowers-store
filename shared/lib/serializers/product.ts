import type { Category, Product } from '@prisma/client'
import { priceBreakdown } from '@/shared/lib/pricing'

const MAX_IMAGES = 5

export function capImageUrls(urls: string[] | null | undefined): string[] {
	return (urls ?? [])
		.map((s) => s.trim())
		.filter(Boolean)
		.slice(0, MAX_IMAGES)
}

export type ProductPublic = ReturnType<typeof toProductPublic>

export function toProductPublic(p: Product & { category: Pick<Category, 'id' | 'name' | 'slug'> }) {
	const pb = priceBreakdown(p)
	return {
		id: p.id,
		name: p.name,
		description: p.description,
		imageUrls: capImageUrls(p.imageUrls),
		isActive: p.isActive,
		category: {
			id: p.category.id,
			name: p.category.name,
			slug: p.category.slug,
		},
		priceOriginal: pb.priceOriginal,
		priceFinal: pb.priceFinal,
		discount: {
			type: pb.discount.type,
			value: pb.discount.value,
		},
	}
}

export function toProductAdmin(p: Product & { category: Pick<Category, 'id' | 'name' | 'slug'> }) {
	return {
		...toProductPublic(p),
		price: p.price.toString(),
		discountType: p.discountType,
		discountValue: p.discountValue.toString(),
		categoryId: p.categoryId,
		createdAt: p.createdAt.toISOString(),
		updatedAt: p.updatedAt.toISOString(),
	}
}
