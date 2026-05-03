'use client'

import { Controller } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { Image } from '@/shared/ui/image'
import { BaseFormField } from '../base-form-field'
import { useFormField } from '../hooks/use-form-field'
import s from '../styles/forms.module.css'
import type { FormSelectProps } from '../types/form.types'

export const FormSelect: React.FC<FormSelectProps> = ({
	name,
	placeholder = 'Выберите...',
	label,
	labelStyle,
	required,
	endAdorment,
	description,
	items,
	...props
}) => {
	const { control, error } = useFormField(name)

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
					{endAdorment ? (
						<div className='flex gap-[15px]'>
							<Select onValueChange={field.onChange} value={field.value} {...props}>
								<SelectTrigger className={cn(s.formField__input, error && s.formField__input__error, 'w-full')}>
									<SelectValue placeholder={placeholder} className='flex-row' />
								</SelectTrigger>
								<SelectContent>
									{items.map(item => (
										<SelectItem key={item.value} value={item.value}>
											<div className='flex items-center gap-3'>
												{item.icon && <item.icon />}
												{item.iconUrl && (
													<Image
														src={item.iconUrl}
														className='rounded-full aspect-square'
														fallback='?'
													/>
												)}
												<div className='flex flex-col'>
													<span className='text-sm font-medium'>{item.label}</span>
													<span className='text-sm text-muted-foreground'>
														{item.description}
													</span>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{endAdorment}
						</div>
					) : (
						<Select onValueChange={field.onChange} value={field.value} {...props}>
							<SelectTrigger className={cn(s.formField__input, error && s.formField__input__error, 'h-8! w-full')}>
								{field.value ? items.find(item => item.value === field.value)?.label : placeholder}
							</SelectTrigger>
							<SelectContent>
								{items.map(item => (
									<SelectItem key={item.value} value={item.value}>
										<div className='flex items-center gap-3'>
											{item.icon && <item.icon />}
											{item.iconUrl && (
												<Image
													src={item.iconUrl}
													className='rounded-full aspect-square'
													fallback='?'
												/>
											)}
											<div className='flex flex-col'>
												<span className='text-sm font-medium'>{item.label}</span>
												<span className='text-sm text-muted-foreground'>
													{item.description}
												</span>
											</div>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</BaseFormField>
			)}
		></Controller>
	)
}
