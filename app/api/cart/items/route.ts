import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getOrCreateCart, snapshotFromProduct } from '@/shared/lib/cart'
import { cartItemAddSchema, guestHeader } from '@/shared/lib/validation/cart'

export async function POST(request: Request) {
	const tok = guestHeader(request.headers)
	if (!tok.success) {
		return NextResponse.json(
			{ error: tok.error.flatten().formErrors[0] ?? 'Нужен X-Guest-Token' },
			{ status: 400 },
		)
	}
	const body = await request.json().catch(() => ({}))
	const parsed = cartItemAddSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const { productId, quantity } = parsed.data

	const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } })
	if (!product) {
		return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
	}

	const guestToken = tok.data
	const cart = await getOrCreateCart(prisma, guestToken)
	const { unitPriceSnapshot, discountSnapshot, finalPriceSnapshot } = snapshotFromProduct(product)

	const existing = await prisma.cartItem.findUnique({
		where: { cartId_productId: { cartId: cart.id, productId: product.id } },
	})
	if (existing) {
		await prisma.cartItem.update({
			where: { id: existing.id },
			data: {
				quantity: existing.quantity + quantity,
				unitPriceSnapshot,
				discountSnapshot: discountSnapshot as Prisma.JsonObject,
				finalPriceSnapshot,
			},
		})
	} else {
		await prisma.cartItem.create({
			data: {
				cartId: cart.id,
				productId: product.id,
				quantity,
				unitPriceSnapshot,
				discountSnapshot: discountSnapshot as Prisma.JsonObject,
				finalPriceSnapshot,
			},
		})
	}

	return NextResponse.json({ ok: true })
}
