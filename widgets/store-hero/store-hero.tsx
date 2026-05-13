import Image from 'next/image'
import { Container } from '@/shared/ui'
import backgroundImage from '@/public/background.webp'

export const StoreHero: React.FC = () => {
	return (
		<section className='relative h-[420px] md:h-[520px] overflow-hidden'>
			<Image
				src={backgroundImage}
				alt='Букеты Флории'
				fill
				priority
				className='object-cover object-center'
				sizes='100vw'
			/>
			<div className='absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/60' />
			<div className='relative h-full flex items-end'>
				<Container className='pb-10 md:pb-14 flex flex-col gap-4'>
					<h1 className='font-heading text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-md'>
						Цветы, которые говорят за вас
					</h1>
					<p className='text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed drop-shadow-sm'>
						Живые букеты с вниманием к деталям — для любого повода и любого человека.
					</p>
				</Container>
			</div>
		</section>
	)
}
