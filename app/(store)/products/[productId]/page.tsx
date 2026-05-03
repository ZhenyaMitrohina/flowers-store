import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronLeftIcon } from 'lucide-react'
import { Container } from '@/shared/ui'
import {
	AddToCartButton,
	ProductCard,
	ProductGallery,
	ProductPrice,
} from '@/entities/product'
import { loadProductForPage, loadRecommended } from '@/entities/product/api/catalog.server'

type Params = Promise<{ productId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { productId } = await params
	const product = await loadProductForPage(productId)
	if (!product) return { title: 'Товар не найден' }
	return {
		title: `${product.name} · Магазин цветов`,
		description: product.description.slice(0, 160) || product.name,
	}
}

export default async function ProductPage({ params }: { params: Params }) {
	const { productId } = await params
	const product = await loadProductForPage(productId)
	if (!product) notFound()

	const recommended = await loadRecommended(product.category.id, product.id, 8)

	return (
		<Container className='py-8 md:py-12 flex flex-col gap-12'>
			<Link
				href={`/?category=${encodeURIComponent(product.category.slug)}`}
				className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit'
				scroll={false}
			>
				<ChevronLeftIcon className='size-4' />
				Назад в каталог
			</Link>

			<div className='grid lg:grid-cols-2 gap-10'>
				<ProductGallery images={product.imageUrls} alt={product.name} />

				<div className='flex flex-col gap-5'>
					<div className='flex flex-col gap-2'>
						<Link
							href={`/?category=${encodeURIComponent(product.category.slug)}`}
							className='text-sm text-muted-foreground hover:text-primary w-fit'
							scroll={false}
						>
							{product.category.name}
						</Link>
						<h1 className='font-heading text-3xl md:text-4xl font-bold'>{product.name}</h1>
					</div>

					{product.description && (
						<p className='text-muted-foreground whitespace-pre-line leading-relaxed'>
							{product.description}
						</p>
					)}

					<ProductPrice
						priceOriginal={product.priceOriginal}
						priceFinal={product.priceFinal}
						discount={product.discount}
						size='lg'
					/>

					<AddToCartButton productId={product.id} className='w-full md:w-auto md:min-w-72 mt-2' />
				</div>
			</div>

			{recommended.length > 0 && (
				<section className='flex flex-col gap-5 pt-6 border-t border-border/50'>
					<h2 className='font-heading text-2xl md:text-3xl font-semibold'>Рекомендуем</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
						{recommended.map((p) => (
							<ProductCard key={p.id} product={p} />
						))}
					</div>
				</section>
			)}
		</Container>
	)
}
