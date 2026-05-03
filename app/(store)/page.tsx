import { Container } from '@/shared/ui'
import { CatalogSections } from '@/widgets/catalog-sections'
import { SubHeader } from '@/widgets/sub-header'
import { loadCatalog } from '@/entities/product/api/catalog.server'
import { loadCategories } from '@/entities/category/api/categories.server'

type SearchParams = Promise<{ category?: string }>

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
	const { category } = await searchParams
	const [sections, categories] = await Promise.all([loadCatalog(), loadCategories()])

	return (
		<div className='flex flex-col flex-1'>
			<SubHeader categories={categories} />
			<Container className='flex-1 py-10'>
				<CatalogSections sections={sections} activeSlug={category} />
			</Container>
		</div>
	)
}
