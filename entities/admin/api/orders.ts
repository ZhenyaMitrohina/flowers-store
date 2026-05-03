import type { OrderStatus } from '@prisma/client'

export interface AdminOrderItem {
	id: string
	productId: string | null
	productName: string
	quantity: number
	unitPrice: string
	discountType: string
	discountValue: string
	lineTotal: string
}

export interface AdminOrderPayment {
	id: string
	provider: string
	providerPaymentId: string | null
	status: string
}

export interface AdminOrder {
	id: string
	status: OrderStatus
	customerName: string
	phone: string
	address: string
	comment: string
	deliveryAt: string
	subtotal: string
	discountTotal: string
	total: string
	createdAt: string
	updatedAt: string
	items: AdminOrderItem[]
	payments: AdminOrderPayment[]
}

interface ListResponse {
	data: AdminOrder[]
	meta: { page: number; limit: number; total: number; totalPages: number }
}

async function expectJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const json = (await res.json().catch(() => ({}))) as { error?: string }
		throw new Error(json.error ?? 'Ошибка запроса')
	}
	return (await res.json()) as T
}

export async function listOrders(params?: { page?: number; limit?: number; status?: OrderStatus }): Promise<ListResponse> {
	const sp = new URLSearchParams()
	if (params?.page) sp.set('page', String(params.page))
	if (params?.limit) sp.set('limit', String(params.limit))
	if (params?.status) sp.set('status', params.status)
	const url = sp.toString() ? `/api/admin/orders?${sp.toString()}` : '/api/admin/orders'
	const res = await fetch(url, { cache: 'no-store' })
	return expectJson<ListResponse>(res)
}

export async function patchOrder(id: string, input: { status?: OrderStatus }): Promise<AdminOrder> {
	const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
	const json = await expectJson<{ data: AdminOrder }>(res)
	return json.data
}
