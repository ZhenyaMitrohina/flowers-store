/**
 * Каталог cvetut (xn--b1ag3baeo.xn--p1ai) → JSON для импорта (поля как в Prisma Category / Product + categorySlug + slug товара).
 * Ровно 10 русских категорий (slug из названия, без «/»), не более 100 товаров, равномерно по категориям.
 * Только публичные данные каталога. Не хранить персональные данные.
 *
 * Логи в stderr: INFO (старт, очередь, причина остановки), прогресс по батчам; WARN; DEBUG при --verbose.
 * Флаги: --verbose|-v, --quiet|-q (без строк «Прогресс» по батчам), --timestamps|-t
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { load, type Cheerio } from 'cheerio'
import { slugFromCategoryName } from '../shared/lib/slug'

type DiscountType = 'NONE' | 'PERCENT' | 'FIXED'

/** Поля товара без slug и без categorySlug — категория задаётся после обхода. */
type ParsedProductCore = {
	name: string
	description: string
	price: number
	discountType: DiscountType
	discountValue: string
	imageUrls: string[]
	isActive: boolean
}

type ProductWithPath = ParsedProductCore & { _sourcePath: string }

export interface ScrapedCategory {
	name: string
	slug: string
	sortOrder: number
}

export interface ScrapedProduct {
	slug: string
	name: string
	description: string
	price: number
	discountType: DiscountType
	discountValue: string
	imageUrls: string[]
	isActive: boolean
	categorySlug: string
}

// ---------------------------------------------------------------------------
// Константы сайта и лимитов
// ---------------------------------------------------------------------------

const BASE = 'https://xn--b1ag3baeo.xn--p1ai'
const USER_AGENT =
	'flowers-store-scraper/1.0 (+https://github.com/flowers-store local catalog sync)'

const MAX_IMAGES = 5
const MAX_CATEGORIES = 10
const MAX_PRODUCTS = 100
const MAX_RAW_PRODUCTS = 400

const CATALOG_ROOTS = new Set([
	'tsvety',
	'actions',
	'v-nalicii',
	'cvetocnye-kompozicii',
	'korziny-iz-tsvetov-i-fruktov',
	'gorshechnye-tsvety',
	'shary',
	'svadebnaya-floristika',
	'traurnye-tsvety',
])

const BLOCKED_PREFIXES = [
	'/search',
	'/recall',
	'/status-zakaza',
	'/bascet',
	'/change',
	'/one-buy',
	'/login',
	'/register',
	'/cart',
	'/assets/',
	'/web/upload/', // direct files only
]

/** Ровно 10 категорий: русские названия; slug = slugFromCategoryName(name) без «/». */
const TARGET_CATEGORY_NAMES = [
	'Розы',
	'Пионы',
	'Сборные букеты',
	'Акции',
	'В наличии',
	'Композиции и цветы в коробке',
	'Корзины с цветами и фруктами',
	'Горшечные растения',
	'Шары и подарки',
	'Свадьба и торжество',
] as const

const STATIC_SEED_PATHS = [
	'/tsvety',
	'/actions',
	'/v-nalicii',
	'/cvetocnye-kompozicii',
	'/korziny-iz-tsvetov-i-fruktov',
	'/gorshechnye-tsvety',
	'/shary',
	'/svadebnaya-floristika',
	'/traurnye-tsvety',
] as const

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface CliOptions {
	outDir: string
	delayMs: number
	concurrency: number
	emptyDescription: boolean
	maxUrls: number
	/** Подробный вывод: каждый URL, ретраи fetch */
	verbose: boolean
	/** Только предупреждения, ошибки и итог (без прогресса по батчам) */
	quiet: boolean
	/** Префикс времени HH:MM:SS */
	timestamps: boolean
}

