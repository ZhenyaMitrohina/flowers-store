import type { Product } from '../model/types'

interface ListResponse {
	data: Product[]
	meta: { page: number; limit: number; total: number; totalPages: number }
}

export async function searchProducts(q: string, limit = 8, signal?: AbortSignal): Promise<Product[]> {
	const params = new URLSearchParams()
	if (q) params.set('q', q)
	params.set('limit', String(limit))
	const res = await fetch(`/api/products?${params.toString()}`, { signal })
	if (!res.ok) throw new Error('Не удалось загрузить товары')
	const json = (await res.json()) as ListResponse
	return json.data
}

export async function fetchProductsByCategory(categorySlug: string, limit = 24): Promise<Product[]> {
	const params = new URLSearchParams({ categorySlug, limit: String(limit) })
	const res = await fetch(`/api/products?${params.toString()}`)
	if (!res.ok) throw new Error('Не удалось загрузить товары')
	const json = (await res.json()) as ListResponse
	return json.data
}

export async function fetchProduct(productId: string): Promise<Product> {
	const res = await fetch(`/api/products/${encodeURIComponent(productId)}`)
	if (!res.ok) throw new Error('Товар не найден')
	const json = (await res.json()) as { data: Product }
	return json.data
}
