import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'
import { BaseFormField } from '../base-form-field'
import { FormClearButton, FormShowPasswordButton } from '../buttons'
import { useFormField } from '../hooks/use-form-field'
import s from '../styles/forms.module.css'
import type { FormInputProps } from '../types/form.types'

export const FormInput: React.FC<FormInputProps> = ({
	name,
	label,
	labelStyle,
	required,
	className,
	description,
	mask,
	type = 'text',
	...props
}) => {
	const { control, value, error, setValue, onClickClearButton } = useFormField(name)
	const [showPassword, setShowPassword] = useState(false)

	const onClickShowPassword = () => setShowPassword(!showPassword)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setValue(name, value, { shouldValidate: true })
	}

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
					className={className}
					error={error}
					description={description}
				>
					<div className={s.formField__inputWrapper}>
						<Input
							type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
							className={cn(s.formField__input, error && s.formField__input__error)}
							{...field}
							onChange={handleInputChange}
							{...props}
						/>
						<div className={s.formField__buttons}>
							{value && !props.readOnly && !props.disabled && type !== 'number' && (
								<FormClearButton onClick={onClickClearButton} className={s.formField__clearButton} />
							)}
							{type === 'password' && (
								<FormShowPasswordButton showPassword={showPassword} onClick={onClickShowPassword} />
							)}
						</div>
					</div>
				</BaseFormField>
			)}
		></Controller>
	)
}
