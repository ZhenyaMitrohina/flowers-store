'use client'

import { useTransition } from 'react'
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import NextImage from 'next/image'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { useCartStore } from '../model/cart-store'
import type { CartItem } from '../model/types'

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

interface CartLineProps {
	item: CartItem
}

export const CartLine: React.FC<CartLineProps> = ({ item }) => {
	const setQuantity = useCartStore((s) => s.setQuantity)
	const removeItem = useCartStore((s) => s.removeItem)
	const [pending, startTransition] = useTransition()

	const product = item.product
	const productId = product?.id

	const lineTotal = Number(item.finalPriceSnapshot) * item.quantity

	const change = (delta: number) => {
		if (!productId) return
		startTransition(async () => {
			await setQuantity(productId, item.quantity + delta)
		})
	}

	const remove = () => {
		if (!productId) return
		startTransition(async () => {
			await removeItem(productId)
		})
	}

	return (
		<article
			className={cn(
				'relative grid grid-cols-[88px_1fr] gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/60',
				pending && 'opacity-70',
			)}
		>
			<div className='relative aspect-square w-22 overflow-hidden rounded-xl bg-muted'>
				{product?.imageUrls[0] ? (
					<NextImage
						src={product.imageUrls[0]}
						alt={product.name}
						fill
						sizes='88px'
						className='object-cover'
					/>
				) : null}
			</div>

			<div className='flex flex-col min-w-0'>
				<header className='flex items-start justify-between gap-2'>
					<h3 className='font-medium leading-tight truncate' title={product?.name ?? ''}>
						{product?.name ?? 'Товар недоступен'}
					</h3>
					<button
						type='button'
						onClick={remove}
						disabled={pending || !productId}
						aria-label='Удалить из корзины'
						className='shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
					>
						<XIcon className='size-4' />
					</button>
				</header>
				{product?.description && (
					<p className='text-xs text-muted-foreground line-clamp-2 mt-0.5'>
						{product.description}
					</p>
				)}

				<div className='mt-auto pt-2 flex items-end justify-between gap-3'>
					<div className='inline-flex items-center rounded-full ring-1 ring-border'>
						<button
							type='button'
							onClick={() => change(-1)}
							disabled={pending || !productId}
							aria-label='Уменьшить количество'
							className='size-7 grid place-items-center rounded-l-full hover:bg-muted disabled:opacity-50'
						>
							<MinusIcon className='size-3.5' />
						</button>
						<span className='min-w-7 text-center text-sm tabular-nums'>{item.quantity}</span>
						<button
							type='button'
							onClick={() => change(1)}
							disabled={pending || !productId}
							aria-label='Увеличить количество'
							className='size-7 grid place-items-center rounded-r-full hover:bg-muted disabled:opacity-50'
						>
							<PlusIcon className='size-3.5' />
						</button>
					</div>
					<span className='text-base font-semibold whitespace-nowrap'>
						{fmt.format(lineTotal)}
					</span>
				</div>
			</div>
		</article>
	)
}

export { Button as CartActionButton }
