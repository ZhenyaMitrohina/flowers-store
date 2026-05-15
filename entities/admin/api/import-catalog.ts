export type CvetutImportSkipped = { name: string; categorySlug: string; reason: string }

export type CvetutImportResponse = {
	categoriesUpserted: number
	productsCreated: number
	productsUpdated: number
	skippedProducts: CvetutImportSkipped[]
}

export async function importCvetutCatalogJson(body: unknown): Promise<CvetutImportResponse> {
	const res = await fetch('/api/admin/import', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	const json = (await res.json().catch(() => ({}))) as {
		data?: CvetutImportResponse
		error?: string
		details?: unknown
	}
	if (!res.ok) {
		const msg = json.error ?? 'Ошибка импорта'
		const details = json.details as
			| { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> }
			| undefined
		const fieldLine = details?.fieldErrors
			? Object.values(details.fieldErrors)
					.flat()
					.find((s): s is string => typeof s === 'string' && s.length > 0)
			: undefined
		const formLine = details?.formErrors?.[0]
		const hint = fieldLine ?? formLine
		throw new Error(hint ? `${msg}: ${hint}` : msg)
	}
	if (!json.data) throw new Error('Пустой ответ сервера')
	return json.data
}
