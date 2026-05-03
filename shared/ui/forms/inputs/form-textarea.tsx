import { Controller } from 'react-hook-form'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { BaseFormField } from '../base-form-field'
import { FormClearButton } from '../buttons'
import { useFormField } from '../hooks/use-form-field'
import type { FormTextareaProps } from '../types/form.types'
import s from '../styles/forms.module.css'

export const FormTextarea: React.FC<FormTextareaProps> = ({
	name,
	label,
	labelStyle,
	required,
	className,
	description,
	...props
}) => {
	const { control, error, value, onClickClearButton } = useFormField(name)

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<BaseFormField
					name={name}
					label={label}
					labelStyle={labelStyle}
					required={required}
					description={description}
					error={error}
				>
					<Textarea
						className={cn(s.formField__input, error && s.formField__input__error)}
						{...field}
						{...props}
					/>
					<div className={cn(s.formField__buttons, 'items-start my-3')}>
						{value && <FormClearButton onClick={onClickClearButton} />}
					</div>
				</BaseFormField>
			)}
		></Controller>
	)
}
