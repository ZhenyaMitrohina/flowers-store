import s from '../styles/forms.module.css'

export const FormErrorMessage: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <p className={s.formField__error}>{children}</p>
}
