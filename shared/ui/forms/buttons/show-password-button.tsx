import { EyeIcon, EyeOffIcon } from 'lucide-react'

interface FormShowPasswordButtonProps {
	onClick: VoidFunction
	showPassword?: boolean
}

export const FormShowPasswordButton: React.FC<FormShowPasswordButtonProps> = ({ onClick, showPassword = false }) => {
	return (
		<button type='button' tabIndex={-1} onClick={onClick}>
			{showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
		</button>
	)
}