class ScrapeCvetutCli {
	static parse(argv: string[]): CliOptions {
		let outDir = path.join(process.cwd(), 'data', 'cvetut')
		let delayMs = 500
		let concurrency = 2
		let emptyDescription = false
		let maxUrls = Number.POSITIVE_INFINITY
		let verbose = true
		let quiet = false
		let timestamps = false

		for (let i = 2; i < argv.length; i++) {
			const a = argv[i]
			if (a === '--out-dir' && argv[i + 1]) {
				outDir = path.resolve(argv[++i])
			} else if (a === '--delay-ms' && argv[i + 1]) {
				delayMs = Math.max(0, Number(argv[++i]) || 0)
			} else if (a === '--concurrency' && argv[i + 1]) {
				concurrency = Math.min(5, Math.max(1, Number(argv[++i]) || 1))
			} else if (a === '--empty-description') {
				emptyDescription = true
			} else if (a === '--max-urls' && argv[i + 1]) {
				maxUrls = Math.max(1, Number(argv[++i]) || 1)
			} else if (a === '--verbose' || a === '-v') {
				verbose = true
			} else if (a === '--quiet' || a === '-q') {
				quiet = true
			} else if (a === '--timestamps' || a === '-t') {
				timestamps = true
			}
		}

		if (verbose && quiet) {
			console.error(
				'[scrape-cvetut] WARN: заданы и --verbose и --quiet; используется --verbose',
			)
			quiet = false
		}

		return {
			outDir,
			delayMs,
			concurrency,
			emptyDescription,
			maxUrls,
			verbose,
			quiet,
			timestamps,
		}
	}
}

// ---------------------------------------------------------------------------
// Логирование (отдельный класс — единственная точка вывода в stderr для сценария)
// ---------------------------------------------------------------------------

class ScrapeCvetutLogger {
	private static readonly PREFIX = '[scrape-cvetut]'

	constructor(private readonly opts: Pick<CliOptions, 'timestamps' | 'quiet' | 'verbose'>) {}

	private timestampPrefix(): string {
		return this.opts.timestamps ? `${new Date().toISOString().slice(11, 19)} ` : ''
	}

	private formatMeta(meta?: Record<string, unknown>): string {
		if (!meta || Object.keys(meta).length === 0) return ''
		return (
			' ' +
			Object.entries(meta)
				.map(([k, v]) => {
					const s = typeof v === 'string' ? v : JSON.stringify(v)
					return `${k}=${s.length > 120 ? s.slice(0, 117) + '...' : s}`
				})
				.join(' ')
		)
	}

	private line(level: string, msg: string, meta?: Record<string, unknown>): void {
		console.error(
			`${this.timestampPrefix()}${ScrapeCvetutLogger.PREFIX} ${level}: ${msg}${this.formatMeta(meta)}`,
		)
	}

	info(msg: string, meta?: Record<string, unknown>): void {
		this.line('INFO', msg, meta)
	}

	/** Прогресс по батчам — отключается при --quiet */
	progress(msg: string, meta?: Record<string, unknown>): void {
		if (this.opts.quiet) return
		this.line('INFO', msg, meta)
	}

	warn(msg: string, meta?: Record<string, unknown>): void {
		this.line('WARN', msg, meta)
	}

	debug(msg: string, meta?: Record<string, unknown>): void {
		if (!this.opts.verbose) return
		this.line('DEBUG', msg, meta)
	}

	error(msg: string, meta?: Record<string, unknown>): void {
		this.line('ERROR', msg, meta)
	}

	/** Итог всегда в stderr (удобно для пайпов) */
	summary(msg: string, meta?: Record<string, unknown>): void {
		console.error(
			`${this.timestampPrefix()}${ScrapeCvetutLogger.PREFIX} ${msg}${this.formatMeta(meta)}`,
		)
	}
}

// ---------------------------------------------------------------------------
// Утилиты времени и пула задач
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms))
}

class AsyncTaskPool {
	static async run<T>(
		items: T[],
		concurrency: number,
		fn: (item: T) => Promise<void>,
	): Promise<void> {
		let i = 0
		const workers = Array.from({ length: concurrency }, async () => {
			while (i < items.length) {
				const idx = i++
				const item = items[idx]
				if (item === undefined) return
				await fn(item)
			}
		})
		await Promise.all(workers)
	}
}

// ---------------------------------------------------------------------------
// URL и фильтрация каталога
// ---------------------------------------------------------------------------

