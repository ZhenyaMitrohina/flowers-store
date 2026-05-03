import { memo, useState } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	fallback?: React.ReactNode
	containerClassName?: string
	skeletonClassName?: string
}

export const Image = memo(
	({ src, alt, className, containerClassName, skeletonClassName, fallback = '?', onError, ...props }: ImageProps) => {
		const [isLoading, setIsLoading] = useState(false)
		const [hasError, setHasError] = useState(false)

		const handleLoad = () => {
			setIsLoading(false)
		}

		const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			setIsLoading(false)
			setHasError(true)
			if (onError) {
				onError(e)
			}
		}

		return (
			<>
				{isLoading && <Skeleton className={cn('w-full h-full', className)} />}

				{!hasError ? (
					<img
						src={src}
						alt={alt}
						className={className}
						onLoad={handleLoad}
						onError={handleError}
						{...props}
					/>
				) : (
					<div
						role='img'
						className={cn(
							'flex items-center justify-center bg-background font-semibold font-montserrat text-muted-foreground text-sm rounded',
							className
						)}
					>
						{fallback}
					</div>
				)}
			</>
		)
	}
)
