import React from 'react';
import styles from './form.module.scss';

interface FormInputProps {
	label: string;
	type: string;
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	className?: string;
	error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
	label,
	type,
	placeholder,
	value,
	onChange,
	onBlur,
	className = '',
	error,
}) => {
	return (
		<div className={styles.form__div}>
			<label className={styles.form__label}>{label}</label>
			<input
				className={`${styles.form__input} ${className} ${
					error ? styles['form__input--error'] : ''
				}`}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				aria-invalid={!!error}
				aria-describedby={error ? `${label}-error` : undefined}
			/>
			{error && (
				<span id={`${label}-error`} className={styles.form__error} role="alert">
					{error}
				</span>
			)}
		</div>
	);
};

export default FormInput;
