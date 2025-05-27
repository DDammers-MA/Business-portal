import React, { useEffect, useState } from 'react';
import { FormData } from '@/types/FormData';
import styles from './form.module.scss';
import FormInput from './FormInput';
import ReviewSubmit from './ReviewSubmit';

interface LocationInfoProps {
	formData: FormData;
	setFormData: React.Dispatch<React.SetStateAction<FormData>>;
	nextStep: () => void;
	prevStep: () => void;
}

interface FormErrors {
	place?: string;
	date?: string;
	postal_code?: string;
	addr?: string;
	start_time?: string;
	end_time?: string;
}

interface TouchedFields {
	[key: string]: boolean;
}

const LocationInfo: React.FC<LocationInfoProps> = ({
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
			case 'place':
				return value.trim().length < 5
					? 'Place must be at least 5 characters long.'
					: undefined;
			case 'date':
				return value.trim().length < 10 ? 'Date must be selected' : undefined;
			case 'postal_code':
				return value.trim().length < 5
					? 'postalcode must be at least 5 characters long.'
					: undefined;
			case 'addr':
				return value.trim().length < 5
					? 'address must be at least 5 characters long.'
					: undefined;

			case 'start_time':
				return value.trim().length < 5
					? 'there must be a start time.'
					: undefined;
			case 'end_time':
				return value.trim().length < 5
					? 'there must be an end time.'
					: undefined;

			default:
				return undefined;
		}
	};

	useEffect(() => {
		const currentErrors: FormErrors = {};
		let hasErrors = false;

		const placeError = validateField('place', formData.place);
		if (placeError) {
			currentErrors.place = placeError;
			hasErrors = true;
		}

		const dateError = validateField('date', formData.date);
		if (dateError) {
			currentErrors.date = dateError;
			hasErrors = true;
		}

		const postal_codeError = validateField('postal_code', formData.postal_code);
		if (postal_codeError) {
			currentErrors.postal_code = postal_codeError;
			hasErrors = true;
		}

		const addrError = validateField('addr', formData.addr);
		if (addrError) {
			currentErrors.addr = addrError;
			hasErrors = true;
		}

		if (formData.type === 'event') {
			const start_timeError = validateField('start_time', formData.start_time);
			if (start_timeError) {
				currentErrors.start_time = start_timeError;
				hasErrors = true;
			}

			const end_timeError = validateField('end_time', formData.end_time);
			if (end_timeError) {
				currentErrors.end_time = end_timeError;
				hasErrors = true;
			}
		}

		setErrors(currentErrors);
const requiredFieldsFilled =
	formData.place &&
	formData.date &&
	formData.postal_code &&
	formData.addr &&
	(formData.type !== 'event' ||
		(formData.start_time && formData.end_time));

setIsNextDisabled(hasErrors || !requiredFieldsFilled);
	}, [
		formData.place,
		formData.date,
		formData.postal_code,
		formData.addr,
		formData.start_time,
		formData.end_time,
	]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		field: keyof FormData
	) => {
		const { value } = e.target;
		setFormData({ ...formData, [field]: value });

		// Validate on change to update errors state
		const error = validateField(field, value);
		setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
	};

	// Add handleBlur function
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

	return (
		<div className={styles.form__Container}>
			<div className={styles.form__textContainer}>
				<h2>Location Information</h2>

				<div className={styles.form__divContainer}>
					<FormInput
						label="Place"
						type="text"
						placeholder="Enter Place"
						value={formData.place}
						onChange={(e) => handleChange(e, 'place')}
						onBlur={(e) => handleBlur(e, 'place')}
						className={styles['form__input--title']}
						error={touched.place && errors.place ? errors.place : undefined}
					/>

					<FormInput
						label="Date"
						type="Date"
						placeholder="Enter Date"
						value={formData.date}
						onChange={(e) => handleChange(e, 'date')}
						onBlur={(e) => handleBlur(e, 'date')}
						className={styles['form__input--title']}
						error={touched.date && errors.date ? errors.date : undefined}
					/>
				</div>

				<div className={styles.form__divContainer}>
					<FormInput
						label="Postal code"
						type="text"
						placeholder="Enter Postal code"
						value={formData.postal_code}
						onChange={(e) => handleChange(e, 'postal_code')}
						onBlur={(e) => handleBlur(e, 'postal_code')}
						error={
							touched.postal_code && errors.postal_code
								? errors.postal_code
								: undefined
						}
						className={styles['form__input--title']}
					/>

					<FormInput
						label="Address"
						type="text"
						placeholder="Enter address"
						value={formData.addr}
						onChange={(e) => handleChange(e, 'addr')}
						onBlur={(e) => handleBlur(e, 'addr')}
						error={touched.addr && errors.addr ? errors.addr : undefined}
						className={styles['form__input--title']}
					/>
				</div>

				{formData.type === "event" &&(
					<div className={styles.form__divContainer}>
						<FormInput
							label="Start time"
							type="time"
							placeholder="Enter Start time"
							value={formData.start_time}
							onChange={(e) => handleChange(e, 'start_time')}
							onBlur={(e) => handleBlur(e, 'start_time')}
							error={
								touched.start_time && errors.start_time
									? errors.start_time
									: undefined
							}
							className={styles['form__input--title']}
						/>

						<FormInput
							label="End time"
							type="time"
							placeholder="Enter End time"
							value={formData.end_time}
							onChange={(e) => handleChange(e, 'end_time')}
							onBlur={(e) => handleBlur(e, 'end_time')}
							error={
								touched.end_time && errors.end_time ? errors.end_time : undefined
							}
							className={styles['form__input--title']}
						/>
					</div>
				)}

			
				
				

				
				<div className={styles.form__buttonContainer}>
					<button className={styles.nextBtn} onClick={prevStep}>
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

export default LocationInfo;
