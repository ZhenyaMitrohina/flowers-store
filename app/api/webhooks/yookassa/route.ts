import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, OrderStatus } from '@prisma/client'

// убрать потом, потому что на клиенте реализация
/**
 * Плейсхолдер вебхука ЮKassa. Подключите проверку подписи и обновление `Payment` / `Order`.
 */
export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as {
		object?: { id?: string; status?: string; metadata?: { orderId?: string } }
	}
	const id = body.object?.id
	const st = body.object?.status
	if (id) {
		const pay = await prisma.payment.findFirst({ where: { providerPaymentId: id } })
		if (pay) {
			const map: Record<string, PaymentStatus> = {
				pending: 'PENDING',
				waiting_for_capture: 'WAITING_FOR_CAPTURE',
				succeeded: 'SUCCEEDED',
				canceled: 'CANCELED',
			}
			const next = st ? map[st] : undefined
			if (next) {
				await prisma.payment.update({
					where: { id: pay.id },
					data: { status: next, payloadJson: body as object },
				})
				if (next === 'SUCCEEDED') {
					await prisma.order.update({
						where: { id: pay.orderId },
						data: { status: OrderStatus.SUCCESS },
					})
				}
			}
		}
	}
	return NextResponse.json({ ok: true })
}
