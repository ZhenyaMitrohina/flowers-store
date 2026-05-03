export interface AdminUser {
	id: string
	email: string
}

export async function login(email: string, password: string): Promise<AdminUser> {
	const res = await fetch('/api/admin/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	})
	if (!res.ok) {
		const json = (await res.json().catch(() => ({}))) as { error?: string }
		throw new Error(json.error ?? 'Неверный email или пароль')
	}
	const json = (await res.json()) as { data: AdminUser }
	return json.data
}

export async function logout(): Promise<void> {
	await fetch('/api/admin/auth/logout', { method: 'POST' })
}
