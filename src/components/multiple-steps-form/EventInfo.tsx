import React, { useState, useEffect } from 'react';
import { FormData } from '@/types/FormData';
import styles from './form.module.scss';
import FormInput from './FormInput';
import ReviewSubmit from './ReviewSubmit';

interface EventInfoProps {
	formData: FormData;
	setFormData: React.Dispatch<React.SetStateAction<FormData>>;
	nextStep: () => void;
	prevStep: () => void;
}

interface FormErrors {
	name?: string;
	description?: string;
	budget?: string;
}

interface TouchedFields {
	[key: string]: boolean;
}

const EventInfo: React.FC<EventInfoProps> = ({
	formData,
	setFormData,
	nextStep,
	prevStep,
}) => {
	const [errors, setErrors] = useState<FormErrors>({});
	const [isNextDisabled, setIsNextDisabled] = useState(true);
	const [touched, setTouched] = useState<TouchedFields>({});

	const validateField = (
		name: keyof FormData,
		value: string
	): string | undefined => {
		switch (name) {
			case 'name':
				return value.trim().length < 5
					? 'Name must be at least 5 characters long.'
					: undefined;
			case 'description':
				return value.trim().length < 10
					? 'Description must be at least 10 characters long.'
					: undefined;
			case 'budget':
				const numValue = parseFloat(value);
				return isNaN(numValue) || numValue <= 0
					? 'Budget must be a positive number.'
					: undefined;
			default:
				return undefined;
		}
	};

	useEffect(() => {
		const currentErrors: FormErrors = {};
		let hasErrors = false;

		const nameError = validateField('name', formData.name);
		if (nameError) {
			currentErrors.name = nameError;
			hasErrors = true;
		}

		const descriptionError = validateField('description', formData.description);
		if (descriptionError) {
			currentErrors.description = descriptionError;
			hasErrors = true;
		}

		const budgetError = validateField('budget', formData.budget);
		if (budgetError) {
			currentErrors.budget = budgetError;
			hasErrors = true;
		}

		setErrors(currentErrors);
		setIsNextDisabled(
			hasErrors || !formData.name || !formData.description || !formData.budget
		);
	}, [formData.name, formData.description, formData.budget]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		field: keyof FormData
	) => {
		const { value } = e.target;
		setFormData({ ...formData, [field]: value });
		const error = validateField(field, value);
		setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
	};

	const handleBlur = (
		e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
		field: keyof FormData
	) => {
		setTouched((prevTouched) => ({ ...prevTouched, [field]: true }));
		// Optional: Trigger validation on blur as well if needed
		// const { value } = e.target;
		// const error = validateField(field, value);
		// setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const blobUrl = URL.createObjectURL(file);
			setFormData({ ...formData, image_url: blobUrl, image_file: file });
		} else {
			setFormData({ ...formData, image_url: '', image_file: undefined });
		}
	};

	return (
		<div className={styles.form__Container}>
			<div className={styles.form__textContainer}>
				<h2 className={styles.form__infoTitle}>Event Information</h2>

				<FormInput
					label="Name"
					type="text"
					placeholder="Enter name"
					value={formData.name}
					onChange={(e) => handleChange(e, 'name')}
					onBlur={(e) => handleBlur(e, 'name')}
					className={styles['form__input--title']}
					error={touched.name && errors.name ? errors.name : undefined}
				/>

				<div className={styles.form__div}>
					<label htmlFor="beschrijving" className={styles.form__label}>
						Description
					</label>
					<textarea
						id="beschrijving"
						className={`${styles.form__textarea} ${
							touched.description && errors.description
								? styles['form__textarea--error']
								: ''
						}`}
						placeholder="Enter description"
						value={formData.description}
						onChange={(e) => handleChange(e, 'description')}
						onBlur={(e) => handleBlur(e, 'description')}
						aria-invalid={!!(touched.description && errors.description)}
						aria-describedby={
							touched.description && errors.description
								? `description-error`
								: undefined
						}
					/>
					{touched.description && errors.description && (
						<span
							id="description-error"
							className={styles.form__error}
							role="alert"
						>
							{errors.description}
						</span>
					)}
				</div>

				<div className={styles.form__divContainer}>
					<FormInput
						iconClass="fa-solid fa-euro-sign"
						label="Budget per person"
						type="number"
						placeholder="Enter Budget"
						value={formData.budget}
						onChange={(e) => handleChange(e, 'budget')}
						onBlur={(e) => handleBlur(e, 'budget')}
						className={`${styles['form__input--title']} ${styles['form__input--budget']}`}
						error={touched.budget && errors.budget ? errors.budget : undefined}
					/>

					<div className={`${styles.fileUpload} ${styles.form__input__div}`}>
						<label htmlFor="">Image </label>
						<label htmlFor="imagePicker" className={styles.fileUpload__button}>
							{formData.image_file ? 'Change Image' : 'Upload Image'}
						</label>
						<input
							id="imagePicker"
							type="file"
							accept="image/*"
							className={styles.fileUpload__input}
							onChange={handleFileChange}
						/>
					</div>
				</div>
				<div className={styles.form__buttonContainer}>
					<button className={styles.nextBtn} onClick={prevStep} disabled={true}>
						Back
					</button>
					<button
						className={styles.nextBtn}
						onClick={nextStep}
						disabled={isNextDisabled}
					>
						Next
					</button>
				</div>
			</div>

			<div className={styles.form__previewContainer}>
				<ReviewSubmit
					formData={formData}
					prevStep={function (): void {
						throw new Error('Function not implemented.');
					}}
					submitForm={function (): void {
						throw new Error('Function not implemented.');
					}}
					step={0}
					isSubmitting={false}
					submitError={null}
					handleInputChange={(field, value) => {
						if (typeof value === 'string') {
							setFormData((prevData) => ({ ...prevData, [field]: value }));
							const error = validateField(field, value);
							setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
						}
					}}
				/>
			</div>
		</div>
	);
};

export default EventInfo;
