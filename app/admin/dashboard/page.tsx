import Link from 'next/link'
import { ListIcon, PackageIcon, ShoppingBagIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { CvetutImportPanel } from './cvetut-import-panel'
import { isDev } from '@/shared/lib/is-dev'

const CARDS = [
	{
		href: '/admin/dashboard/categories',
		label: 'Категории',
		icon: ListIcon,
		key: 'categories' as const,
	},
	{
		href: '/admin/dashboard/products',
		label: 'Товары',
		icon: PackageIcon,
		key: 'products' as const,
	},
	{
		href: '/admin/dashboard/orders',
		label: 'Заказы',
		icon: ShoppingBagIcon,
		key: 'orders' as const,
	},
]

export default async function DashboardPage() {
	const [categories, products, orders] = await Promise.all([
		prisma.category.count(),
		prisma.product.count(),
		prisma.order.count(),
	])
	const counts = { categories, products, orders }

	return (
		<div className='flex flex-col gap-6 max-w-3xl'>
			<header>
				<h1 className='font-heading text-3xl font-semibold'>Обзор</h1>
				<p className='text-muted-foreground mt-1'>Управляйте каталогом и заказами магазина</p>
			</header>
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				{CARDS.map((c) => {
					const Icon = c.icon
					return (
						<Link
							key={c.href}
							href={c.href}
							className='flex flex-col gap-2 rounded-2xl bg-card ring-1 ring-border p-5 hover:shadow-md transition-shadow'
						>
							<div className='flex items-center gap-2 text-muted-foreground'>
								<Icon className='size-4' />
								<span className='text-sm'>{c.label}</span>
							</div>
							<span className='text-3xl font-semibold'>{counts[c.key]}</span>
						</Link>
					)
				})}
			</div>
			{isDev() && <CvetutImportPanel />}
		</div>
	)
}
