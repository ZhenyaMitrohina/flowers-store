import Link from 'next/link'
import { Container } from '@/shared/ui'
import { ProductSearch } from '@/features/product-search'
import { CartButton } from '@/entities/cart'

const Logo = () => {
	return (
		<Link href='/' className='font-heading text-3xl md:text-4xl font-bold text-primary'>
			Цветы
		</Link>
	)
}

export const Header: React.FC = () => {
	return (
		<header className='sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur'>
			<Container className='flex items-center justify-between gap-6 md:gap-10 py-4'>
				<Logo />
				<ProductSearch />
				<CartButton />
			</Container>
		</header>
	)
}
