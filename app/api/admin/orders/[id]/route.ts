import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookieStore, adminUnauthorized } from '@/app/api/auth/admin'
import { orderAdminPatchSchema } from '@/shared/lib/validation/order'
import { toOrderAdmin } from '@/shared/lib/serializers/order'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, ctx: Ctx) {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const { id } = await ctx.params
	const row = await prisma.order.findUnique({
		where: { id },
		include: { items: { include: { product: true } }, payments: true },
	})
	if (!row) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
	return NextResponse.json({ data: toOrderAdmin(row) })
}

export async function PATCH(request: Request, ctx: Ctx) {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()
	const { id } = await ctx.params
	const parsed = orderAdminPatchSchema.safeParse(await request.json().catch(() => ({})))
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}
	const d = parsed.data
	if (Object.keys(d).length === 0) {
		return NextResponse.json({ error: 'Пусто' }, { status: 400 })
	}
	const data: Prisma.OrderUpdateInput = {}
	if (d.status !== undefined) data.status = d.status
	if (d.customerName !== undefined) data.customerName = d.customerName
	if (d.phone !== undefined) data.phone = d.phone
	if (d.address !== undefined) data.address = d.address
	if (d.comment !== undefined) data.comment = d.comment
	if (d.deliveryAt !== undefined) data.deliveryAt = new Date(d.deliveryAt)
	try {
		const row = await prisma.order.update({
			where: { id },
			data,
			include: { items: { include: { product: true } }, payments: true },
		})
		return NextResponse.json({ data: toOrderAdmin(row) })
	} catch {
		return NextResponse.json({ error: 'Не удалось обновить' }, { status: 400 })
	}
}
