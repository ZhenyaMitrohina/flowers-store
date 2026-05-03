import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getOrCreateCart, snapshotFromProduct } from '@/shared/lib/cart'
import { guestHeader } from '@/shared/lib/validation/cart'

const qty = z.object({ quantity: z.coerce.number().int().min(1).max(999) })

type RouteCtx = { params: Promise<{ productId: string }> }

export async function PATCH(request: Request, ctx: RouteCtx) {
	const { productId } = await ctx.params
	const tok = guestHeader(request.headers)
	if (!tok.success) {
		return NextResponse.json(
			{ error: tok.error.flatten().formErrors[0] ?? 'Нужен X-Guest-Token' },
			{ status: 400 },
		)
	}
	const body = await request.json().catch(() => ({}))
	const parsed = qty.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
	}
	const cart = await getOrCreateCart(prisma, tok.data)
	const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } })
	if (!product) {
		return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
	}
	const { unitPriceSnapshot, discountSnapshot, finalPriceSnapshot } = snapshotFromProduct(product)

	const row = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } })
	if (!row) {
		return NextResponse.json({ error: 'Позиция не в корзине' }, { status: 404 })
	}

	await prisma.cartItem.update({
		where: { id: row.id },
		data: {
			quantity: parsed.data.quantity,
			unitPriceSnapshot,
			discountSnapshot: discountSnapshot as Prisma.JsonObject,
			finalPriceSnapshot,
		},
	})
	return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, ctx: RouteCtx) {
	const { productId } = await ctx.params
	const tok = guestHeader(request.headers)
	if (!tok.success) {
		return NextResponse.json(
			{ error: tok.error.flatten().formErrors[0] ?? 'Нужен X-Guest-Token' },
			{ status: 400 },
		)
	}
	const cart = await getOrCreateCart(prisma, tok.data)
	await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
	return NextResponse.json({ ok: true })
}
