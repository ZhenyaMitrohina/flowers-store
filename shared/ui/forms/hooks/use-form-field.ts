import { useFormContext } from 'react-hook-form'

export const useFormField = (name: string) => {
	const form = useFormContext()

	const {
		register,
		formState: { errors },
		watch,
		setValue,
		control,
		trigger
	} = form

	const value = watch(name)
	const error = errors[name]?.message as string

	const checkBoxId = `${name}-form-checkbox`

	const onClickClearButton = () => {
		setValue(name, '', { shouldValidate: true })
	}

	return {
		register,
		value,
		error,
		setValue,
		control,
		trigger,
		form,
		onClickClearButton,
		checkBoxId
	}
}
