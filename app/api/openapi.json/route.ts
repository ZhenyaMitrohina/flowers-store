import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const buf = await readFile(join(process.cwd(), 'openapi', 'openapi.json'), 'utf8')
		return new NextResponse(buf, {
			headers: { 'content-type': 'application/json; charset=utf-8' },
		})
	} catch (error) {
		return new NextResponse('Failed to read openapi.json', { status: 500 })
	}
}
