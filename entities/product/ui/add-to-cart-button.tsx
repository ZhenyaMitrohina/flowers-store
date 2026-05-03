'use client'

import { useState, useTransition } from 'react'
import { CheckIcon, Loader2Icon, ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useCartStore } from '@/entities/cart'
import { cn } from '@/shared/lib/utils'

interface AddToCartButtonProps {
	productId: string
	className?: string
	size?: 'default' | 'lg'
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, className, size = 'lg' }) => {
	const addItem = useCartStore((s) => s.addItem)
	const openDrawer = useCartStore((s) => s.openDrawer)
	const [pending, start] = useTransition()
	const [added, setAdded] = useState(false)

	const handleAdd = () => {
		start(async () => {
			try {
				await addItem(productId, 1)
				setAdded(true)
				openDrawer()
				setTimeout(() => setAdded(false), 1500)
			} catch (e) {
				console.error(e)
			}
		})
	}

	return (
		<Button
			type='button'
			onClick={handleAdd}
			disabled={pending}
			size={size}
			className={cn('gap-2', className)}
		>
			{pending ? (
				<Loader2Icon className='animate-spin' />
			) : added ? (
				<CheckIcon />
			) : (
				<ShoppingBagIcon />
			)}
			{added ? 'В корзине' : 'Добавить в корзину'}
		</Button>
	)
}
