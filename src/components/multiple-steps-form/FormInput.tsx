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
	iconClass?: string;
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
	iconClass,
}) => {
	return (
	    <div className={styles.form__div}>
            <label className={styles.form__label}>{label}</label>
            <div className={styles.form__inputWrapper}>
                {iconClass && <i className={`${styles.form__icon} ${iconClass}`}></i>}
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
                    aria-describedby={error ? `${label}-error` : undefined}  {...(type === 'number' ? { step: '0.01' } : {})}
                />
            </div>
            {error && (
                <span id={`${label}-error`} className={styles.form__error} role="alert">
                    {error}
                </span>
            )}
        </div>
	);
};

export default FormInput;
