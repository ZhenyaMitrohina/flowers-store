'use client'

import type React from 'react'
import { Controller } from 'react-hook-form'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/utils'
import { useFormField } from '../hooks/use-form-field'
import s from '../styles/forms.module.css'
import type { FormTabsProps } from '../types/form.types'

export const FormTabs: React.FC<FormTabsProps> = ({
	name,
	label,
	labelStyle,
	required,
	items,
	className,
	orientation = 'horizontal',
	disabled,
	...props
}) => {
	const { control, error } = useFormField(name)

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Tabs
					onValueChange={field.onChange}
					defaultValue={field.value}
					value={field.value}
					orientation={orientation}
					className={className}
					{...props}
				>
					<TabsList className={cn('w-full', error && s.formField__input__error)}>
						{items.map(item => (
							<TabsTrigger key={item.value} value={item.value} className='w-full' disabled={disabled}>
								{item.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			)}
		/>
	)
}
