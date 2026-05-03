'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon } from 'lucide-react'
import NextImage from 'next/image'
import { cn } from '@/shared/lib/utils'

interface ProductImageSliderProps {
	images: string[]
	alt: string
	className?: string
	imageClassName?: string
	rounded?: string
	onClickImage?: () => void
}

export const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
	images,
	alt,
	className,
	imageClassName,
	rounded = 'rounded-2xl',
	onClickImage,
}) => {
	const [active, setActive] = useState(0)
	const total = images.length

	if (total === 0) {
		return (
			<div
				className={cn(
					'flex items-center justify-center bg-muted text-muted-foreground aspect-square',
					rounded,
					className,
				)}
			>
				<ImageOffIcon className='size-10' />
			</div>
		)
	}

	const safeIndex = Math.min(Math.max(active, 0), total - 1)

	const go = (offset: number) => {
		setActive((i) => (i + offset + total) % total)
	}

	return (
		<div className={cn('relative w-full aspect-square overflow-hidden bg-muted', rounded, className)}>
			{onClickImage ? (
				<button
					type='button'
					onClick={onClickImage}
					className='absolute inset-0 z-0 cursor-zoom-in'
					aria-label='Открыть товар'
				/>
			) : null}
			<NextImage
				src={images[safeIndex]}
				alt={alt}
				fill
				sizes='(max-width: 768px) 100vw, 25vw'
				className={cn('object-cover transition-opacity duration-200 pointer-events-none select-none', imageClassName)}
			/>
			{total > 1 && (
				<>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							go(-1)
						}}
						aria-label='Предыдущее фото'
						className='absolute z-10 left-2 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-full bg-background/80 text-foreground hover:bg-background shadow'
					>
						<ChevronLeftIcon className='size-4' />
					</button>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							go(1)
						}}
						aria-label='Следующее фото'
						className='absolute z-10 right-2 top-1/2 -translate-y-1/2 size-8 grid place-items-center rounded-full bg-background/80 text-foreground hover:bg-background shadow'
					>
						<ChevronRightIcon className='size-4' />
					</button>
					<div className='absolute z-10 inset-x-0 bottom-2 flex items-center justify-center gap-1.5'>
						{images.map((_, i) => (
							<button
								key={i}
								type='button'
								aria-label={`Фото ${i + 1}`}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									setActive(i)
								}}
								className={cn(
									'h-1.5 rounded-full bg-background/60 transition-all',
									i === safeIndex ? 'w-5 bg-background' : 'w-1.5 hover:bg-background/90',
								)}
							/>
						))}
					</div>
				</>
			)}
		</div>
	)
}
