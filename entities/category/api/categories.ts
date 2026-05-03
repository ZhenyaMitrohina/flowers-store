import type { Category } from '../model/types'

export async function fetchCategories(): Promise<Category[]> {
	const res = await fetch('/api/categories')
	if (!res.ok) throw new Error('Не удалось загрузить категории')
	const json = (await res.json()) as { data: Category[] }
	return json.data
}
