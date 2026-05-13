import Link from 'next/link'
import { Flower, MapPin, Phone } from 'lucide-react'
import { Container } from '@/shared/ui'

export const Footer: React.FC = () => {
	return (
		<footer className='border-t border-border/50 bg-muted/20 mt-auto'>
			<Container className='py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6'>
				<div className='flex items-center gap-2 text-primary'>
					<Flower className='w-5 h-5 shrink-0' />
					<span className='font-heading text-lg font-bold'>Флория</span>
				</div>

				<nav className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-muted-foreground'>
					<Link href='/about' className='hover:text-foreground transition-colors'>
						О нас
					</Link>

					<a
						href='tel:+79049243698'
						className='flex items-center gap-1.5 hover:text-foreground transition-colors'
					>
						<Phone className='w-3.5 h-3.5 shrink-0' />
						+7 (904) 924-36-98
					</a>

					<address className='not-italic flex items-center gap-1.5'>
						<MapPin className='w-3.5 h-3.5 shrink-0' />
						г. Нижний Новгород, Щербинки 1, д. 19
					</address>
				</nav>
			</Container>
		</footer>
	)
}
