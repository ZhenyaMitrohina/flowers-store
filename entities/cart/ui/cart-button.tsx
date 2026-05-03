'use client'

import { useEffect } from 'react'
import { ShoppingCartIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { selectItemsCount, useCartStore } from '../model/cart-store'

export const CartButton: React.FC = () => {
	const openDrawer = useCartStore((s) => s.openDrawer)
	const hydrate = useCartStore((s) => s.hydrate)
	const itemsCount = useCartStore(selectItemsCount)

	useEffect(() => {
		void hydrate()
	}, [hydrate])

	return (
		<Button
			type='button'
			variant='ghost'
			size='icon-lg'
			onClick={openDrawer}
			aria-label='Открыть корзину'
			className='relative'
		>
			<ShoppingCartIcon className='size-5' />
			{itemsCount > 0 && (
				<span className='absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
					{itemsCount}
				</span>
			)}
		</Button>
	)
}
