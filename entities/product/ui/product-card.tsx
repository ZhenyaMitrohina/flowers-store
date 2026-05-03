'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { PlusIcon, CheckIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { useCartStore } from '@/entities/cart'
import { ProductImageSlider } from './product-image-slider'
import { ProductPrice } from './product-price'
import type { Product } from '../model/types'

interface ProductCardProps {
	product: Product
	className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
	const router = useRouter()
	const addItem = useCartStore((s) => s.addItem)
	const [pending, startTransition] = useTransition()
	const [added, setAdded] = useState(false)

	const handleAdd = () => {
		startTransition(async () => {
			try {
				await addItem(product.id, 1)
				setAdded(true)
				setTimeout(() => setAdded(false), 1200)
			} catch (e) {
				console.error(e)
			}
		})
	}

	const goToProduct = () => router.push(`/products/${product.id}`)

	return (
		<div
			className={cn(
				'group flex flex-col gap-3 rounded-3xl bg-card p-3 ring-1 ring-border/60 transition-shadow hover:shadow-lg',
				className,
			)}
		>
			<ProductImageSlider
				images={product.imageUrls}
				alt={product.name}
				onClickImage={goToProduct}
			/>
			<div className='flex flex-col gap-1 px-1'>
				<Link
					href={`/products/${product.id}`}
					className='font-medium text-foreground hover:text-primary transition-colors line-clamp-2 min-h-11'
				>
					{product.name}
				</Link>
				<ProductPrice
					priceOriginal={product.priceOriginal}
					priceFinal={product.priceFinal}
					discount={product.discount}
					size='md'
				/>
			</div>
			<Button
				type='button'
				onClick={handleAdd}
				disabled={pending}
				variant={added ? 'secondary' : 'default'}
				className='w-full'
			>
				{pending ? (
					<Loader2Icon className='animate-spin' />
				) : added ? (
					<CheckIcon />
				) : (
					<PlusIcon />
				)}
				{added ? 'Добавлено' : 'Добавить'}
			</Button>
		</div>
	)
}
