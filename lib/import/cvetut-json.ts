import { Prisma, type DiscountType, type PrismaClient } from '@prisma/client'
import { capImageUrls } from '@/shared/lib/serializers/product'
import type { CvetutImportBody } from '@/shared/lib/validation/cvetut-import'

const SORT_ORDER_BUMP = 200_000

/** Разделитель для ключа categoryId + name в Map (имя товара не содержит \0). */
function productPairKey(categoryId: string, name: string) {
	return `${categoryId}\0${name}`
}

export type CvetutImportSkipped = { name: string; categorySlug: string; reason: string }

export type CvetutImportResult = {
	categoriesUpserted: number
	productsCreated: number
	productsUpdated: number
	skippedProducts: CvetutImportSkipped[]
}

/**
 * Импорт категорий и товаров из валидированного тела JSON парсера cvetut.
 * Сначала сдвигает sort_order всех категорий, чтобы освободить значения из файла (уникальность в БД).
 */
export async function importCvetutCatalog(
	prisma: PrismaClient,
	body: CvetutImportBody,
): Promise<CvetutImportResult> {
	return prisma.$transaction(
		async (tx) => {
			await tx.$executeRaw`UPDATE categories SET sort_order = sort_order + ${SORT_ORDER_BUMP}`

			for (const c of body.categories) {
				await tx.category.upsert({
					where: { slug: c.slug },
					create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
					update: { name: c.name, sortOrder: c.sortOrder },
				})
			}

			const slugList = body.categories.map((c) => c.slug)
			const categoryRows = await tx.category.findMany({
				where: { slug: { in: slugList } },
				select: { id: true, slug: true },
			})
			const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]))

			const importedCategoryIds = [...categoryIdBySlug.values()]
			const existingRows =
				importedCategoryIds.length > 0
					? await tx.product.findMany({
							where: { categoryId: { in: importedCategoryIds } },
							select: { id: true, categoryId: true, name: true },
						})
					: []
			const existingIdByPair = new Map(
				existingRows.map((row) => [productPairKey(row.categoryId, row.name), row.id]),
			)

			let productsCreated = 0
			let productsUpdated = 0
			const skippedProducts: CvetutImportSkipped[] = []

			for (const p of body.products) {
				const categoryId = categoryIdBySlug.get(p.categorySlug)
				if (!categoryId) {
					skippedProducts.push({
						name: p.name,
						categorySlug: p.categorySlug,
						reason: 'Неизвестная категория (slug отсутствует в импорте)',
					})
					continue
				}

				const imageUrls = capImageUrls(p.imageUrls)
				const price = new Prisma.Decimal(p.price)
				const discountValue = new Prisma.Decimal(p.discountValue)

				const data = {
					name: p.name,
					description: p.description,
					price,
					discountType: p.discountType as DiscountType,
					discountValue,
					imageUrls,
					isActive: p.isActive,
					categoryId,
				}

				const pairKey = productPairKey(categoryId, p.name)
				const existingId = existingIdByPair.get(pairKey)

				if (existingId) {
					await tx.product.update({ where: { id: existingId }, data })
					productsUpdated += 1
				} else {
					const created = await tx.product.create({ data })
					existingIdByPair.set(pairKey, created.id)
					productsCreated += 1
				}
			}

			return {
				categoriesUpserted: body.categories.length,
				productsCreated,
				productsUpdated,
				skippedProducts,
			}
		},
		{
			maxWait: 15_000,
			timeout: 120_000,
		},
	)
}
