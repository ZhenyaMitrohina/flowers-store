'use client'

import NextImage from 'next/image'
import { useEffect, useState, useTransition } from 'react'
import { ImageOffIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { Badge } from '@/shared/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/dialog'
import { DataTable } from '@/shared/ui/data-table'
import {
	deleteProduct,
	listProducts,
	type AdminProduct,
} from '@/entities/admin/api/products'
import { listCategories, type AdminCategory } from '@/entities/admin/api/categories'
import type { ColumnDef } from '@tanstack/react-table'
import { ProductForm } from './product-form'

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

export const ProductsView: React.FC = () => {
	const [rows, setRows] = useState<AdminProduct[]>([])
	const [categories, setCategories] = useState<AdminCategory[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState<AdminProduct | null>(null)
	const [creating, setCreating] = useState(false)
	const [, startTransition] = useTransition()

	const refresh = async () => {
		setLoading(true)
		setError(null)
		try {
			const [products, cats] = await Promise.all([listProducts(), listCategories()])
			setRows(products)
			setCategories(cats)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Ошибка загрузки')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void refresh()
	}, [])

	const remove = (row: AdminProduct) => {
		if (!confirm(`Удалить товар «${row.name}»?`)) return
		startTransition(async () => {
			try {
				await deleteProduct(row.id)
				await refresh()
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Не удалось удалить')
			}
		})
	}

	const columns: ColumnDef<AdminProduct>[] = [
		{
			id: 'image',
			header: '',
			cell: ({ row }) => {
				const url = row.original.imageUrls[0]
				return (
					<div className='relative size-12 overflow-hidden rounded-lg bg-muted'>
						{url ? (
							<NextImage src={url} alt='' fill sizes='48px' className='object-cover' />
						) : (
							<div className='grid place-items-center w-full h-full text-muted-foreground'>
								<ImageOffIcon className='size-4' />
							</div>
						)}
					</div>
				)
			},
		},
		{ header: 'Название', accessorKey: 'name' },
		{
			header: 'Категория',
			cell: ({ row }) => row.original.category.name,
		},
		{
			header: 'Цена',
			cell: ({ row }) => (
				<div className='flex flex-col'>
					<span className='font-medium tabular-nums'>{fmt.format(Number(row.original.priceFinal))}</span>
					{row.original.priceFinal !== row.original.priceOriginal && (
						<span className='text-xs text-muted-foreground line-through tabular-nums'>
							{fmt.format(Number(row.original.priceOriginal))}
						</span>
					)}
				</div>
			),
		},
		{
			header: 'Статус',
			cell: ({ row }) =>
				row.original.isActive ? (
					<Badge variant='secondary'>В продаже</Badge>
				) : (
					<Badge variant='outline'>Скрыт</Badge>
				),
		},
		{
			id: 'actions',
			header: 'Действия',
			cell: ({ row }) => (
				<div className='flex justify-end gap-1'>
					<Button size='icon-sm' variant='ghost' onClick={() => setEditing(row.original)} aria-label='Редактировать'>
						<PencilIcon className='size-4' />
					</Button>
					<Button size='icon-sm' variant='destructive' onClick={() => remove(row.original)} aria-label='Удалить'>
						<TrashIcon className='size-4' />
					</Button>
				</div>
			),
		},
	]

	const open = creating || editing !== null
	const closeModal = () => {
		setCreating(false)
		setEditing(null)
	}
	const onSaved = () => {
		closeModal()
		void refresh()
	}

	return (
		<div className='flex flex-col gap-6'>
			<header className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='font-heading text-3xl font-semibold'>Товары</h1>
					<p className='text-muted-foreground mt-1'>Управление каталогом и наполнением витрины</p>
				</div>
				<Button onClick={() => setCreating(true)} disabled={categories.length === 0}>
					<PlusIcon />
					Создать
				</Button>
			</header>

			{categories.length === 0 && !loading && (
				<p className='text-sm text-muted-foreground'>
					Сначала создайте хотя бы одну категорию.
				</p>
			)}

			<div className='bg-card rounded-2xl ring-1 ring-border p-2'>
				<DataTable columns={columns} data={rows} loading={loading} error={error} emptyText='Товаров пока нет' />
			</div>

			<Dialog open={open} onOpenChange={(v) => (v ? null : closeModal())}>
				<DialogContent className='sm:max-w-2xl'>
					<DialogHeader>
						<DialogTitle>{editing ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
						<DialogDescription>Загружайте до 5 изображений; первое будет обложкой</DialogDescription>
					</DialogHeader>
					{open && (
						<ProductForm
							editing={editing}
							categories={categories}
							onCancel={closeModal}
							onSaved={onSaved}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
