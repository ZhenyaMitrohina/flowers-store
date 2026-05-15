import { NextResponse } from 'next/server'
import { importCvetutCatalog } from '@/lib/import/cvetut-json'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookieStore, adminUnauthorized } from '@/app/api/auth/admin'
import { cvetutImportBodySchema } from '@/shared/lib/validation/cvetut-import'

export async function POST(request: Request) {
	const admin = await getAdminFromCookieStore()
	if (!admin) return adminUnauthorized()

	const json = await request.json().catch(() => null)
	const parsed = cvetutImportBodySchema.safeParse(json)
	if (!parsed.success) {
		return NextResponse.json(
			{ error: 'Некорректные данные', details: parsed.error.flatten() },
			{ status: 400 },
		)
	}

	try {
		const data = await importCvetutCatalog(prisma, parsed.data)
		return NextResponse.json({ data })
	} catch (e) {
		console.error('[admin/import]', e)
		return NextResponse.json({ error: 'Не удалось выполнить импорт' }, { status: 500 })
	}
}
