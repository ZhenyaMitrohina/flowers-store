'use client'

import { useEffect, useState, useTransition } from 'react'
import { OrderStatus } from '@prisma/client'
import { Loader2Icon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/dialog'
import { DataTable } from '@/shared/ui/data-table'
import {
	listOrders,
	patchOrder,
	type AdminOrder,
} from '@/entities/admin/api/orders'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_LABEL: Record<OrderStatus, string> = {
	PROCESSING: 'В обработке',
	SUCCESS: 'Выполнен',
	CANCELLED: 'Отменён',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	PROCESSING: 'outline',
	SUCCESS: 'secondary',
	CANCELLED: 'destructive',
}

const fmt = new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 0,
})

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
	dateStyle: 'short',
	timeStyle: 'short',
})

export const OrdersView: React.FC = () => {
	const [rows, setRows] = useState<AdminOrder[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
	const [open, setOpen] = useState<AdminOrder | null>(null)
	const [pending, start] = useTransition()

	const refresh = async (filter: OrderStatus | 'ALL' = statusFilter) => {
		setLoading(true)
		setError(null)
		try {
			const res = await listOrders({
				limit: 100,
				status: filter === 'ALL' ? undefined : filter,
			})
			setRows(res.data)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Ошибка загрузки')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void refresh('ALL')
	}, [])

	const updateStatus = (id: string, status: OrderStatus) => {
		start(async () => {
			try {
				await patchOrder(id, { status })
				await refresh()
				setOpen((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Не удалось обновить')
			}
		})
	}

	const columns: ColumnDef<AdminOrder>[] = [
		{
			header: '№',
			accessorKey: 'id',
			cell: (info) => <code className='text-xs text-muted-foreground'>{info.getValue<string>().slice(0, 8)}</code>,
		},
		{
			header: 'Создан',
			accessorFn: (row) => dateFmt.format(new Date(row.createdAt)),
			id: 'createdAt',
			cell: ({ row }) => (
				<span className='whitespace-nowrap'>{dateFmt.format(new Date(row.original.createdAt))}</span>
			),
		},
		{
			header: 'Доставка',
			accessorFn: (row) => dateFmt.format(new Date(row.deliveryAt)),
			id: 'deliveryAt',
			cell: ({ row }) => (
				<span className='whitespace-nowrap'>{dateFmt.format(new Date(row.original.deliveryAt))}</span>
			),
		},
		{ header: 'Получатель', accessorKey: 'customerName' },
		{ header: 'Телефон', accessorKey: 'phone' },
		{
			header: 'Сумма',
			accessorFn: (row) => String(row.total),
			id: 'total',
			cell: ({ row }) => (
				<span className='font-medium tabular-nums'>{fmt.format(Number(row.original.total))}</span>
			),
		},
		{
			header: 'Статус',
			accessorFn: (row) => STATUS_LABEL[row.status],
			id: 'orderStatus',
			cell: ({ row }) => (
				<Badge variant={STATUS_VARIANT[row.original.status]}>{STATUS_LABEL[row.original.status]}</Badge>
			),
		},
	]

	return (
		<div className='flex flex-col gap-6'>
			<header className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='font-heading text-3xl font-semibold'>Заказы</h1>
					<p className='text-muted-foreground mt-1'>Управляйте статусами и просматривайте состав</p>
				</div>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-muted-foreground'>Статус:</span>
					<Select
						value={statusFilter}
						onValueChange={(v: OrderStatus | 'ALL') => {
							setStatusFilter(v)
							void refresh(v)
						}}
					>
						<SelectTrigger className='min-w-44'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ALL'>Все</SelectItem>
							<SelectItem value='PROCESSING'>{STATUS_LABEL.PROCESSING}</SelectItem>
							<SelectItem value='SUCCESS'>{STATUS_LABEL.SUCCESS}</SelectItem>
							<SelectItem value='CANCELLED'>{STATUS_LABEL.CANCELLED}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</header>

			<div className='bg-card rounded-2xl ring-1 ring-border p-2'>
				<DataTable
					columns={columns}
					data={rows}
					loading={loading}
					error={error}
					emptyText='Заказов пока нет'
					searchPlaceholder='Номер, имя, телефон, дата, сумма, статус…'
					onRowClick={(o) => setOpen(o)}
				/>
			</div>

			<Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
				<DialogContent className='sm:max-w-2xl'>
					{open && (
						<div className='flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle>Заказ {open.id.slice(0, 8)}…</DialogTitle>
								<DialogDescription>
									Создан {dateFmt.format(new Date(open.createdAt))}
								</DialogDescription>
							</DialogHeader>

							<div className='grid grid-cols-2 gap-3 text-sm'>
								<div>
									<p className='text-muted-foreground'>Получатель</p>
									<p className='font-medium'>{open.customerName}</p>
								</div>
								<div>
									<p className='text-muted-foreground'>Телефон</p>
									<p className='font-medium'>{open.phone}</p>
								</div>
								<div className='col-span-2'>
									<p className='text-muted-foreground'>Адрес доставки</p>
									<p className='font-medium'>{open.address}</p>
								</div>
								<div>
									<p className='text-muted-foreground'>Дата доставки</p>
									<p className='font-medium'>{dateFmt.format(new Date(open.deliveryAt))}</p>
								</div>
								<div>
									<p className='text-muted-foreground'>Сумма</p>
									<p className='font-medium'>{fmt.format(Number(open.total))}</p>
								</div>
								{open.comment && (
									<div className='col-span-2'>
										<p className='text-muted-foreground'>Комментарий</p>
										<p className='whitespace-pre-line'>{open.comment}</p>
									</div>
								)}
							</div>

							<div>
								<p className='text-sm text-muted-foreground mb-2'>Состав</p>
								<ul className='flex flex-col gap-1'>
									{open.items.map((it) => (
										<li
											key={it.id}
											className='flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm'
										>
											<span className='truncate'>{it.productName}</span>
											<span className='whitespace-nowrap text-muted-foreground'>
												{it.quantity} × {fmt.format(Number(it.unitPrice))} ={' '}
												<span className='text-foreground font-medium'>
													{fmt.format(Number(it.lineTotal))}
												</span>
											</span>
										</li>
									))}
								</ul>
							</div>

							<div className='flex items-center gap-3 pt-2 border-t border-border'>
								<span className='text-sm font-medium'>Статус заказа:</span>
								<Select
									value={open.status}
									onValueChange={(v: OrderStatus) => updateStatus(open.id, v)}
								>
									<SelectTrigger className='min-w-44'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='PROCESSING'>{STATUS_LABEL.PROCESSING}</SelectItem>
										<SelectItem value='SUCCESS'>{STATUS_LABEL.SUCCESS}</SelectItem>
										<SelectItem value='CANCELLED'>{STATUS_LABEL.CANCELLED}</SelectItem>
									</SelectContent>
								</Select>
								{pending && <Loader2Icon className='size-4 animate-spin text-muted-foreground' />}
								<Button variant='outline' className='ml-auto' onClick={() => setOpen(null)}>
									Закрыть
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
