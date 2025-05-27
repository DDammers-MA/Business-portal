import React, { useState, useEffect } from 'react';
import { FormData } from '@/types/FormData';
import styles from './review.module.scss';
import style from './form.module.scss';

interface ReviewSubmitProps {
	formData: FormData;
	prevStep: () => void;
	submitForm: () => void;
	step: number;
	isSubmitting: boolean;
	submitError: string | null;
	handleInputChange: (
		field: keyof FormData,
		value: string | boolean | File | undefined
	) => void;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
	formData,
	prevStep,
	submitForm,
	step,
	isSubmitting,
	submitError,
	handleInputChange,
}) => {
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);

	useEffect(() => {
		let objectUrl: string | null = null;

		if (formData.image_file) {
			objectUrl = URL.createObjectURL(formData.image_file);
			setPreviewSrc(objectUrl);
		} else if (formData.image_url) {
			// Use existing URL if no new file is selected
			setPreviewSrc(formData.image_url);
		} else {
			setPreviewSrc(null);
		}

		// Cleanup function to revoke the blob URL
		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [formData.image_file, formData.image_url]); // Re-run if file or URL changes

	// Define background style dynamically
	const cardStyle: React.CSSProperties = previewSrc
		? {
		
				maxWidth: '350px', 
				margin: '20px auto',
				borderRadius: '8px', 
				overflow: 'hidden', 
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)), url(${previewSrc})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				padding: '20px',
				minHeight: '400px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end',
		  }
		: {
		
				maxWidth: '350px',
				margin: '20px auto',
				borderRadius: '8px',
				padding: '20px',
				minHeight: '400px',
				backgroundColor: '#e0e0e0',
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)), url('../../../public/images/placeholder-2-1.png')`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
		  };

	return (
		<div className={styles.preview}>
			<h2 className={styles.preview__title}>Preview in app</h2>
			<div className={styles.preview__Container}>
				<div className={styles.card} style={cardStyle}>
					<div
						className={styles.card__details}
						style={{ color: previewSrc ? 'white' : '#555' }}
					>
						<h5 className={styles.card__title}>{formData.name}</h5>
						<p className={styles.card__place}>
							{formData.place} | {formData.addr}
						</p>
					</div>
				</div>
			</div>

			
		
{(step === 4 || (step === 3 && formData.type === 'event')) && (
				<div className={styles.inputGroup}>
				
					<div className={styles.formControl}>
						<label htmlFor="statusSelect" className={styles.label}>
							Status
						</label>
						<select
							id="statusSelect"
							className={styles.selectInput}
							value={formData.status ?? 'inreview'}
							onChange={(e) => handleInputChange('status', e.target.value)}
						>
							<option value="inreview">Send for review</option>
							<option value="draft">Draft</option>
						</select>
					</div>
				</div>
			)}

			{submitError && <p className={style.errorText}>{submitError}</p>}

			
		
{(step === 4 || (step === 3 && formData.type === 'event')) && (
				<div className={style.form__buttonContainer}>
					<button
						className={style.nextBtn}
						onClick={prevStep}
						disabled={isSubmitting}
						type="button" 
					>
						Back
					</button>
					<button
						className={style.nextBtn}
						onClick={submitForm}
						disabled={isSubmitting}
					>
						{isSubmitting
							? 'Submitting...'
							: formData.status === 'draft'
							? 'Save as Draft'
							: 'Submit for Review'}
					</button>
				</div>
			)}
		</div>
	);
};

export default ReviewSubmit;
