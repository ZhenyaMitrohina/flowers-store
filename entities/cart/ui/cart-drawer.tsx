'use client'

import { useState } from 'react'
import { ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/shared/ui/drawer'
import { selectSubtotal, useCartStore } from '../model/cart-store'
import { CartLine } from './cart-line'
import { CheckoutForm } from './checkout-form'

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

export const CartDrawer: React.FC = () => {
	const open = useCartStore((s) => s.drawerOpen)
	const setOpen = useCartStore((s) => s.setDrawerOpen)
	const cart = useCartStore((s) => s.cart)
	const loading = useCartStore((s) => s.loading)
	const subtotal = useCartStore(selectSubtotal)
	const [step, setStep] = useState<'cart' | 'checkout'>('cart')

	const items = cart?.items ?? []
	const isEmpty = items.length === 0

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) setStep('cart')
	}

	return (
		<Drawer open={open} onOpenChange={handleOpenChange} direction='right'>
			<DrawerContent className='flex flex-col h-full'>
				<DrawerHeader className='shrink-0'>
					<DrawerTitle>{step === 'cart' ? 'Корзина' : 'Оформление заказа'}</DrawerTitle>
					<DrawerDescription>
						{step === 'cart'
							? items.length > 0
								? `Товаров: ${items.length}`
								: 'Здесь появятся выбранные букеты'
							: 'Заполните данные для доставки'}
					</DrawerDescription>
				</DrawerHeader>

				<div className='flex-1 min-h-0 overflow-y-auto px-4'>
					{step === 'cart' ? (
						isEmpty ? (
							<div className='h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-10'>
								<ShoppingBagIcon className='size-12' />
								<p>{loading ? 'Загружаем…' : 'Корзина пуста'}</p>
							</div>
						) : (
							<div className='flex flex-col gap-3 pb-4'>
								{items.map((item) => (
									<CartLine key={item.id} item={item} />
								))}
							</div>
						)
					) : (
						<div className='pb-4'>
							<CheckoutForm onCancel={() => setStep('cart')} />
						</div>
					)}
				</div>

				{step === 'cart' && !isEmpty && (
					<DrawerFooter className='shrink-0 border-t border-border/50'>
						<div className='flex items-baseline justify-between'>
							<span className='text-sm text-muted-foreground'>Подытог</span>
							<span className='text-xl font-semibold'>{fmt.format(subtotal)}</span>
						</div>
						<Button onClick={() => setStep('checkout')} className='w-full' size='lg'>
							Оформить заказ
						</Button>
					</DrawerFooter>
				)}
			</DrawerContent>
		</Drawer>
	)
}
