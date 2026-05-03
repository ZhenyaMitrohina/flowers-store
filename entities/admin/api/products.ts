import type { DiscountType } from '@prisma/client'
import type { Product } from '@/entities/product'

export interface AdminProduct extends Product {
	price: string
	discountType: DiscountType
	discountValue: string
	categoryId: string
	createdAt: string
	updatedAt: string
}

export interface ProductInput {
	name: string
	description?: string
	price: string
	discountType: DiscountType
	discountValue: string
	imageUrls: string[]
	isActive: boolean
	categoryId: string
}

async function expectJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const json = (await res.json().catch(() => ({}))) as { error?: string }
		throw new Error(json.error ?? 'Ошибка запроса')
	}
	return (await res.json()) as T
}

export async function listProducts(): Promise<AdminProduct[]> {
	const res = await fetch('/api/admin/products', { cache: 'no-store' })
	const json = await expectJson<{ data: AdminProduct[] }>(res)
	return json.data
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
	const res = await fetch('/api/admin/products', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
	const json = await expectJson<{ data: AdminProduct }>(res)
	return json.data
}

export async function patchProduct(id: string, input: Partial<ProductInput>): Promise<AdminProduct> {
	const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
	const json = await expectJson<{ data: AdminProduct }>(res)
	return json.data
}

export async function deleteProduct(id: string): Promise<void> {
	const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
		method: 'DELETE',
	})
	await expectJson<{ ok: true }>(res)
}