class CvetutUrls {
	private static readonly baseHostname = new URL(BASE).hostname.replace(/^www\./, '')

	static abs(href: string): string | null {
		if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null
		try {
			const u = new URL(href, BASE)
			if (u.hostname.replace(/^www\./, '') !== CvetutUrls.baseHostname) return null
			u.hash = ''
			return u.toString()
		} catch {
			return null
		}
	}

	/** Ключ товара без query (карточки и деталь совпадают). */
	static canonicalProductUrl(u: string): string {
		const x = new URL(u)
		x.hash = ''
		return `${x.origin}${x.pathname}`
	}

	static isCatalogPath(pathname: string): boolean {
		const first = pathname.replace(/^\/+/, '').split('/')[0] ?? ''
		if (!first || !CATALOG_ROOTS.has(first)) return false
		if (BLOCKED_PREFIXES.some((p) => pathname.startsWith(p))) return false
		if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|ico|zip)$/i.test(pathname)) return false
		return true
	}
}

// ---------------------------------------------------------------------------
// Цены и скидки
// ---------------------------------------------------------------------------

function parseRubles(raw: string): number {
	const s = raw
		.replace(/\u00a0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
	const num = s.replace(/[^\d,.-]/g, '').replace(',', '.')
	const v = Number.parseFloat(num)
	return Number.isFinite(v) ? v : 0
}

class PriceDiscount {
	static fromPrices(
		base: number,
		final: number,
	): { discountType: DiscountType; discountValue: string } {
		if (base <= 0 || final <= 0 || final >= base - 0.01) {
			return { discountType: 'NONE', discountValue: '0.00' }
		}
		const pct = (1 - final / base) * 100
		const rounded = Math.round(pct * 100) / 100
		const fromPct = base * (1 - rounded / 100)
		if (Math.abs(fromPct - final) <= 1.5) {
			return { discountType: 'PERCENT', discountValue: rounded.toFixed(2) }
		}
		const fixed = base - final
		return { discountType: 'FIXED', discountValue: Math.max(0, fixed).toFixed(2) }
	}
}

// ---------------------------------------------------------------------------
// HTTP-клиент с ретраями
// ---------------------------------------------------------------------------

class CvetutHttpClient {
	constructor(private readonly log: ScrapeCvetutLogger) {}

	async fetchHtml(url: string, retries = 4): Promise<string> {
		let lastErr: unknown
		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				const res = await fetch(url, {
					headers: {
						'User-Agent': USER_AGENT,
						Accept: 'text/html,application/xhtml+xml',
					},
					redirect: 'follow',
				})
				if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
					this.log.debug('fetch: повтор из-за HTTP-статуса', {
						url,
						status: res.status,
						attempt: attempt + 1,
						maxAttempts: retries + 1,
					})
					await sleep(800 * (attempt + 1))
					continue
				}
				if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
				return await res.text()
			} catch (e) {
				lastErr = e
				this.log.debug('fetch: исключение, повтор', {
					url,
					attempt: attempt + 1,
					err: e instanceof Error ? e.message : String(e),
				})
				await sleep(600 * (attempt + 1))
			}
		}
		throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
	}
}

// ---------------------------------------------------------------------------
// Парсинг HTML (листинг, карточка, ссылки)
// ---------------------------------------------------------------------------

