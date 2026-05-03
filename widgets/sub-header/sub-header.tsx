'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import type { Category } from '@/entities/category'

interface SubHeaderProps {
	categories: Category[]
}

export const SubHeader: React.FC<SubHeaderProps> = ({ categories }) => {
	const searchParams = useSearchParams()
	const active = searchParams.get('category') ?? null

	const linkFor = (slug: string | null) => {
		if (!slug) return '/'
		const sp = new URLSearchParams()
		sp.set('category', slug)
		return `/?${sp.toString()}`
	}

	const itemClass = (isActive: boolean) =>
		cn(
			'shrink-0 rounded-full px-4 h-9 inline-flex items-center text-sm font-medium ring-1 transition-colors',
			isActive
				? 'bg-primary text-primary-foreground ring-primary'
				: 'bg-card text-foreground ring-border/60 hover:bg-muted',
		)

	return (
		<nav aria-label='Категории' className='border-b border-border/50 bg-background/60 sticky top-[73px] z-30'>
			<Container className='flex items-center gap-2 overflow-x-auto py-3'>
				<Link href={linkFor(null)} className={itemClass(active === null)} scroll={false}>
					Все
				</Link>
				{categories.map((c) => (
					<Link
						key={c.id}
						href={linkFor(c.slug)}
						className={itemClass(active === c.slug)}
						scroll={false}
					>
						{c.name}
					</Link>
				))}
			</Container>
		</nav>
	)
}
