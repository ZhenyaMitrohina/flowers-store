'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboardIcon, ListIcon, LogOutIcon, PackageIcon, ShoppingBagIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { logout } from '@/entities/admin'

const NAV = [
	{ href: '/admin/dashboard', label: 'Обзор', icon: LayoutDashboardIcon, exact: true },
	{ href: '/admin/dashboard/categories', label: 'Категории', icon: ListIcon, exact: false },
	{ href: '/admin/dashboard/products', label: 'Товары', icon: PackageIcon, exact: false },
	{ href: '/admin/dashboard/orders', label: 'Заказы', icon: ShoppingBagIcon, exact: false },
] as const

interface AdminSidebarProps {
	email: string
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ email }) => {
	const pathname = usePathname()
	const router = useRouter()

	const handleLogout = async () => {
		await logout()
		router.replace('/admin')
		router.refresh()
	}

	return (
		<aside className='shrink-0 w-60 bg-card border-r border-border/60 flex flex-col gap-4 p-4'>
			<Link href='/admin/dashboard' className='font-heading text-xl font-semibold text-primary px-2'>
				Флория
			</Link>
			<nav className='flex flex-col gap-1'>
				{NAV.map((item) => {
					const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
					const Icon = item.icon
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
								active
									? 'bg-primary/10 text-primary'
									: 'text-foreground hover:bg-muted',
							)}
						>
							<Icon className='size-4' />
							{item.label}
						</Link>
					)
				})}
			</nav>
			<div className='mt-auto flex flex-col gap-2 px-2'>
				<p className='text-xs text-muted-foreground truncate' title={email}>
					{email}
				</p>
				<Button variant='outline' size='sm' onClick={handleLogout}>
					<LogOutIcon className='size-4' />
					Выйти
				</Button>
			</div>
		</aside>
	)
}
