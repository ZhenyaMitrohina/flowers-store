import { nanoid } from 'nanoid'

const KEY = 'flowers-store:guest-token'

/**
 * Возвращает уникальный токен гостя из localStorage; создаёт при первом обращении.
 * Безопасно вызывать только в браузере.
 */
export function getGuestToken(): string {
	if (typeof window === 'undefined') {
		throw new Error('getGuestToken() доступен только в браузере')
	}
	let token = window.localStorage.getItem(KEY)
	if (!token) {
		token = nanoid(24)
		window.localStorage.setItem(KEY, token)
	}
	return token
}
