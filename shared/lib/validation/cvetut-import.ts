import { z } from 'zod'
import { DiscountType } from '@prisma/client'

const discountTypeZ = z.nativeEnum(DiscountType)

const slugCategoryZ = z
	.string()
	.min(1)
	.max(100)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: только латиница, цифры и дефисы')

/** Категория в JSON парсера cvetut (как в ScrapedCategory). */
export const cvetutImportCategorySchema = z.object({
	name: z.string().min(1).max(200),
	slug: slugCategoryZ,
	sortOrder: z.number().int().min(0),
})

/** Товар в JSON парсера (как в ScrapedProduct; slug в БД не хранится). */
export const cvetutImportProductSchema = z.object({
	slug: z.string().min(1).max(200),
	name: z.string().min(1).max(500),
	description: z.string().max(20000).default(''),
	price: z.number().finite(),
	discountType: discountTypeZ.default('NONE'),
	discountValue: z
		.string()
		.or(z.number())
		.default(0)
		.transform((v) => String(v)),
	imageUrls: z.array(z.string().url('Каждое изображение — валидный URL')).max(20).default([]),
	isActive: z.boolean().default(true),
	categorySlug: slugCategoryZ,
})

export const cvetutImportBodySchema = z
	.object({
		categories: z.array(cvetutImportCategorySchema).min(1),
		products: z.array(cvetutImportProductSchema),
	})
	.superRefine((body, ctx) => {
		const slugSeen = new Set<string>()
		const orderSeen = new Set<number>()
		for (let i = 0; i < body.categories.length; i++) {
			const c = body.categories[i]!
			if (slugSeen.has(c.slug)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Дубликат slug категории: ${c.slug}`,
					path: ['categories', i, 'slug'],
				})
			}
			slugSeen.add(c.slug)
			if (orderSeen.has(c.sortOrder)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Дубликат sortOrder категории: ${c.sortOrder}`,
					path: ['categories', i, 'sortOrder'],
				})
			}
			orderSeen.add(c.sortOrder)
		}

		for (let i = 0; i < body.products.length; i++) {
			const p = body.products[i]!
			if (p.discountType === 'PERCENT') {
				const n = Number(p.discountValue)
				if (!Number.isFinite(n) || n < 0 || n > 100) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Скидка % должна быть от 0 до 100',
						path: ['products', i, 'discountValue'],
					})
				}
			}
		}
	})

export type CvetutImportBody = z.infer<typeof cvetutImportBodySchema>
