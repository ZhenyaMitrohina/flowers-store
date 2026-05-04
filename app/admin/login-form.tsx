'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import { login } from '@/entities/admin'

export const LoginForm: React.FC = () => {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		setError(null)
		try {
			await login(email, password)
			router.replace('/admin/dashboard')
			router.refresh()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка авторизации')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full max-w-sm bg-card rounded-3xl ring-1 ring-border p-6 flex flex-col gap-4'
		>
			<header className='flex flex-col gap-1'>
				<h1 className='font-heading text-2xl font-semibold'>Панель администратора</h1>
				<p className='text-sm text-muted-foreground'>Вход для управления магазином</p>
			</header>

			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Email</span>
				<Input
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete='email'
					required
				/>
			</label>

			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Пароль</span>
				<Input
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete='current-password'
					required
				/>
			</label>

			{error && (
				<p className='text-sm text-destructive' role='alert'>
					{error}
				</p>
			)}

			<Button type='submit' disabled={submitting}>
				{submitting && <Loader2Icon className='animate-spin' />}
				Войти
			</Button>
		</form>
	)
}
