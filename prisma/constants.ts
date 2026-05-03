export const categories = [
	{ name: 'Цветы', slug: 'flowers', sortOrder: 0 },
	{ name: 'Шары', slug: 'balloons', sortOrder: 1 },
	{ name: 'Игрушки', slug: 'toys', sortOrder: 2 },
] as const

export const productImages = {
	flowers: {
		roseEcvador: [
			'https://цветут.рф/web/upload/bouqets/15-roz-ekvador-50-sm-akcia.jpg',
			'https://цветут.рф/web/upload/bouqets/15-roz-ekvador-50-sm-akcia-0.jpg',
			'https://цветут.рф/web/upload/bouqets/15-roz-ekvador-50-sm-akcia-1.jpg',
			'https://цветут.рф/web/upload/bouqets/15-roz-ekvador-50-sm-akcia-2.jpg',
			'https://цветут.рф/web/upload/bouqets/15-roz-ekvador-50-sm-akcia-3.jpg',
		],
		gortenzia: [
			'https://цветут.рф/web/upload/bouqets/11-gortenzij-akcia.jpg',
			'https://цветут.рф/web/upload/bouqets/11-gortenzij-akcia-0.jpg',
			'https://цветут.рф/web/upload/bouqets/11-gortenzij-miks.jpg',
		],
		alstroemeria: [
			'https://цветут.рф/web/upload/bouqets/25-alstromerij-v-korobke-akcia.jpg',
			'https://цветут.рф/web/upload/bouqets/35-alstromerij-v-korobke-akcia.jpg',
		],
	},
	balloons: {
		chrome: ['https://цветут.рф/web/upload/bouqets/oblako_sharov_khrom.jpg'],
	},
	toys: {
		bear: [
			'https://static.vecteezy.com/system/resources/previews/024/589/109/non_2x/teddy-bear-with-ai-generated-free-png.png',
		],
	},
} as const

export const products = {
	flowers: [
		{
			name: 'Роза Эквадор',
			description: 'Роза Эквадор',
			price: 4999.0,
			imageUrls: productImages.flowers.roseEcvador,
			discountType: 'NONE',
			isActive: true,
			discountValue: '0',
		},
		{
			name: 'Гортензия',
			description: 'Гортензия',
			price: 3599.0,
			imageUrls: productImages.flowers.gortenzia,
			discountType: 'NONE',
			isActive: true,
			discountValue: '0',
		},
		{
			name: 'Альстромерия',
			description: 'Альстромерия',
			price: 1299.0,
			imageUrls: productImages.flowers.alstroemeria,
			discountType: 'NONE',
			isActive: true,
			discountValue: '0',
		},
	],
	balloons: [
		{
			name: 'Хром',
			description: 'Хром',
			price: 159.0,
			imageUrls: productImages.balloons.chrome,
			discountType: 'NONE',
			isActive: true,
			discountValue: '0',
		},
	],
	toys: [
		{
			name: 'Медведь',
			description: 'Медведь',
			price: 4999.0,
			imageUrls: productImages.toys.bear,
			discountType: 'NONE',
			isActive: true,
			discountValue: '0',
		},
	],
} as const
