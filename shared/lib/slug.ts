/** Транслитерация кириллицы (ru) + приведение к SEO-slug: латиница, цифры, дефисы. */
const CYR_TO_LAT: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'e',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya',
}

const SLUG_MAX = 100
/** Резерв под суффикс collision: "-123" */
const SLUG_BASE_MAX = 80

/**
 * Готовый slug для категории: только [a-z0-9] и одиночные дефисы между сегментами.
 * Пустая строка — если из названия нельзя вывести валидный slug (тогда вызывайте fallback).
 */
export function slugFromCategoryName(name: string): string {
	const lower = name.trim().toLowerCase()
	let buf = ''
	for (const ch of lower) {
		if (CYR_TO_LAT[ch] !== undefined) {
			buf += CYR_TO_LAT[ch]
			continue
		}
		if (/[a-z0-9]/.test(ch)) {
			buf += ch
			continue
		}
		if (/\s/.test(ch) || ch === '-' || ch === '_' || ch === '–' || ch === '—') {
			buf += '-'
		}
	}
	let s = buf
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.replace(/[^a-z0-9-]/g, '')

	if (s.length > SLUG_BASE_MAX) {
		s = s.slice(0, SLUG_BASE_MAX).replace(/-+$/, '')
	}
	if (s.length > SLUG_MAX) {
		s = s.slice(0, SLUG_MAX).replace(/-+$/, '')
	}
	return s
}

export const defaultCategorySlugFallback = 'category'
