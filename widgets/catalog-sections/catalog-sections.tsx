import Link from 'next/link'
import { ProductCard } from '@/entities/product'
import type { CatalogSection } from '@/entities/product/api/catalog.server'

interface CatalogSectionsProps {
	sections: CatalogSection[]
	activeSlug?: string
}

export const CatalogSections: React.FC<CatalogSectionsProps> = ({ sections, activeSlug }) => {
	const visible = activeSlug ? sections.filter((s) => s.slug === activeSlug) : sections

	if (visible.length === 0) {
		return (
			<div className='py-20 flex flex-col items-center gap-3 text-center text-muted-foreground'>
				<p className='text-lg'>В этой категории пока нет товаров</p>
				<Link href='/' className='text-primary hover:underline'>
					Показать все
				</Link>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-12'>
			{visible.map((section) => (
				<section key={section.id} className='flex flex-col gap-5'>
					<header className='flex items-baseline justify-between gap-3'>
						<h2 className='font-heading text-2xl md:text-3xl font-semibold'>{section.name}</h2>
						{!activeSlug && (
							<Link
								href={`/?category=${encodeURIComponent(section.slug)}`}
								className='text-sm text-muted-foreground hover:text-primary'
								scroll={false}
							>
								Смотреть все
							</Link>
						)}
					</header>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
						{section.products.map((p) => (
							<ProductCard key={p.id} product={p} />
						))}
					</div>
				</section>
			))}
		</div>
	)
}
