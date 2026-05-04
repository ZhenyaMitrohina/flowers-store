import type { ReactNode } from 'react'

export const metadata = {
	title: 'Панель администратора · Флория',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
	return <div className='flex flex-col min-h-screen bg-muted/30'>{children}</div>
}
