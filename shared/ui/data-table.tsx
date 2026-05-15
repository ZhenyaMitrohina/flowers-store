'use client'

import { useEffect, useState } from 'react'
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	loading?: boolean
	onRowClick?: (row: TData) => void
	onRowRightClick?: (row: TData) => void
	emptyText?: string
	error?: string | null
	pageSize?: number
	rowClassName?: (row: TData) => string | undefined
	/** Показать поле поиска по строкам таблицы */
	showSearch?: boolean
	searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading,
	onRowClick,
	onRowRightClick,
	emptyText = 'Ничего не найдено',
	error = null,
	pageSize = 10,
	rowClassName,
	showSearch = true,
	searchPlaceholder = 'Поиск…',
}: DataTableProps<TData, TValue>) {
	const [globalFilter, setGlobalFilter] = useState('')
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize,
	})

	useEffect(() => {
		setPagination((p) => ({ ...p, pageSize }))
	}, [pageSize])

	const dataLength = data.length
	useEffect(() => {
		setPagination((p) => ({ ...p, pageIndex: 0 }))
	}, [globalFilter, dataLength])

	const table = useReactTable({
		data,
		columns,
		state: {
			globalFilter,
			pagination,
		},
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: 'includesString',
	})

	const filteredCount = table.getFilteredRowModel().rows.length
	const pageCount = table.getPageCount()
	const pageIndex = pagination.pageIndex
	const from = filteredCount === 0 ? 0 : pageIndex * pagination.pageSize + 1
	const to = Math.min((pageIndex + 1) * pagination.pageSize, filteredCount)

	const noMatches =
		!loading && dataLength > 0 && filteredCount === 0 && globalFilter.trim() !== ''

	const bodyMessage = (() => {
		if (error != null && error !== '') return error
		if (noMatches) return 'Нет строк, подходящих под запрос'
		return emptyText
	})()

	return (
		<div className='flex flex-col gap-3'>
			{showSearch && (
				<div className='px-1'>
					<Input
						type='search'
						placeholder={searchPlaceholder}
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						disabled={loading}
						className='max-w-sm'
						aria-label='Поиск по таблице'
					/>
				</div>
			)}

			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{loading ? (
						Array.from({ length: 5 }).map((_, index) => (
							<TableRow key={index}>
								{Array.from({ length: columns.length }).map((_, cellIndex) => (
									<TableCell key={cellIndex}>
										<Skeleton className='h-5' />
									</TableCell>
								))}
							</TableRow>
						))
					) : table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								onClick={() => onRowClick?.(row.original)}
								className={cn(onRowClick ? 'cursor-pointer' : undefined, rowClassName?.(row.original))}
								onContextMenu={(e) => {
									e.preventDefault()
									onRowRightClick?.(row.original)
								}}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow className='hover:bg-inherit'>
							<TableCell
								colSpan={columns.length}
								className={cn(
									'h-24 text-center',
									error != null && error !== '' ? 'text-destructive' : undefined,
									noMatches ? 'text-muted-foreground' : undefined,
								)}
							>
								{bodyMessage}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{!loading && filteredCount > 0 && (
				<div className='flex flex-col gap-2 border-t border-border px-1 pt-3 sm:flex-row sm:items-center sm:justify-between'>
					<p className='text-sm text-muted-foreground tabular-nums'>
						{from}–{to} из {filteredCount}
						{pageCount > 1 && (
							<span className='text-muted-foreground/80'>
								{' '}
								· стр. {pageIndex + 1} из {pageCount}
							</span>
						)}
					</p>
					{pageCount > 1 && (
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
								aria-label='Предыдущая страница'
							>
								<ChevronLeftIcon />
								Назад
							</Button>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								aria-label='Следующая страница'
							>
								Вперёд
								<ChevronRightIcon />
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
