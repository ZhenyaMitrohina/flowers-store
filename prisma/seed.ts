import { PrismaClient, type DiscountType } from '@prisma/client'
import bcrypt from 'bcrypt'
import { categories, products } from './constants'

const prisma = new PrismaClient()

async function main() {
	const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@flowers.local'
	const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme'
	const hash = await bcrypt.hash(password, 12)

	await prisma.admin.upsert({
		where: { email },
		create: { email, passwordHash: hash },
		update: { passwordHash: hash },
	})

	for (const c of categories) {
		await prisma.category.upsert({
			where: { slug: c.slug },
			create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
			update: { name: c.name, sortOrder: c.sortOrder },
		})
	}

	const categoryRows = await prisma.category.findMany({
		where: { slug: { in: categories.map((c) => c.slug) } },
		select: { id: true, slug: true },
	})
	const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]))

	for (const catSlug of Object.keys(products) as (keyof typeof products)[]) {
		const categoryId = categoryIdBySlug.get(catSlug)
		if (!categoryId) continue

		for (const p of products[catSlug]) {
			const existing = await prisma.product.findFirst({
				where: { categoryId, name: p.name },
			})

			const data = {
				name: p.name,
				description: p.description,
				price: p.price,
				discountType: p.discountType as DiscountType,
				discountValue: p.discountValue,
				imageUrls: [...p.imageUrls],
				isActive: p.isActive,
				categoryId,
			}

			if (existing) {
				await prisma.product.update({ where: { id: existing.id }, data })
			} else {
				await prisma.product.create({ data })
			}
		}
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
