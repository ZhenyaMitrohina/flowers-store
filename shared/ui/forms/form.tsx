import type { FormHTMLAttributes } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'

type FormPropsWithoutSubmit = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>

interface FormProps<T extends object> extends FormPropsWithoutSubmit {
	schema: UseFormReturn<T>
	onSubmit: (data: T) => void | Promise<void>
}

export const Form = <T extends object>({ children, schema, onSubmit, ...props }: FormProps<T>) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.key === 'Enter') {
			schema.handleSubmit(onSubmit)()
		}
	}

	return (
		<FormProvider {...schema}>
			<form onSubmit={schema.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} {...props}>
				{children}
			</form>
		</FormProvider>
	)
}
