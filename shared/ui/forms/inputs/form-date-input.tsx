import type React from 'react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { BaseFormField } from '../base-form-field'
import { useFormField } from '../hooks/use-form-field'
import type { FormDateInputProps } from '../types/form.types'
import s from '../styles/forms.module.css'

export const FormDateInput: React.FC<FormDateInputProps> = ({
	name,
	required,
	labelStyle,
	label,
	dateType = 'dd.MM.yyyy',
	placeholder = 'Выберите дату',
	description,
	className,
	onChange,
	...calendarProps
}) => {
	const [open, setOpen] = useState(false)
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
					className={className}
					error={error}
					description={description}
				>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								type='button'
								variant='outline'
								className={cn(s.formField__input__btnTrigger, !field.value && 'text-muted-foreground')}
							>
								{field.value ? format(field.value, dateType) : placeholder}
								<CalendarIcon className='size-4 ml-auto opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-auto p-0' align='end' side='bottom'>
							<Calendar
								mode='single'
								selected={field.value}
								defaultMonth={field.value}
								onSelect={selectedDate => {
									field.onChange(selectedDate)
									setOpen(false)
								}}
								captionLayout='dropdown'
								{...calendarProps}
							/>
						</PopoverContent>
					</Popover>
				</BaseFormField>
			)}
		/>
	)
}
