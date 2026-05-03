import s from '../styles/forms.module.css'

export const FormFieldDescription = ({ children }: { children: React.ReactNode }) => {
	return <p className={s.formField__description}>{children}</p>
}
