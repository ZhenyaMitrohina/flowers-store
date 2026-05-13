import Link from 'next/link'
import { Container, Logo } from '@/shared/ui'
import { ProductSearch } from '@/features/product-search'
import { CartButton } from '@/entities/cart'

export const Header: React.FC = () => {
	return (
		<header className='sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur'>
			<Container className='flex items-center justify-between gap-6 md:gap-10 py-4'>
				<div className='flex items-center gap-6'>
					<Logo />
					<Link
						href='/about'
						className='hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors'
					>
						О нас
					</Link>
				</div>
				<ProductSearch />
				<CartButton />
			</Container>
		</header>
	)
}
