import React from "react";
import styles from "./form.module.scss";

interface FormInputProps {
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; 
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={styles.form__div}>
      <label className={styles.form__label}>{label}</label>
      <input
        className={`${styles.form__input} ${className}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default FormInput;
