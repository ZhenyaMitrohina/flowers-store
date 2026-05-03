import { NextResponse } from 'next/server'
import { getAdminFromCookieStore } from '@/app/api/auth/admin'

export async function GET() {
	const admin = await getAdminFromCookieStore()
	if (!admin) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
	return NextResponse.json({ data: admin })
}
