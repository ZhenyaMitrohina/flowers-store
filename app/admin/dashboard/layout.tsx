import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminFromCookieStore } from '@/app/api/auth/admin'
import { AdminSidebar } from './sidebar'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
	const admin = await getAdminFromCookieStore()
	if (!admin) redirect('/admin')

	return (
		<div className='flex flex-1 min-h-full'>
			<AdminSidebar email={admin.email} />
			<main className='flex-1 min-w-0 p-6 md:p-10'>{children}</main>
		</div>
	)
}
