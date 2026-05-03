import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/shared/lib/utils'

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' })

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Магазин цветов',
	description: 'Дипломная работа',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='ru'
			className={cn(
				'h-full',
				'antialiased',
				geistSans.variable,
				geistMono.variable,
				'font-sans',
				inter.variable,
				geistHeading.variable,
			)}
		>
			<body className='min-h-full'>{children}</body>
		</html>
	)
}
