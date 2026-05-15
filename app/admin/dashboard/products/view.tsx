'use client'

import NextImage from 'next/image'
import { useEffect, useMemo, useState, useTransition } from 'react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui/select'
import { ProductForm } from './product-form'

type ProductStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

export const ProductsView: React.FC = () => {
	const [rows, setRows] = useState<AdminProduct[]>([])
	const [categories, setCategories] = useState<AdminCategory[]>([])
	const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL')
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

	const tableRows = useMemo(() => {
		if (statusFilter === 'ALL') return rows
		if (statusFilter === 'ACTIVE') return rows.filter((r) => r.isActive)
		return rows.filter((r) => !r.isActive)
	}, [rows, statusFilter])

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
			enableGlobalFilter: false,
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
			accessorFn: (row) => row.category.name,
			id: 'categoryName',
			cell: ({ row }) => row.original.category.name,
		},
		{
			header: 'Цена',
			accessorFn: (row) => `${row.priceFinal} ${row.priceOriginal}`,
			id: 'price',
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
			accessorFn: (row) => (row.isActive ? 'В продаже' : 'Скрыт'),
			id: 'status',
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
			enableGlobalFilter: false,
			cell: ({ row }) => (
				<div className='flex justify-end gap-1' onClick={(e) => e.stopPropagation()}>
					<Button
						size='icon-sm'
						variant='ghost'
						onClick={(e) => {
							e.stopPropagation()
							setEditing(row.original)
						}}
						aria-label='Редактировать'
					>
						<PencilIcon className='size-4' />
					</Button>
					<Button
						size='icon-sm'
						variant='destructive'
						onClick={(e) => {
							e.stopPropagation()
							remove(row.original)
						}}
						aria-label='Удалить'
					>
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

	const emptyMessage =
		rows.length === 0 ? 'Товаров пока нет' : tableRows.length === 0 ? 'Нет товаров с выбранным статусом' : 'Товаров пока нет'

	return (
		<div className='flex flex-col gap-6'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<h1 className='font-heading text-3xl font-semibold'>Товары</h1>
					<p className='text-muted-foreground mt-1'>Управление каталогом и наполнением витрины</p>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<span className='text-sm text-muted-foreground'>Статус:</span>
					<Select value={statusFilter} onValueChange={(v: ProductStatusFilter) => setStatusFilter(v)}>
						<SelectTrigger className='min-w-44'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>Все</SelectItem>
							<SelectItem value='ACTIVE'>В продаже</SelectItem>
							<SelectItem value='INACTIVE'>Скрыт</SelectItem>
						</SelectContent>
					</Select>
					<Button onClick={() => setCreating(true)} disabled={categories.length === 0}>
						<PlusIcon />
						Создать
					</Button>
				</div>
			</header>

			{categories.length === 0 && !loading && (
				<p className='text-sm text-muted-foreground'>
					Сначала создайте хотя бы одну категорию.
				</p>
			)}

			<div className='bg-card rounded-2xl ring-1 ring-border p-2'>
				<DataTable
					columns={columns}
					data={tableRows}
					loading={loading}
					error={error}
					emptyText={emptyMessage}
					searchPlaceholder='Название, категория, цена, статус…'
				/>
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
