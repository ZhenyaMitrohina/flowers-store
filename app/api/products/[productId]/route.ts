import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toProductPublic } from '@/shared/lib/serializers/product'

type Ctx = { params: Promise<{ productId: string }> }

export async function GET(_request: Request, ctx: Ctx) {
	const { productId } = await ctx.params
	const row = await prisma.product.findFirst({
		where: { id: productId, isActive: true },
		include: { category: { select: { id: true, name: true, slug: true } } },
	})
	if (!row) {
		return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
	}
	return NextResponse.json({ data: toProductPublic(row) })
}
