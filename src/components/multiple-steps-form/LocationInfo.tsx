import React from 'react';
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

const LocationInfo: React.FC<LocationInfoProps> = ({
	formData,
	setFormData,
	nextStep,
	prevStep,
}) => {
	return (
		<div className={styles.form__Container}>
			<div className={styles.form__textContainer}>
				<h2>Location Information</h2>

				<div className={styles.form__divContainer}>
					<FormInput
						label="Address"
						type="text"
						placeholder="Enter address"
						value={formData.addr}
						onChange={(e) => setFormData({ ...formData, addr: e.target.value })}
						className={styles['form__input--title']}
					/>

					<FormInput
						label="Date"
						type="Date"
						placeholder="Enter Date"
						value={formData.date}
						onChange={(e) => setFormData({ ...formData, date: e.target.value })}
						className={styles['form__input--title']}
					/>
				</div>

				<div className={styles.form__divContainer}>
					<FormInput
						label="Postal code"
						type="text"
						placeholder="Enter Postal code"
						value={formData.postal_code}
						onChange={(e) =>
							setFormData({ ...formData, postal_code: e.target.value })
						}
						className={styles['form__input--title']}
					/>

					<FormInput
						label="Place"
						type="text"
						placeholder="Enter Place"
						value={formData.place}
						onChange={(e) =>
							setFormData({ ...formData, place: e.target.value })
						}
						className={styles['form__input--title']}
					/>
				</div>

				<div className={styles.form__divContainer}>
					<FormInput
						label="Start time"
						type="text"
						placeholder="Enter Start time"
						value={formData.start_time}
						onChange={(e) =>
							setFormData({ ...formData, start_time: e.target.value })
						}
						className={styles['form__input--title']}
					/>

					<FormInput
						label="End time"
						type="text"
						placeholder="Enter End time"
						value={formData.end_time}
						onChange={(e) =>
							setFormData({ ...formData, end_time: e.target.value })
						}
						className={styles['form__input--title']}
					/>
				</div>

				<div className={styles.form__buttonContainer}>
					<button className={styles.nextBtn} onClick={prevStep}>
						Back
					</button>
					<button className={styles.nextBtn} onClick={nextStep}>
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

export default LocationInfo;