class CvetutPageParser {
	static collectGalleryImages($: ReturnType<typeof load>): string[] {
		const $wrap = $('.bouqets-view .photo-block-wrapper').first().length
			? $('.bouqets-view .photo-block-wrapper').first()
			: $('.content-detail .photo-block-wrapper').first()
		if (!$wrap.length) return []

		const best = new Map<string, { url: string; score: number }>()

		const imgKindScore = (url: string): number => {
			if (url.includes('/thumbs/')) return 2
			if (url.includes('?')) return 1
			return 0
		}

		const normalizePathKey = (abs: string): string | null => {
			try {
				return new URL(abs).pathname
			} catch {
				return null
			}
		}

		const consider = (raw: string | undefined) => {
			if (!raw) return
			const abs =
				CvetutUrls.abs(raw) ??
				(raw.startsWith('http')
					? raw
					: CvetutUrls.abs(raw.startsWith('/') ? raw : `/${raw}`))
			if (!abs || abs.includes('/web/upload/logo')) return
			const pathKey = normalizePathKey(abs)
			if (!pathKey) return
			const cleanUrl = (() => {
				try {
					const u = new URL(abs)
					u.search = ''
					u.hash = ''
					return u.toString()
				} catch {
					return abs.split('?')[0]
				}
			})()
			const sc = imgKindScore(abs)
			const prev = best.get(pathKey)
			if (!prev || sc < prev.score) {
				best.set(pathKey, { url: cleanUrl, score: sc })
			}
		}

		$wrap.find('.gallery-item').each((_, el) => {
			const $el = $(el)
			consider($el.attr('href'))
			consider($el.find('img').first().attr('src'))
		})

		const nestedImgSelectors = [
			'.product-photo-detail img[src]',
			'.slick-list img[src]',
			'.slick-track img[src]',
			'.slick-slide img[src]',
			'.thumb-img img[src]',
			'.thumb-img-item img[src]',
		]
		for (const sel of nestedImgSelectors) {
			$wrap.find(sel).each((_, el) => consider($(el).attr('src')))
		}

		$wrap.find('[data-src]').each((_, el) => consider($(el).attr('data-src')))

		$('meta[name="og:image"], meta[property="og:image"]').each((_, el) => {
			const c = $(el).attr('content')
			if (!c || c.includes('logo')) return
			consider(c)
		})

		const urls = [...best.values()]
			.sort((a, b) => a.score - b.score || a.url.localeCompare(b.url))
			.map((x) => x.url)

		return urls
			.sort((a, b) => (a.includes('/thumbs/') ? 1 : 0) - (b.includes('/thumbs/') ? 1 : 0))
			.slice(0, MAX_IMAGES)
	}

	static parseProductPage(html: string, emptyDescription: boolean): ParsedProductCore | null {
		const $ = load(html)
		if (!$('.bouqets-view').length) return null

		const name = (
			$('h1 span[itemprop="name"]').first().text() ||
			$('h1').first().text() ||
			''
		).trim()
		if (!name) return null

		const descBlock = $('.item-description[itemprop="description"], .item-description')
			.first()
			.clone()
		descBlock.find('.item-description-title').remove()
		let desc = (descBlock.text() || '').replace(/\s+/g, ' ').trim()
		if (!desc) desc = emptyDescription ? '' : name

		const priceContent = $('#price-block span[itemprop="price"]').attr('content')
		const priceText = $('#price-block span[itemprop="price"]').first().text()
		const final = priceContent ? Number(priceContent) : parseRubles(priceText)
		const oldS = $(
			'.item-calc-price s.old-price, #price-block s.action-price, .price s.action-price',
		)
			.first()
			.text()
		const old = oldS ? parseRubles(oldS) : 0
		let base = final
		if (old > 0 && old > final) base = old

		const { discountType, discountValue } = PriceDiscount.fromPrices(
			base,
			Math.min(base, final),
		)

		const imageUrls = CvetutPageParser.collectGalleryImages($)

		return {
			name,
			description: desc,
			price: base,
			discountType,
			discountValue,
			imageUrls,
			isActive: true,
		}
	}

