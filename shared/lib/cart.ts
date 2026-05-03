import { Prisma, type PrismaClient, type Product } from '@prisma/client'
import { priceBreakdown } from '@/shared/lib/pricing'

const CART_DAYS = 30

function expiry(): Date {
	return new Date(Date.now() + CART_DAYS * 24 * 60 * 60 * 1000)
}

export async function getOrCreateCart(db: PrismaClient, guestToken: string) {
	const existing = await db.cart.findUnique({ where: { guestToken } })
	if (existing) {
		if (existing.expiresAt < new Date()) {
			await db.cartItem.deleteMany({ where: { cartId: existing.id } })
		}
		return db.cart.update({
			where: { guestToken },
			data: { expiresAt: expiry() },
		})
	}
	return db.cart.create({ data: { guestToken, expiresAt: expiry() } })
}

export function snapshotFromProduct(product: Product) {
	const pb = priceBreakdown(product)
	return {
		unitPriceSnapshot: product.price,
		discountSnapshot: {
			type: product.discountType,
			value: product.discountValue.toString(),
		} as Prisma.JsonObject,
		finalPriceSnapshot: new Prisma.Decimal(pb.priceFinal),
	}
}
