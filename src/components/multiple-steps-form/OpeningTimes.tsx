import React, { useState } from 'react';
import styles from './form.module.scss';
import { FormData } from '@/types/FormData';
import ReviewSubmit from './ReviewSubmit';

interface OpeningTimesProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    nextStep: () => void;
    prevStep: () => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OpeningTimes: React.FC<OpeningTimesProps> = ({
	formData,
	setFormData,
	nextStep,
	prevStep,
}) => {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
		setFormData((prev) => ({
			...prev,
			openingTimes: {
				...prev.openingTimes,
				[day]: {
					...prev.openingTimes[day],
					[type]: value,
				},
			},
		}));
	};

	const handleDayToggle = (day: string) => {
		setFormData((prev) => ({
			...prev,
			openingTimes: {
				...prev.openingTimes,
				[day]: prev.openingTimes[day]
					? undefined
					: { start: '', end: '' }, // Reset times when enabling
			},
		}));
	};

	const validateTimes = () => {
		const newErrors: Record<string, string> = {};
		daysOfWeek.forEach((day) => {
			const { start, end } = formData.openingTimes[day] || {};
			if (start && end && start >= end) {
				newErrors[day] = 'Start time must be earlier than end time.';
			}
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateTimes()) {
			nextStep();
		}
	};

	return (
		<div className={styles.form__Container}>
			<div className={styles.form__textContainer}>
				<h2>Opening Times</h2>
				{daysOfWeek.map((day) => (
					<div key={day} className={`${styles.form__divContainer} ${!formData.openingTimes[day] ? styles['form__day--disabled'] : ''}`}>
						<div className={styles.form__dayToggle}>
							<input
								type="checkbox"
								checked={!!formData.openingTimes[day]}
								onChange={() => handleDayToggle(day)}
								className={styles['form__checkbox']}
							/>
							<label className={styles.form__label}>{day}</label>
						</div>
						{!formData.openingTimes[day] ? (
							<span className={styles.form__closedLabel}>Closed</span>
						) : (
							<div className={styles.form__timeRow}>
								<span className={styles.form__timeLabel}>From</span>
								<input
									type="time"
									value={formData.openingTimes[day]?.start || ''}
									onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
									className={styles['form__input--time']}
								/>
								<span className={styles.form__timeSeparator}>to</span>
								<input
									type="time"
									value={formData.openingTimes[day]?.end || ''}
									onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
									className={styles['form__input--time']}
								/>
							</div>
						)}
						{errors[day] && (
							<span className={styles.form__error} role="alert">
								{errors[day]}
							</span>
						)}
					</div>
				))}
				<div className={styles.form__buttonContainer}>
					<button className={styles.nextBtn} onClick={prevStep}>
						Back
					</button>
					<button className={styles.nextBtn} onClick={handleNext}>
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
				/>
			</div>
		</div>
	);
};

export default OpeningTimes;