	static parseListingCard(
		$el: Cheerio<any>,
		$: ReturnType<typeof load>,
	): {
		url: string
		name: string
		description: string
		price: number
		discountType: DiscountType
		discountValue: string
		imageUrls: string[]
	} | null {
		const href =
			$el.find('a.full-link').attr('href') ||
			$el.find('.item-title a').attr('href') ||
			$el.find('.item-photo a').attr('href')
		if (!href) return null
		const url = CvetutUrls.abs(href)
		if (!url || !CvetutUrls.isCatalogPath(new URL(url).pathname)) return null

		const name = (
			$el.find('.item-title a').first().text() ||
			$el.find('img[alt]').attr('alt') ||
			''
		).trim()
		if (!name) return null

		const descrSpan = $el.find('.item-photo .item-descr').first().text().trim()
		const descrLong = $el.find('.item-photo span.item-descr p').first()?.text()?.trim() || ''
		const description = [descrSpan, descrLong].filter(Boolean).join('\n\n').trim()

		const oldP = $el.find('.item-price s.action-price').first().text()
		const finalAttr = $el.find('.item-price span[itemprop="price"]').attr('content')
		const finalT = $el.find('.item-price span[itemprop="price"]').first().text()
		const final = finalAttr ? Number(finalAttr) : parseRubles(finalT)
		const old = oldP ? parseRubles(oldP) : 0
		let base = final
		if (old > 0 && old > final) base = old
		const pctTxt = $el.find('.item-price .action-pocent').first().text()
		let discountType: DiscountType = 'NONE'
		let discountValue = '0.00'
		if (old > 0 && final < old) {
			const m = pctTxt.match(/-?\s*(\d+)\s*%/)
			if (m) {
				const p = Number(m[1])
				const fromPct = base * (1 - p / 100)
				if (Math.abs(fromPct - final) <= 2) {
					discountType = 'PERCENT'
					discountValue = p.toFixed(2)
				} else {
					const d = PriceDiscount.fromPrices(base, final)
					discountType = d.discountType
					discountValue = d.discountValue
				}
			} else {
				const d = PriceDiscount.fromPrices(base, final)
				discountType = d.discountType
				discountValue = d.discountValue
			}
		}

		const imgs: string[] = []
		const seen = new Set<string>()
		for (const sel of ['.item-photo img[itemprop="image"]', '.item-photo img[src]']) {
			const src = $el.find(sel).first().attr('src')
			if (!src) continue
			const abs = CvetutUrls.abs(src.startsWith('/') ? src : `/${src}`)
			if (abs && !seen.has(abs)) {
				seen.add(abs)
				imgs.push(abs)
			}
			if (imgs.length >= MAX_IMAGES) break
		}

		return {
			url,
			name,
			description,
			price: base,
			discountType,
			discountValue,
			imageUrls: imgs.slice(0, MAX_IMAGES),
		}
	}

	static extractPagerUrls(html: string, currentUrl: string): string[] {
		const $ = load(html)
		const out = new Set<string>()
		const basePath = new URL(currentUrl)
		const pathOnly = basePath.pathname

		$('.pager-item[href], .pager-item-next a[href]').each((_, el) => {
			const href = $(el).attr('href')
			if (!href) return
			const u = CvetutUrls.abs(href)
			if (!u) return
			const nu = new URL(u)
			if (nu.pathname !== pathOnly && !nu.pathname.startsWith(pathOnly + '/')) return
			out.add(u.split('#')[0])
		})
		return [...out]
	}

	static extractMenuCatalogUrls(html: string): string[] {
		const $ = load(html)
		const out = new Set<string>()
		$('#main-menu a[href], .footer-info-catalog a[href]').each((_, el) => {
			const href = $(el).attr('href')
			const u = CvetutUrls.abs(href ?? '')
			if (!u) return
			const p = new URL(u).pathname
			if (!CvetutUrls.isCatalogPath(p)) return
			out.add(u.split('#')[0])
		})
		return [...out]
	}

	static extractListingLinks(html: string): string[] {
		const $ = load(html)
		const out = new Set<string>()
		$('.catalog-list-item').each((_, node) => {
			const card = CvetutPageParser.parseListingCard($(node), $)
			if (card) out.add(card.url.split('#')[0])
		})
		return [...out]
	}
}

// ---------------------------------------------------------------------------
// Категории и равномерное распределение товаров
// ---------------------------------------------------------------------------

class CvetutCategoryPlanner {
	static targetCategories(): ScrapedCategory[] {
		if (TARGET_CATEGORY_NAMES.length !== MAX_CATEGORIES) {
			throw new Error(`Ожидается ${MAX_CATEGORIES} категорий в TARGET_CATEGORY_NAMES`)
		}
		const used = new Set<string>()
		const out: ScrapedCategory[] = []
		for (let i = 0; i < TARGET_CATEGORY_NAMES.length; i++) {
			const name = TARGET_CATEGORY_NAMES[i]!
			let slug = slugFromCategoryName(name)
			if (!slug) slug = `category-${i}`
			let base = slug
			let n = 0
			while (used.has(slug)) {
				n++
				slug = `${base}-${n}`
			}
			used.add(slug)
			out.push({ name, slug, sortOrder: i })
		}
		return out
	}

