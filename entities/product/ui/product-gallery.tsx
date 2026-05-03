'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { ImageOffIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ProductGalleryProps {
	images: string[]
	alt: string
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, alt }) => {
	const [active, setActive] = useState(0)
	const total = images.length

	if (total === 0) {
		return (
			<div className='flex flex-col gap-3'>
				<div className='aspect-square w-full rounded-3xl bg-muted grid place-items-center text-muted-foreground'>
					<ImageOffIcon className='size-12' />
				</div>
			</div>
		)
	}

	const safeIndex = Math.min(Math.max(active, 0), total - 1)

	return (
		<div className='flex flex-col gap-4'>
			<div className='relative aspect-square w-full overflow-hidden rounded-3xl bg-muted'>
				<NextImage
					src={images[safeIndex]}
					alt={alt}
					fill
					priority
					sizes='(max-width: 1024px) 100vw, 50vw'
					className='object-cover'
				/>
			</div>
			{total > 1 && (
				<div className='flex gap-2 overflow-x-auto pb-1'>
					{images.map((src, i) => (
						<button
							key={src + i}
							type='button'
							onClick={() => setActive(i)}
							aria-label={`Фото ${i + 1}`}
							className={cn(
								'relative shrink-0 size-20 overflow-hidden rounded-2xl border-2 transition-colors',
								i === safeIndex ? 'border-primary' : 'border-transparent hover:border-border',
							)}
						>
							<NextImage src={src} alt='' fill sizes='80px' className='object-cover' />
						</button>
					))}
				</div>
			)}
			{total > 1 && (
				<div className='flex items-center justify-center gap-1.5'>
					{images.map((_, i) => (
						<span
							key={i}
							className={cn(
								'h-1.5 rounded-full bg-muted transition-all',
								i === safeIndex ? 'w-6 bg-primary' : 'w-1.5',
							)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
