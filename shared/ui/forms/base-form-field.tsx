import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { FormErrorMessage, FormFieldDescription, FormRequiredSymbol } from './feedback'
import s from './styles/forms.module.css'

interface BaseFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
	name: string
	label?: string
	labelStyle?: string
	required?: boolean
	className?: string
	error?: string | null
	children: ReactNode
	description?: React.ReactNode
}

const FormFieldFooter = ({ error, description }: Pick<BaseFormFieldProps, 'error' | 'description'>) => {
	return (
		<div className='flex items-center gap-1 justify-between'>
			{error && <FormErrorMessage>{error}</FormErrorMessage>}
			{description && <FormFieldDescription>{description}</FormFieldDescription>}
		</div>
	)
}

export const BaseFormField: React.FC<BaseFormFieldProps> = ({
	label,
	labelStyle,
	required,
	className,
	error,
	children,
	description,
	...props
}) => {
	return (
		<div className={cn(s.formField, className)} {...props}>
			{label && (
				<p className={labelStyle}>
					{label} {required && <FormRequiredSymbol />}
				</p>
			)}
			{children}
			<FormFieldFooter error={error} description={description} />
		</div>
	)
}
