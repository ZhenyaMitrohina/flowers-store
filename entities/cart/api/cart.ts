import { getGuestToken } from '@/shared/lib/guest-token'
import type { Cart } from '../model/types'

function headers(): HeadersInit {
	return {
		'Content-Type': 'application/json',
		'X-Guest-Token': getGuestToken(),
	}
}

async function expectJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const body = (await res.json().catch(() => ({ error: 'Ошибка запроса' }))) as { error?: string }
		throw new Error(body.error ?? 'Ошибка запроса')
	}
	return (await res.json()) as T
}

export async function getCart(): Promise<Cart> {
	const res = await fetch('/api/cart', { headers: headers(), cache: 'no-store' })
	const json = await expectJson<{ data: Cart }>(res)
	return json.data
}

export async function addItem(productId: string, quantity = 1): Promise<void> {
	const res = await fetch('/api/cart/items', {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify({ productId, quantity }),
	})
	await expectJson<{ ok: true }>(res)
}

export async function patchQuantity(productId: string, quantity: number): Promise<void> {
	const res = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
		method: 'PATCH',
		headers: headers(),
		body: JSON.stringify({ quantity }),
	})
	await expectJson<{ ok: true }>(res)
}

export async function removeItem(productId: string): Promise<void> {
	const res = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
		method: 'DELETE',
		headers: headers(),
	})
	await expectJson<{ ok: true }>(res)
}

export interface CreateOrderInput {
	customerName: string
	phone: string
	address: string
	comment?: string
	deliveryAt: string
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string; paymentUrl: string }> {
	const res = await fetch('/api/orders', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			...input,
			comment: input.comment ?? '',
			guestToken: getGuestToken(),
		}),
	})
	const json = await expectJson<{ data: { id: string }; paymentUrl: string }>(res)
	return { orderId: json.data.id, paymentUrl: json.paymentUrl }
}
