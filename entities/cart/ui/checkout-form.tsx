'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import { createOrder } from '../api/cart'

interface CheckoutFormProps {
	onSuccess?: (orderId: string) => void
	onCancel: () => void
}

interface FieldError {
	field: 'customerName' | 'phone' | 'address' | 'deliveryAt' | null
	message: string
}

function defaultDelivery(): string {
	const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
	d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
	return d.toISOString().slice(0, 16)
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel }) => {
	const [customerName, setCustomerName] = useState('')
	const [phone, setPhone] = useState('')
	const [address, setAddress] = useState('')
	const [comment, setComment] = useState('')
	const [deliveryAt, setDeliveryAt] = useState(defaultDelivery())
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<FieldError | null>(null)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (customerName.trim().length === 0) {
			setError({ field: 'customerName', message: 'Укажите имя получателя' })
			return
		}
		if (phone.trim().length < 5) {
			setError({ field: 'phone', message: 'Укажите телефон' })
			return
		}
		if (address.trim().length === 0) {
			setError({ field: 'address', message: 'Укажите адрес' })
			return
		}
		if (!deliveryAt) {
			setError({ field: 'deliveryAt', message: 'Укажите дату доставки' })
			return
		}

		setSubmitting(true)
		try {
			const iso = new Date(deliveryAt).toISOString()
			const { orderId, paymentUrl } = await createOrder({
				customerName: customerName.trim(),
				phone: phone.trim(),
				address: address.trim(),
				comment,
				deliveryAt: iso,
			})
			onSuccess?.(orderId)
			window.location.href = paymentUrl
		} catch (e) {
			setError({ field: null, message: e instanceof Error ? e.message : 'Не удалось создать заказ' })
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form onSubmit={submit} className='flex flex-col gap-3'>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Получатель</span>
				<Input
					value={customerName}
					onChange={(e) => setCustomerName(e.target.value)}
					placeholder='Имя и фамилия'
					aria-invalid={error?.field === 'customerName'}
					autoComplete='name'
				/>
			</label>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Телефон</span>
				<Input
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder='+7 (___) ___-__-__'
					aria-invalid={error?.field === 'phone'}
					autoComplete='tel'
					type='tel'
				/>
			</label>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Адрес доставки</span>
				<Input
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder='Улица, дом, квартира'
					aria-invalid={error?.field === 'address'}
					autoComplete='street-address'
				/>
			</label>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Дата и время</span>
				<Input
					type='datetime-local'
					value={deliveryAt}
					onChange={(e) => setDeliveryAt(e.target.value)}
					aria-invalid={error?.field === 'deliveryAt'}
				/>
			</label>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Комментарий</span>
				<textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder='Пожелания к букету или доставке'
					rows={3}
					className='w-full rounded-3xl border border-input bg-input/30 px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm resize-none'
				/>
			</label>

			{error?.message && (
				<p className='text-sm text-destructive' role='alert'>
					{error.message}
				</p>
			)}

			<div className='flex gap-2 pt-2'>
				<Button type='button' variant='outline' onClick={onCancel} disabled={submitting} className='flex-1'>
					Назад
				</Button>
				<Button type='submit' disabled={submitting} className='flex-1'>
					{submitting && <Loader2Icon className='animate-spin' />}
					Оплатить
				</Button>
			</div>
		</form>
	)
}
