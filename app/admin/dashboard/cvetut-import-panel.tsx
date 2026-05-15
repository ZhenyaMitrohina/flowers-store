'use client'

import { useCallback, useState } from 'react'
import { UploadIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { importCvetutCatalogJson, type CvetutImportResponse } from '@/entities/admin'

async function readJsonFile(file: File): Promise<unknown> {
	const text = await file.text()
	return JSON.parse(text) as unknown
}

export function CvetutImportPanel() {
	const [categoriesFile, setCategoriesFile] = useState<File | null>(null)
	const [productsFile, setProductsFile] = useState<File | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [result, setResult] = useState<CvetutImportResponse | null>(null)

	const onImport = useCallback(async () => {
		setError(null)
		setResult(null)
		if (!categoriesFile || !productsFile) {
			setError('Выберите оба JSON-файла: категории и товары')
			return
		}
		setLoading(true)
		try {
			const [categories, products] = await Promise.all([
				readJsonFile(categoriesFile),
				readJsonFile(productsFile),
			])
			const data = await importCvetutCatalogJson({ categories, products })
			setResult(data)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Не удалось импортировать')
		} finally {
			setLoading(false)
		}
	}, [categoriesFile, productsFile])

	const canSubmit = Boolean(categoriesFile && productsFile) && !loading

	return (
		<section className='rounded-2xl bg-card ring-1 ring-border p-5 flex flex-col gap-4'>
			<div className='flex items-center gap-2 text-muted-foreground'>
				<UploadIcon className='size-4' />
				<h2 className='text-sm font-medium text-foreground'>Импорт каталога</h2>
			</div>
			<p className='text-xs text-muted-foreground'>
				Файлы в формате парсера: <code className='text-foreground/80'>categories.json</code> и{' '}
				<code className='text-foreground/80'>products.json</code>
			</p>
			<div className='flex flex-col sm:flex-row gap-3 sm:items-end'>
				<div className='flex flex-col gap-1 min-w-0 flex-1'>
					<label className='text-xs font-medium text-muted-foreground'>Категории</label>
					<input
						type='file'
						accept='application/json,.json'
						className='text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium'
						onChange={(e) => {
							setCategoriesFile(e.target.files?.[0] ?? null)
							setResult(null)
						}}
					/>
				</div>
				<div className='flex flex-col gap-1 min-w-0 flex-1'>
					<label className='text-xs font-medium text-muted-foreground'>Товары</label>
					<input
						type='file'
						accept='application/json,.json'
						className='text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium'
						onChange={(e) => {
							setProductsFile(e.target.files?.[0] ?? null)
							setResult(null)
						}}
					/>
				</div>
				<Button type='button' disabled={!canSubmit} onClick={() => void onImport()}>
					{loading ? 'Импорт…' : 'Импортировать'}
				</Button>
			</div>
			{error ? (
				<p className='text-sm text-destructive' role='alert'>
					{error}
				</p>
			) : null}
			{result ? (
				<div className='text-sm rounded-xl bg-muted/50 px-3 py-2 space-y-1'>
					<p>
						Категорий обработано: <strong>{result.categoriesUpserted}</strong>
					</p>
					<p>
						Товаров создано: <strong>{result.productsCreated}</strong>, обновлено:{' '}
						<strong>{result.productsUpdated}</strong>
					</p>
					{result.skippedProducts.length > 0 ? (
						<p className='text-muted-foreground text-xs pt-1'>
							Пропущено товаров: {result.skippedProducts.length} (неизвестная категория)
						</p>
					) : null}
				</div>
			) : null}
		</section>
	)
}
