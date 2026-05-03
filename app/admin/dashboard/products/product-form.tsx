'use client'

import NextImage from 'next/image'
import { useState, useTransition } from 'react'
import { Loader2Icon, XIcon } from 'lucide-react'
import { DiscountType } from '@prisma/client'
import { Button, Input } from '@/shared/ui'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui/select'
import { UploadButton } from '@/shared/lib/utils'
import {
	createProduct,
	patchProduct,
	type AdminProduct,
	type ProductInput,
} from '@/entities/admin/api/products'
import type { AdminCategory } from '@/entities/admin/api/categories'

interface ProductFormProps {
	editing: AdminProduct | null
	categories: AdminCategory[]
	onCancel: () => void
	onSaved: () => void
}

type FormState = {
	name: string
	description: string
	price: string
	discountType: DiscountType
	discountValue: string
	imageUrls: string[]
	isActive: boolean
	categoryId: string
}

function fromProduct(p: AdminProduct, fallbackCategoryId: string): FormState {
	return {
		name: p.name,
		description: p.description,
		price: p.price,
		discountType: p.discountType,
		discountValue: p.discountValue,
		imageUrls: [...p.imageUrls],
		isActive: p.isActive,
		categoryId: p.categoryId || fallbackCategoryId,
	}
}

function emptyForm(fallbackCategoryId: string): FormState {
	return {
		name: '',
		description: '',
		price: '0',
		discountType: 'NONE',
		discountValue: '0',
		imageUrls: [],
		isActive: true,
		categoryId: fallbackCategoryId,
	}
}

const MAX_IMAGES = 5

export const ProductForm: React.FC<ProductFormProps> = ({
	editing,
	categories,
	onCancel,
	onSaved,
}) => {
	const fallbackCategoryId = categories[0]?.id ?? ''
	const [form, setForm] = useState<FormState>(() =>
		editing ? fromProduct(editing, fallbackCategoryId) : emptyForm(fallbackCategoryId),
	)
	const [error, setError] = useState<string | null>(null)
	const [pending, startTransition] = useTransition()

	const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((s) => ({ ...s, [key]: value }))

	const removeImage = (url: string) =>
		update(
			'imageUrls',
			form.imageUrls.filter((u) => u !== url),
		)

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!form.name.trim()) {
			setError('Введите название')
			return
		}
		if (!form.categoryId) {
			setError('Выберите категорию')
			return
		}
		if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
			setError('Некорректная цена')
			return
		}

		const payload: ProductInput = {
			name: form.name.trim(),
			description: form.description,
			price: form.price,
			discountType: form.discountType,
			discountValue: form.discountValue || '0',
			imageUrls: form.imageUrls,
			isActive: form.isActive,
			categoryId: form.categoryId,
		}

		startTransition(async () => {
			try {
				if (editing) await patchProduct(editing.id, payload)
				else await createProduct(payload)
				onSaved()
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Не удалось сохранить')
			}
		})
	}

	return (
		<form onSubmit={submit} className='flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>
			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Название</span>
				<Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
			</label>

			<label className='flex flex-col gap-1 text-sm'>
				<span className='font-medium'>Описание</span>
				<textarea
					value={form.description}
					onChange={(e) => update('description', e.target.value)}
					rows={3}
					className='w-full rounded-3xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none'
				/>
			</label>

			<div className='grid grid-cols-2 gap-3'>
				<label className='flex flex-col gap-1 text-sm'>
					<span className='font-medium'>Цена, ₽</span>
					<Input
						type='number'
						min={0}
						step='0.01'
						value={form.price}
						onChange={(e) => update('price', e.target.value)}
						required
					/>
				</label>
				<label className='flex flex-col gap-1 text-sm'>
					<span className='font-medium'>Категория</span>
					<Select value={form.categoryId} onValueChange={(v) => update('categoryId', v)}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Выберите категорию' />
						</SelectTrigger>
						<SelectContent>
							{categories.map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</label>
			</div>

			<div className='grid grid-cols-2 gap-3'>
				<label className='flex flex-col gap-1 text-sm'>
					<span className='font-medium'>Тип скидки</span>
					<Select
						value={form.discountType}
						onValueChange={(v: DiscountType) => update('discountType', v)}
					>
						<SelectTrigger className='w-full'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='NONE'>Без скидки</SelectItem>
							<SelectItem value='PERCENT'>Процент</SelectItem>
							<SelectItem value='FIXED'>Фикс. сумма</SelectItem>
						</SelectContent>
					</Select>
				</label>
				<label className='flex flex-col gap-1 text-sm'>
					<span className='font-medium'>Значение скидки</span>
					<Input
						type='number'
						min={0}
						step='0.01'
						value={form.discountValue}
						onChange={(e) => update('discountValue', e.target.value)}
						disabled={form.discountType === 'NONE'}
					/>
				</label>
			</div>

			<label className='flex items-center gap-2 text-sm'>
				<input
					type='checkbox'
					checked={form.isActive}
					onChange={(e) => update('isActive', e.target.checked)}
					className='size-4'
				/>
				<span>Опубликован</span>
			</label>

			<div className='flex flex-col gap-2'>
				<span className='text-sm font-medium'>Изображения ({form.imageUrls.length} / {MAX_IMAGES})</span>
				{form.imageUrls.length > 0 && (
					<div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
						{form.imageUrls.map((url) => (
							<div key={url} className='relative aspect-square overflow-hidden rounded-xl bg-muted'>
								<NextImage src={url} alt='' fill sizes='100px' className='object-cover' />
								<button
									type='button'
									onClick={() => removeImage(url)}
									className='absolute top-1 right-1 grid place-items-center size-6 rounded-full bg-background/90 text-foreground hover:bg-background shadow'
									aria-label='Удалить изображение'
								>
									<XIcon className='size-3.5' />
								</button>
							</div>
						))}
					</div>
				)}
				{form.imageUrls.length < MAX_IMAGES && (
					<UploadButton
						endpoint='productImage'
						onClientUploadComplete={(res) => {
							const urls = res.map((r) => r.ufsUrl).filter(Boolean)
							update('imageUrls', [...form.imageUrls, ...urls].slice(0, MAX_IMAGES))
						}}
						onUploadError={(err) => setError(err.message)}
						appearance={{
							button: 'ut-uploading:bg-primary/70 bg-primary text-primary-foreground rounded-full text-sm h-9 px-4',
							container: 'w-fit',
							allowedContent: 'text-xs text-muted-foreground',
						}}
					/>
				)}
			</div>

			{error && (
				<p className='text-sm text-destructive' role='alert'>
					{error}
				</p>
			)}

			<div className='flex justify-end gap-2 pt-2'>
				<Button type='button' variant='outline' onClick={onCancel} disabled={pending}>
					Отмена
				</Button>
				<Button type='submit' disabled={pending}>
					{pending && <Loader2Icon className='animate-spin' />}
					{editing ? 'Сохранить' : 'Создать'}
				</Button>
			</div>
		</form>
	)
}