	/** Индекс 0..9 по пути товара на сайте (приоритет сверху вниз). */
	static classifyProductPathname(pathname: string): number {
		const segs = pathname
			.replace(/^\/+|\/+$/g, '')
			.split('/')
			.filter(Boolean)
		const first = segs[0] ?? ''
		const p = pathname.toLowerCase()

		if (first === 'actions') return 3
		if (first === 'v-nalicii') return 4
		if (first === 'cvetocnye-kompozicii') return 5
		if (first === 'korziny-iz-tsvetov-i-fruktov') return 6
		if (first === 'gorshechnye-tsvety') return 7
		if (first === 'shary') return 8
		if (first === 'svadebnaya-floristika' || first === 'traurnye-tsvety') return 9

		if (first === 'tsvety') {
			if (p.includes('/rozy') || p.endsWith('/rozy')) return 0
			if (p.includes('pionovidnye')) return 0
			if (p.includes('/piony') || p.includes('pion')) return 1
			return 2
		}

		return 2
	}

	static distributeProductsEvenly(
		raw: ProductWithPath[],
		categorySlugs: string[],
		maxTotal: number,
	): Omit<ScrapedProduct, 'slug'>[] {
		const buckets: Omit<ScrapedProduct, 'slug'>[][] = Array.from(
			{ length: MAX_CATEGORIES },
			() => [],
		)
		for (const p of raw) {
			const idx = CvetutCategoryPlanner.classifyProductPathname(p._sourcePath)
			const slug = categorySlugs[idx] ?? categorySlugs[2]!
			const { _sourcePath: _, ...rest } = p
			buckets[idx]!.push({ ...rest, categorySlug: slug })
		}

		const out: Omit<ScrapedProduct, 'slug'>[] = []
		const ptr = Array(MAX_CATEGORIES).fill(0)
		let safety = 0
		while (out.length < maxTotal) {
			let added = false
			for (let i = 0; i < MAX_CATEGORIES && out.length < maxTotal; i++) {
				const b = buckets[i]!
				if (ptr[i]! < b.length) {
					out.push(b[ptr[i]!]!)
					ptr[i]!++
					added = true
				}
			}
			if (!added) break
			safety++
			if (safety > maxTotal) break
		}
		return out
	}

	static assignProductSlugs(products: Omit<ScrapedProduct, 'slug'>[]): ScrapedProduct[] {
		const used = new Set<string>()
		return products.map((p) => {
			let base = slugFromCategoryName(p.name)
			if (!base) base = 'tovar'
			let slug = base
			let n = 0
			while (used.has(slug)) {
				n++
				slug = `${base}-${n}`
			}
			used.add(slug)
			return { ...p, slug }
		})
	}
}

// ---------------------------------------------------------------------------
// Основной обход каталога и запись JSON
// ---------------------------------------------------------------------------

class CvetutCatalogScraper {
	private readonly visited = new Set<string>()
	private readonly queueTsvety: string[] = []
	private readonly queueOther: string[] = []
	private readonly seenQueue = new Set<string>()
	private readonly productsByUrl = new Map<string, ProductWithPath>()
	private readonly http: CvetutHttpClient

	private processed = 0
	private batchNo = 0
	private nextFetchAfter = 0

	constructor(
		private readonly opts: CliOptions,
		private readonly log: ScrapeCvetutLogger,
	) {
		this.http = new CvetutHttpClient(log)
	}

	private enqueue(url: string): void {
		const u = url.split('#')[0]
		if (this.seenQueue.has(u)) return
		this.seenQueue.add(u)
		const p = new URL(u).pathname
		if (!CvetutUrls.isCatalogPath(p)) return
		if (p.replace(/^\/+|\/+$/g, '').startsWith('tsvety')) this.queueTsvety.push(u)
		else this.queueOther.push(u)
	}

