import type { ReactNode } from 'react'
import { Header } from '@/widgets/header'
import { CartDrawer } from '@/entities/cart'

export default function StoreLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex flex-col flex-1 min-h-full'>
			<Header />
			<main className='flex flex-col flex-1'>{children}</main>
			<CartDrawer />
		</div>
	)
}
