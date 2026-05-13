import type { ReactNode } from 'react'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { CartDrawer } from '@/entities/cart'

export default function StoreLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex flex-col flex-1 min-h-screen'>
			<Header />
			<main className='flex flex-col flex-1'>{children}</main>
			<Footer />
			<CartDrawer />
		</div>
	)
}
