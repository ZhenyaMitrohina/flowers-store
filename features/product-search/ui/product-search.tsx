'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { searchProducts, type Product } from '@/entities/product'

const DEBOUNCE_MS = 200
const MIN_QUERY = 1

export const ProductSearch: React.FC = () => {
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<Product[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const trimmed = query.trim()
		if (trimmed.length < MIN_QUERY) {
			setResults([])
			setLoading(false)
			return
		}
		const ac = new AbortController()
		setLoading(true)
		const t = setTimeout(async () => {
			try {
				const items = await searchProducts(trimmed, 8, ac.signal)
				setResults(items)
			} catch (e) {
				if ((e as Error).name !== 'AbortError') console.error(e)
			} finally {
				setLoading(false)
			}
		}, DEBOUNCE_MS)
		return () => {
			clearTimeout(t)
			ac.abort()
		}
	}, [query])

	useEffect(() => {
		const onClickAway = (e: MouseEvent) => {
			if (!containerRef.current) return
			if (!containerRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', onClickAway)
		return () => document.removeEventListener('mousedown', onClickAway)
	}, [])

	const showDropdown = open && query.trim().length >= MIN_QUERY

	const navigateTo = (id: string) => {
		setOpen(false)
		setQuery('')
		router.push(`/products/${id}`)
	}

	return (
		<div ref={containerRef} className='relative flex-1 max-w-xl'>
			<div className='flex h-10 rounded-full bg-input/30 ring-1 ring-border/60 transition-shadow focus-within:ring-2 focus-within:ring-primary'>
				<SearchIcon className='size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
				<input
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						setOpen(true)
					}}
					onFocus={() => setOpen(true)}
					placeholder='Найти букет, цветы, растения…'
					className='w-full bg-transparent pl-10 pr-9 outline-none placeholder:text-muted-foreground'
					aria-label='Поиск товаров'
					aria-expanded={showDropdown}
					aria-controls='product-search-listbox'
				/>
				{query && (
					<button
						type='button'
						onClick={() => {
							setQuery('')
							setResults([])
						}}
						aria-label='Очистить'
						className='absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full hover:bg-muted text-muted-foreground'
					>
						<XIcon className='size-4' />
					</button>
				)}
			</div>

			{showDropdown && (
				<div
					id='product-search-listbox'
					role='listbox'
					className='absolute z-50 left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5'
				>
					{loading && results.length === 0 ? (
						<div className='flex items-center gap-2 p-4 text-sm text-muted-foreground'>
							<Loader2Icon className='size-4 animate-spin' />
							Ищем…
						</div>
					) : results.length === 0 ? (
						<div className='p-4 text-sm text-muted-foreground'>Ничего не найдено</div>
					) : (
						<ul className='p-1'>
							{results.map((p) => (
								<li key={p.id}>
									<Link
										href={`/products/${p.id}`}
										onClick={() => navigateTo(p.id)}
										role='option'
										className={cn(
											'flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors',
										)}
									>
										<div className='relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted'>
											{p.imageUrls[0] && (
												<NextImage
													src={p.imageUrls[0]}
													alt={p.name}
													fill
													sizes='48px'
													className='object-cover'
												/>
											)}
										</div>
										<span className='text-sm font-medium line-clamp-2'>{p.name}</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	)
}
