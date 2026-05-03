import type { Product } from '../model/types'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

function format(value: string): string {
	return fmt.format(Number(value))
}

interface ProductPriceProps {
	priceOriginal: string
	priceFinal: string
	discount: Product['discount']
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
	priceOriginal,
	priceFinal,
	discount,
	size = 'md',
	className,
}) => {
	const hasDiscount = discount.type !== 'NONE' && Number(discount.value) > 0 && priceFinal !== priceOriginal
	const badgeText =
		discount.type === 'PERCENT'
			? `−${Math.round(Number(discount.value))}%`
			: discount.type === 'FIXED'
				? `−${format(discount.value)}`
				: null

	const finalSize = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-2xl',
	}[size]

	return (
		<div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
			<span className={cn('font-semibold text-foreground', finalSize)}>
				{format(priceFinal)}
			</span>
			{hasDiscount && (
				<>
					<span className='text-sm text-muted-foreground line-through'>
						{format(priceOriginal)}
					</span>
					{badgeText && (
						<Badge variant='destructive' className='font-semibold'>
							{badgeText}
						</Badge>
					)}
				</>
			)}
		</div>
	)
}
