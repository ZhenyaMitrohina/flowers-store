import { type ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
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
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading,
	onRowClick,
	onRowRightClick,
	emptyText = 'Ничего не найдено',
	error = null,
	pageSize = 15,
	rowClassName,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: pageSize
			}
		}
	})

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map(headerGroup => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map(header => {
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
							{Array.from({ length: columns.length }).map((_, index) => (
								<TableCell key={index}>
									<Skeleton className='h-5' />
								</TableCell>
							))}
						</TableRow>
					))
				) : table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map(row => (
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
							{row.getVisibleCells().map(cell => (
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
							)}
						>
							{error != null && error !== '' ? error : emptyText}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	)
}
