import type { JSX } from 'react'
import type { DayPickerProps } from 'react-day-picker'
import type { CheckboxProps } from '@radix-ui/react-checkbox'
import type { SelectProps } from '@radix-ui/react-select'
import type { TabsProps } from '@radix-ui/react-tabs'

export type SelectItem = {
	value: string
	label: string
	icon?: React.ElementType
	iconUrl?: string
	description?: string | null
	disabled?: boolean
}

export interface BaseFormFieldProps {
	name: string
	label?: string
	labelStyle?: string
	placeholder?: string
	required?: boolean
	disabled?: boolean
	className?: string
	description?: React.ReactNode
}

export interface FormCheckboxProps
	extends Omit<CheckboxProps, 'name'>, Omit<BaseFormFieldProps, 'label'> {
	label?: string | JSX.Element
}

export interface FormDateInputProps
	extends Omit<DayPickerProps, 'mode' | 'disabled'>, BaseFormFieldProps {
	dateType?: string
	value?: string
	onChange?: (date: string) => void
	mode?: 'single'
}

export interface FormInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>, BaseFormFieldProps {
	mask?: string
}

export interface FormSelectProps extends Omit<SelectProps, 'name'>, BaseFormFieldProps {
	items: SelectItem[]
	endAdorment?: JSX.Element
}

export interface FormTextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>, BaseFormFieldProps {}

export interface FormTabsProps extends Omit<BaseFormFieldProps, 'placeholder'>, TabsProps {
	items: SelectItem[]
}