	private dequeue(): string | undefined {
		return this.queueTsvety.shift() ?? this.queueOther.shift()
	}

	private async throttle(): Promise<void> {
		if (this.opts.delayMs <= 0) return
		const now = Date.now()
		if (now < this.nextFetchAfter) await sleep(this.nextFetchAfter - now)
		this.nextFetchAfter = Date.now() + this.opts.delayMs
	}

	private async processOne(pageUrl: string): Promise<void> {
		await this.throttle()
		let html: string
		try {
			html = await this.http.fetchHtml(pageUrl, 4)
		} catch (e) {
			this.log.warn('Не удалось загрузить страницу после повторов', {
				url: pageUrl,
				err: e instanceof Error ? e.message : String(e),
			})
			return
		}
		const $ = load(html)
		const productKey = CvetutUrls.canonicalProductUrl(pageUrl)
		const productPath = new URL(productKey).pathname
		const isProduct = Boolean($('.bouqets-view').length)
		this.log.debug('страница', {
			path: new URL(pageUrl).pathname,
			тип: isProduct ? 'товар' : 'листинг',
		})

		if (isProduct) {
			const fromDetail = CvetutPageParser.parseProductPage(html, this.opts.emptyDescription)
			if (fromDetail) {
				const prev = this.productsByUrl.get(productKey)
				const description = (() => {
					if (this.opts.emptyDescription) return ''
					const d = fromDetail.description
					const p = prev?.description ?? ''
					if (d.length >= p.length) return d
					return p || d || prev?.name || fromDetail.name
				})()
				const uniqImgs = [
					...new Set([...(fromDetail.imageUrls ?? []), ...(prev?.imageUrls ?? [])]),
				]
					.sort(
						(a, b) =>
							(a.includes('/thumbs/') ? 1 : 0) - (b.includes('/thumbs/') ? 1 : 0),
					)
					.slice(0, MAX_IMAGES)

				const merged: ProductWithPath = {
					...fromDetail,
					description,
					imageUrls: uniqImgs.length ? uniqImgs : fromDetail.imageUrls,
					_sourcePath: productPath,
				}
				this.productsByUrl.set(productKey, merged)
				this.log.debug('карточка товара обновлена', {
					name: merged.name,
					images: merged.imageUrls.length,
					price: merged.price,
				})
			}
			return
		}

		for (const link of CvetutPageParser.extractListingLinks(html)) this.enqueue(link)

		for (const pu of CvetutPageParser.extractPagerUrls(html, pageUrl)) this.enqueue(pu)

		for (const item of $('.catalog-list-item')) {
			const card = CvetutPageParser.parseListingCard($(item), $)
			if (!card) continue
			const pKey = CvetutUrls.canonicalProductUrl(card.url)
			const srcPath = new URL(pKey).pathname

			const emptyDesc = this.opts.emptyDescription ? '' : card.description.trim() || card.name
			const p: ProductWithPath = {
				name: card.name,
				description: emptyDesc,
				price: card.price,
				discountType: card.discountType,
				discountValue: card.discountValue,
				imageUrls: card.imageUrls,
				isActive: true,
				_sourcePath: srcPath,
			}

			const prev = this.productsByUrl.get(pKey)
			if (!prev) {
				this.productsByUrl.set(pKey, p)
			} else {
				if (
					!this.opts.emptyDescription &&
					card.description &&
					card.description.length > (prev.description?.length ?? 0)
				) {
					prev.description = card.description.trim() || prev.description
				}
				if (card.imageUrls.length > prev.imageUrls.length) prev.imageUrls = card.imageUrls
				if (prev.price <= 0 && card.price > 0) {
					prev.price = card.price
					prev.discountType = card.discountType
					prev.discountValue = card.discountValue
				}
			}
			this.enqueue(card.url)
		}
	}

	private elapsedSec(t0: number): string {
		return ((Date.now() - t0) / 1000).toFixed(1)
	}

