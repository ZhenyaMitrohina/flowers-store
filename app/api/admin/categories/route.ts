import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookieStore, adminUnauthorized } from '@/app/api/auth/admin'
import { categoryCreateSchema } from '@/shared/lib/validation/category'
import { defaultCategorySlugFallback, slugFromCategoryName } from '@/shared/lib/slug'

export async function GET() {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const rows = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
	return NextResponse.json({ data: rows })
}

export async function POST(request: Request) {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const parsed = categoryCreateSchema.safeParse(await request.json().catch(() => ({})))
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const d = parsed.data
	let slug: string
	if (d.slug !== undefined) {
		slug = d.slug
	} else {
		let base = slugFromCategoryName(d.name) || defaultCategorySlugFallback
		if (base.length > 80) {
			base = base.slice(0, 80).replace(/-+$/, '')
		}
		let n = 0
		slug = base
		while (await prisma.category.findUnique({ where: { slug } })) {
			n += 1
			const suffix = `-${n}`
			const maxHead = 100 - suffix.length
			const head =
				base.length > maxHead ? base.slice(0, maxHead).replace(/-+$/, '') : base
			slug = head + suffix
		}
	}

	const orderTaken = await prisma.category.findFirst({
		where: { sortOrder: d.sortOrder },
		select: { id: true },
	})
	if (orderTaken) {
		return NextResponse.json(
			{ error: 'Позиция сортировки (sortOrder) уже занята другой категорией' },
			{ status: 409 },
		)
	}

	try {
		const row = await prisma.category.create({
			data: { name: d.name, slug, sortOrder: d.sortOrder },
		})
		return NextResponse.json({ data: row }, { status: 201 })
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
			const t = (e.meta?.target as string[] | undefined) ?? []
			if (t.includes('sort_order') || t.some((x) => x.toLowerCase().includes('sort'))) {
				return NextResponse.json(
					{ error: 'Позиция сортировки (sortOrder) уже занята другой категорией' },
					{ status: 409 },
				)
			}
		}
		return NextResponse.json({ error: 'Не удалось создать (slug уникален?)' }, { status: 409 })
	}
}
