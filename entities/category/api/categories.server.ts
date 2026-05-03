import { prisma } from '@/lib/prisma'
import type { Category } from '../model/types'

export async function loadCategories(): Promise<Category[]> {
	const rows = await prisma.category.findMany({
		orderBy: { sortOrder: 'asc' },
		select: { id: true, name: true, slug: true, sortOrder: true },
	})
	return rows
}
