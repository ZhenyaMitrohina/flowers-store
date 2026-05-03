import { NextResponse } from 'next/server'
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { orderCreateSchema } from '@/shared/lib/validation/order'
import { toOrderAdmin } from '@/shared/lib/serializers/order'
import { priceBreakdown } from '@/shared/lib/pricing'
import { createPayment } from '@/shared/api/yookassa'
import { isAxiosError } from 'axios'

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({}))
	const parsed = orderCreateSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const d = parsed.data
	const deliveryAt = new Date(d.deliveryAt)

	const order = await prisma.$transaction(async (tx) => {
		const cart = await tx.cart.findUnique({
			where: { guestToken: d.guestToken },
			include: { items: { include: { product: true } } },
		})
		if (!cart || cart.items.length === 0) {
			return null
		}

		let subtotal = new Prisma.Decimal(0)
		let total = new Prisma.Decimal(0)

		const lineData: {
			productId: string
			name: string
			q: number
			unit: Prisma.Decimal
			dType: string
			dVal: Prisma.Decimal
			line: Prisma.Decimal
		}[] = []

		for (const ci of cart.items) {
			const p = ci.product
			if (!p || !p.isActive) continue
			const pb = priceBreakdown(p)
			const unitFinal = new Prisma.Decimal(pb.priceFinal)
			const line = unitFinal.mul(ci.quantity)
			const origLine = p.price.mul(ci.quantity)
			subtotal = subtotal.add(origLine)
			total = total.add(line)
			lineData.push({
				name: p.name,
				productId: p.id,
				q: ci.quantity,
				unit: p.price,
				dType: p.discountType,
				dVal: p.discountValue,
				line,
			})
		}

		if (lineData.length === 0) {
			return null
		}

		const discountTotal = subtotal.sub(total)
		const created = await tx.order.create({
			data: {
				status: OrderStatus.PROCESSING,
				customerName: d.customerName,
				phone: d.phone,
				address: d.address,
				comment: d.comment,
				deliveryAt,
				subtotal,
				discountTotal,
				total,
				items: {
					create: lineData.map((l) => ({
						productId: l.productId,
						productNameSnapshot: l.name,
						quantity: l.q,
						unitPrice: l.unit,
						discountType: l.dType,
						discountValue: l.dVal,
						lineTotal: l.line,
					})),
				},
				payments: {
					create: {
						provider: 'yookassa',
						status: PaymentStatus.PENDING,
					},
				},
			},
			include: { items: { include: { product: true } }, payments: true },
		})

		await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
		return created
	})

	if (!order) {
		return NextResponse.json({ error: 'Корзина пуста или недоступна' }, { status: 400 })
	}

	const paymentRow = order.payments[0]
	if (!paymentRow) {
		return NextResponse.json({ error: 'Платёж не создан' }, { status: 500 })
	}

	const amount = order.total.toFixed(2)

	try {
		const yk = await createPayment({
			description: `Заказ ${order.id.slice(0, 8)}…`,
			orderId: order.id,
			amount,
			idempotenceKey: `order-pay-${paymentRow.id}`,
		})

		await prisma.payment.update({
			where: { id: paymentRow.id },
			data: { providerPaymentId: yk.id },
		})

		const fresh = await prisma.order.findUnique({
			where: { id: order.id },
			include: { items: { include: { product: true } }, payments: true },
		})
		if (!fresh) {
			return NextResponse.json({ error: 'Заказ не найден' }, { status: 500 })
		}

		return NextResponse.json(
			{
				data: toOrderAdmin(fresh),
				paymentUrl: yk.confirmation.confirmation_url,
			},
			{ status: 201 },
		)
	} catch (e) {
		const detail = isAxiosError(e)
			? (e.response?.data as { description?: string } | undefined)
			: undefined
		return NextResponse.json(
			{
				error: 'Не удалось создать оплату',
				...(process.env.NODE_ENV === 'development' && detail ? { details: detail } : {}),
			},
			{ status: 502 },
		)
	}
}
