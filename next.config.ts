import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'utfs.io', pathname: '/**' },
			{ protocol: 'https', hostname: 'uploadthing.com', pathname: '/**' },
			{ protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
			{ protocol: 'https', hostname: 'цветут.рф', pathname: '/**' },
			{ protocol: 'https', hostname: 'xn--b1ag3baeo.xn--p1ai', pathname: '/**' },
			{ protocol: 'https', hostname: 'mwpcsnmjp3.ufs.sh', pathname: '/**' },
		],
	},
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID,
		YOOKASSA_API_TOKEN: process.env.YOOKASSA_API_TOKEN,
	},
}

export default nextConfig
