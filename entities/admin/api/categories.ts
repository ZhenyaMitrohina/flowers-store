import type { Category } from '@/entities/category'

export interface AdminCategory extends Category {
	createdAt?: string
}

interface CategoryInput {
	name: string
	slug?: string
	sortOrder: number
}

async function expectJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const json = (await res.json().catch(() => ({}))) as { error?: string }
		throw new Error(json.error ?? 'Ошибка запроса')
	}
	return (await res.json()) as T
}

export async function listCategories(): Promise<AdminCategory[]> {
	const res = await fetch('/api/admin/categories', { cache: 'no-store' })
	const json = await expectJson<{ data: AdminCategory[] }>(res)
	return json.data
}

export async function createCategory(input: CategoryInput): Promise<AdminCategory> {
	const res = await fetch('/api/admin/categories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
	const json = await expectJson<{ data: AdminCategory }>(res)
	return json.data
}

export async function patchCategory(id: string, input: Partial<CategoryInput>): Promise<AdminCategory> {
	const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	})
	const json = await expectJson<{ data: AdminCategory }>(res)
	return json.data
}

export async function deleteCategory(id: string): Promise<void> {
	const res = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
		method: 'DELETE',
	})
	await expectJson<{ ok: true }>(res)
}
