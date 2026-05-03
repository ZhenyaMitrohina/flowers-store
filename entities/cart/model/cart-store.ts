'use client'

import { create } from 'zustand'
import * as api from '../api/cart'
import type { Cart } from './types'

interface CartState {
	cart: Cart | null
	loading: boolean
	error: string | null
	drawerOpen: boolean
	hydrated: boolean

	openDrawer: () => void
	closeDrawer: () => void
	setDrawerOpen: (v: boolean) => void

	hydrate: () => Promise<void>
	refresh: () => Promise<void>
	addItem: (productId: string, quantity?: number) => Promise<void>
	setQuantity: (productId: string, quantity: number) => Promise<void>
	removeItem: (productId: string) => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
	cart: null,
	loading: false,
	error: null,
	drawerOpen: false,
	hydrated: false,

	openDrawer: () => {
		set({ drawerOpen: true })
		void get().refresh()
	},
	closeDrawer: () => set({ drawerOpen: false }),
	setDrawerOpen: (v) => {
		set({ drawerOpen: v })
		if (v) void get().refresh()
	},

	hydrate: async () => {
		if (get().hydrated || get().loading) return
		set({ loading: true, error: null })
		try {
			const cart = await api.getCart()
			set({ cart, hydrated: true })
		} catch (e) {
			set({ error: e instanceof Error ? e.message : String(e) })
		} finally {
			set({ loading: false })
		}
	},

	refresh: async () => {
		set({ loading: true, error: null })
		try {
			const cart = await api.getCart()
			set({ cart, hydrated: true })
		} catch (e) {
			set({ error: e instanceof Error ? e.message : String(e) })
		} finally {
			set({ loading: false })
		}
	},

	addItem: async (productId, quantity = 1) => {
		await api.addItem(productId, quantity)
		await get().refresh()
	},
	setQuantity: async (productId, quantity) => {
		if (quantity <= 0) {
			await api.removeItem(productId)
		} else {
			await api.patchQuantity(productId, quantity)
		}
		await get().refresh()
	},
	removeItem: async (productId) => {
		await api.removeItem(productId)
		await get().refresh()
	},
}))

export function selectItemsCount(state: CartState): number {
	return state.cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
}

export function selectSubtotal(state: CartState): number {
	return (
		state.cart?.items.reduce((sum, i) => sum + Number(i.finalPriceSnapshot) * i.quantity, 0) ?? 0
	)
}