	async run(): Promise<void> {
		const t0 = Date.now()
		const elapsedSec = () => this.elapsedSec(t0)

		this.log.info('Старт парсера', {
			outDir: this.opts.outDir,
			delayMs: this.opts.delayMs,
			concurrency: this.opts.concurrency,
			maxUrls: Number.isFinite(this.opts.maxUrls) ? this.opts.maxUrls : '∞',
			emptyDescription: this.opts.emptyDescription,
			verbose: this.opts.verbose,
			quiet: this.opts.quiet,
		})

		await fs.mkdir(this.opts.outDir, { recursive: true })

		const homeHtml = await this.http.fetchHtml(`${BASE}/`, 4)
		const menuLinks = CvetutPageParser.extractMenuCatalogUrls(homeHtml)
		this.log.info('Главная загружена', { linksFromMenu: menuLinks.length })
		for (const u of menuLinks) this.enqueue(u)

		for (const pathSeg of STATIC_SEED_PATHS) {
			this.enqueue(`${BASE}${pathSeg}`)
		}

		this.log.info('Очередь после сидов', {
			tsvety: this.queueTsvety.length,
			other: this.queueOther.length,
			seen: this.seenQueue.size,
		})

		while (this.processed < this.opts.maxUrls && this.productsByUrl.size < MAX_RAW_PRODUCTS) {
			const batch: string[] = []
			while (batch.length < this.opts.concurrency) {
				const u = this.dequeue()
				if (!u) break
				const key = u.split('#')[0]
				if (this.visited.has(key)) continue
				this.visited.add(key)
				batch.push(key)
			}
			if (batch.length === 0) break

			this.batchNo++
			await AsyncTaskPool.run(batch, this.opts.concurrency, async (u) => {
				await this.processOne(u)
				this.processed++
			})

			this.log.progress('Прогресс', {
				batch: this.batchNo,
				processed: this.processed,
				visited: this.visited.size,
				queueTsvety: this.queueTsvety.length,
				queueOther: this.queueOther.length,
				rawProducts: this.productsByUrl.size,
				sec: elapsedSec(),
			})
		}

		let stopReason = 'очередь пуста'
		if (this.processed >= this.opts.maxUrls)
			stopReason = `достигнут лимит --max-urls (${this.opts.maxUrls})`
		else if (this.productsByUrl.size >= MAX_RAW_PRODUCTS)
			stopReason = `достигнут лимит сырых товаров (${MAX_RAW_PRODUCTS})`

		this.log.info('Обход остановлен', { reason: stopReason, sec: elapsedSec() })

		const catList = CvetutCategoryPlanner.targetCategories()
		const categorySlugs = catList.map((c) => c.slug)
		const rawList = [...this.productsByUrl.values()]
		const distributed = CvetutCategoryPlanner.distributeProductsEvenly(
			rawList,
			categorySlugs,
			MAX_PRODUCTS,
		)
		const productList = CvetutCategoryPlanner.assignProductSlugs(distributed)

		await fs.writeFile(
			path.join(this.opts.outDir, 'categories.json'),
			JSON.stringify(catList, null, 2),
			'utf8',
		)
		await fs.writeFile(
			path.join(this.opts.outDir, 'products.json'),
			JSON.stringify(productList, null, 2),
			'utf8',
		)

		this.log.summary('Готово', {
			categories: catList.length,
			productsInJson: productList.length,
			rawProductsBeforeCut: rawList.length,
			visitedUrls: this.visited.size,
			batches: this.batchNo,
			sec: elapsedSec(),
			outDir: this.opts.outDir,
			files: 'categories.json, products.json',
		})
	}
}

// ---------------------------------------------------------------------------
// Точка входа
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	const opts = ScrapeCvetutCli.parse(process.argv)
	const log = new ScrapeCvetutLogger(opts)
	const scraper = new CvetutCatalogScraper(opts, log)
	await scraper.run()
}

main().catch((e) => {
	const log = new ScrapeCvetutLogger(ScrapeCvetutCli.parse(process.argv))
	log.error('Фатальная ошибка', { err: e instanceof Error ? e.message : String(e) })
	if (e instanceof Error && e.stack) console.error(e.stack)
	process.exit(1)
})
