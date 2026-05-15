'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2Icon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/dialog'
import { DataTable } from '@/shared/ui/data-table'
import {
	createCategory,
	deleteCategory,
	listCategories,
	patchCategory,
	type AdminCategory,
} from '@/entities/admin/api/categories'
import type { ColumnDef } from '@tanstack/react-table'

interface FormState {
	name: string
	slug: string
	sortOrder: string
}

const empty: FormState = { name: '', slug: '', sortOrder: '0' }

function nextSortOrder(rows: AdminCategory[]): number {
	const used = new Set(rows.map((r) => r.sortOrder))
	let n = 0
	while (used.has(n)) n++
	return n
}

export const CategoriesView: React.FC = () => {
	const [rows, setRows] = useState<AdminCategory[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editing, setEditing] = useState<AdminCategory | null>(null)
	const [creating, setCreating] = useState(false)
	const [form, setForm] = useState<FormState>(empty)
	const [submitting, startTransition] = useTransition()
	const [submitError, setSubmitError] = useState<string | null>(null)

	const refresh = async () => {
		setLoading(true)
		setError(null)
		try {
			setRows(await listCategories())
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Ошибка загрузки')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void refresh()
	}, [])

	const openCreate = () => {
		setSubmitError(null)
		setForm({ ...empty, sortOrder: String(nextSortOrder(rows)) })
		setCreating(true)
	}

	const openEdit = (row: AdminCategory) => {
		setSubmitError(null)
		setForm({ name: row.name, slug: row.slug, sortOrder: String(row.sortOrder) })
		setEditing(row)
	}

	const closeModal = () => {
		setCreating(false)
		setEditing(null)
		setSubmitError(null)
	}

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitError(null)
		const sortOrder = Number(form.sortOrder)
		if (!form.name.trim()) {
			setSubmitError('Введите название')
			return
		}
		if (!Number.isFinite(sortOrder) || sortOrder < 0) {
			setSubmitError('Позиция должна быть целым числом ≥ 0')
			return
		}
		startTransition(async () => {
			try {
				if (editing) {
					await patchCategory(editing.id, {
						name: form.name.trim(),
						slug: form.slug.trim() || undefined,
						sortOrder,
					})
				} else {
					await createCategory({
						name: form.name.trim(),
						slug: form.slug.trim() || undefined,
						sortOrder,
					})
				}
				closeModal()
				await refresh()
			} catch (err) {
				setSubmitError(err instanceof Error ? err.message : 'Не удалось сохранить')
			}
		})
	}

	const remove = (row: AdminCategory) => {
		if (!confirm(`Удалить категорию «${row.name}»?`)) return
		startTransition(async () => {
			try {
				await deleteCategory(row.id)
				await refresh()
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Не удалось удалить')
			}
		})
	}

	const columns: ColumnDef<AdminCategory>[] = [
		{ header: '#', accessorKey: 'sortOrder', cell: (info) => <span className='tabular-nums'>{info.getValue<number>()}</span> },
		{ header: 'Название', accessorKey: 'name' },
		{ header: 'Ссылка', accessorKey: 'slug', cell: (info) => <code className='text-xs'>{info.getValue<string>()}</code> },
		{
			header: 'Действия',
			id: 'actions',
			cell: ({ row }) => (
				<div className='flex justify-end gap-1'>
					<Button size='icon-sm' variant='ghost' onClick={() => openEdit(row.original)} aria-label='Редактировать'>
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

	return (
		<div className='flex flex-col gap-6'>
			<header className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='font-heading text-3xl font-semibold'>Категории</h1>
					<p className='text-muted-foreground mt-1'>Организуйте структуру каталога</p>
				</div>
				<Button onClick={openCreate}>
					<PlusIcon />
					Создать
				</Button>
			</header>

			<div className='bg-card rounded-2xl ring-1 ring-border p-2'>
				<DataTable
					columns={columns}
					data={rows}
					loading={loading}
					error={error}
					emptyText='Категорий пока нет'
					searchPlaceholder='Название, ссылка, позиция…'
				/>
			</div>

			<Dialog open={open} onOpenChange={(v) => (v ? null : closeModal())}>
				<DialogContent>
					<form onSubmit={submit} className='flex flex-col gap-4'>
						<DialogHeader>
							<DialogTitle>{editing ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
							<DialogDescription>Ссылка сгенерируется автоматически, если оставить пустым</DialogDescription>
						</DialogHeader>

						<label className='flex flex-col gap-1 text-sm'>
							<span className='font-medium'>Название</span>
							<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
						</label>
						<label className='flex flex-col gap-1 text-sm'>
							<span className='font-medium'>Ссылка (необязательно)</span>
							<Input
								value={form.slug}
								onChange={(e) => setForm({ ...form, slug: e.target.value })}
								placeholder='roses'
								pattern='[a-z0-9]+(?:-[a-z0-9]+)*'
							/>
						</label>
						<label className='flex flex-col gap-1 text-sm'>
							<span className='font-medium'>Позиция сортировки</span>
							<Input
								type='number'
								min={0}
								value={form.sortOrder}
								onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
								required
							/>
						</label>

						{submitError && (
							<p className='text-sm text-destructive' role='alert'>
								{submitError}
							</p>
						)}

						<DialogFooter>
							<Button type='button' variant='outline' onClick={closeModal}>
								Отмена
							</Button>
							<Button type='submit' disabled={submitting}>
								{submitting && <Loader2Icon className='animate-spin' />}
								Сохранить
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
