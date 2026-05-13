import type { Metadata } from 'next'
import { Container } from '@/shared/ui'
import { StoreHero } from '@/widgets/store-hero'

export const metadata: Metadata = {
	title: 'О нас · Флория',
	description:
		'Флория — магазин живых цветов в Нижнем Новгороде. Свежие букеты, индивидуальный подбор и доставка по городу.',
}

export default function AboutPage() {
	return (
		<div className='flex flex-col flex-1'>
			<StoreHero />

			<Container className='py-12 md:py-16 flex flex-col gap-14'>
				<section className='flex flex-col gap-5 max-w-3xl'>
					<p className='text-lg text-muted-foreground leading-relaxed'>
						Флория — это не просто магазин. Это место, где каждый букет собирается с вниманием к
						деталям: свежесть срезки, сочетание форм и оттенков, правильная упаковка. Мы работаем с
						проверенными поставщиками, чтобы вы получали цветы, которые простоят как можно дольше и
						порадуют так, как вы задумали.
					</p>
					<p className='text-lg text-muted-foreground leading-relaxed'>
						Будь то нежные розы для важного момента, яркий микс для дня рождения или лаконичная
						монобукетница для интерьера — мы поможем найти то, что подойдёт именно для вашего повода и
						вашего человека.
					</p>
				</section>

				<section className='flex flex-col gap-8'>
					<h2 className='font-heading text-2xl md:text-3xl font-semibold'>Почему выбирают нас</h2>
					<ul className='grid sm:grid-cols-2 gap-5'>
						{ADVANTAGES.map(({ title, description }) => (
							<li
								key={title}
								className='flex flex-col gap-2 p-6 rounded-2xl border border-border/60 bg-muted/30'
							>
								<span className='font-heading text-lg font-semibold'>{title}</span>
								<span className='text-muted-foreground leading-relaxed'>{description}</span>
							</li>
						))}
					</ul>
				</section>

				<section className='flex flex-col gap-4 max-w-2xl'>
					<h2 className='font-heading text-2xl md:text-3xl font-semibold'>Наш магазин</h2>
					<p className='text-muted-foreground leading-relaxed'>
						Мы находимся в Нижнем Новгороде, в районе Щербинки. Заходите, чтобы выбрать букет лично —
						или оформите заказ онлайн, и мы доставим в удобное время.
					</p>
					<address className='not-italic flex flex-col gap-1 text-muted-foreground'>
						<span>г. Нижний Новгород, Щербинки 1, д. 19</span>
						<a href='tel:+79049243698' className='hover:text-primary transition-colors w-fit'>
							+7 (904) 924-36-98
						</a>
					</address>
				</section>
			</Container>
		</div>
	)
}

const ADVANTAGES = [
	{
		title: 'Свежие цветы каждый день',
		description:
			'Регулярные поставки позволяют нам держать ассортимент живым и разнообразным — вне зависимости от сезона.',
	},
	{
		title: 'Подбор под повод',
		description:
			'Не знаете, что выбрать? Расскажите нам о получателе и случае — мы предложим букет, который попадёт в точку.',
	},
	{
		title: 'Красивая упаковка в подарок',
		description:
			'Каждый заказ упаковывается так, чтобы его было приятно вручать прямо с порога — без дополнительной платы.',
	},
	{
		title: 'Доставка по Нижнему Новгороду',
		description:
			'Привезём букет в нужное место и время. Доставка доступна по всему городу — уточняйте зону и сроки при оформлении заказа.',
	},
] as const
