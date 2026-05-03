import { redirect } from 'next/navigation'
import { getAdminFromCookieStore } from '@/app/api/auth/admin'
import { LoginForm } from './login-form'

export default async function AdminLoginPage() {
	const admin = await getAdminFromCookieStore()
	if (admin) redirect('/admin/dashboard')

	return (
		<div className='flex-1 grid place-items-center px-4 py-10'>
			<LoginForm />
		</div>
	)
}
