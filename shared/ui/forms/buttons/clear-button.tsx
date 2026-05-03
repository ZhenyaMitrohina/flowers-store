import { X } from 'lucide-react'

interface FormClearButtonProps {
	onClick: VoidFunction
	className?: string
}

export const FormClearButton: React.FC<FormClearButtonProps> = ({ onClick, className }) => {
	return (
		<button onClick={onClick} tabIndex={-1} className={className}>
			<X />
		</button>
	)
}
