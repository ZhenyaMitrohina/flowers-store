import { Flower } from 'lucide-react';
import Link from 'next/link';

export const Logo = () => {
	return (
		<Link href='/' className='flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer'>
			<Flower className='w-8 h-8 text-primary' />
			<span className='font-heading text-2xl md:text-3xl font-bold text-primary'>Флория</span>
		</Link>
	)
}