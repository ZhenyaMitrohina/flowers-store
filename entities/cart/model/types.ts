import type { Product } from '@/entities/product'

export interface CartItem {
	id: string
	quantity: number
	unitPriceSnapshot: string
	finalPriceSnapshot: string
	product: Product | null
}

export interface Cart {
	id: string
	guestToken: string
	items: CartItem[]
}
