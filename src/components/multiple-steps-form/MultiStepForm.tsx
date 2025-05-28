'use client';

import { useState, useEffect } from 'react';
import { FormData } from '@/types/FormData';
import EventInfo from './EventInfo';
import LocationInfo from './LocationInfo';
import ReviewSubmit from './ReviewSubmit';
import OpeningTimes from './OpeningTimes';
import styles from './form.module.scss';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../../utils/firebase.browser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { optimizeImage, shouldOptimizeImage } from '@/utils/imageOptimizer';

interface MultiStepFormProps {
	mode: 'create' | 'edit';
	initialData?: FormData & { id?: string };
}

const MultiStepForm = ({ mode, initialData }: MultiStepFormProps) => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>(() => {
		const defaults: FormData = {
			title: '',
			type: '',
			name: '',
			addr: '',
			description: '',
			opening_hours: '',
			image_url: '',
			image_file: undefined,
			email: '',
			phone: '',
			budget: '',
			start_time: '',
			end_time: '',
			date: '',
			place: '',
			postal_code: '',
			region: '',
			active: true,
			status: 'inreview',
			openingTimes: {},
		};
		return initialData ? { ...defaults, ...initialData } : defaults;
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		if (initialData) {
			const defaults: Partial<FormData> = {
				active: true,
				status: 'inreview',
				openingTimes: {},
			};
			setFormData((prev) => ({
				...defaults,
				...initialData,
				image_file: prev.image_file,
			}));
		}
	}, [initialData]);

	const nextStep = () =>
		setStep((prev) => {
			if (prev === 2 && formData.type === 'activity') return 3;
			if (prev === 3 && formData.type === 'activity') return 4;
			return prev + 1;
		});

	const prevStep = () =>
		setStep((prev) => {
			if (prev === 3 && formData.type === 'activity') {
				return 2;
			}
			return prev - 1;
		});

	const handleInputChange = (
		field: keyof FormData,
		value: string | boolean | File | undefined
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (asDraft: boolean = false) => {
		try {
			setIsSubmitting(true);
			setSubmitError(null);

			if (!auth.currentUser) {
				throw new Error('You must be logged in to submit');
			}

			let imageUrl = formData.image_url;

			if (formData.image_file) {
				let fileToUpload = formData.image_file;

				// Check if image needs optimization
				if (shouldOptimizeImage(formData.image_file)) {
					try {
						fileToUpload = await optimizeImage(formData.image_file);
						toast.success('Image optimized successfully');
					} catch (error) {
						console.error('Image optimization failed:', error);
						toast.error(
							'Image optimization failed, proceeding with original image'
						);
					}
				}

				const storageRef = ref(
					storage,
					`activities/${auth.currentUser.uid}-${Date.now()}-${formData.name
						.toLowerCase()
						.replace(/ /g, '-')}`
				);
				const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

				await new Promise((resolve, reject) => {
					uploadTask.on(
						'state_changed',
						() => {},
						(error) => reject(error),
						() => resolve(getDownloadURL(uploadTask.snapshot.ref))
					);
				});

				imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
			}

			const submissionData = {
				...formData,
				image_url: imageUrl,
				status: asDraft ? 'draft' : 'inreview',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				creatorUid: auth.currentUser.uid,
			};

			delete submissionData.image_file;

			const response = await fetch('/api/activity/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submissionData),
			});

			if (!response.ok) {
				throw new Error('Failed to submit form');
			}

			toast.success(
				asDraft
					? 'Successfully saved as draft'
					: 'Successfully submitted for review'
			);

			if (mode === 'create') {
				setFormData({
					title: '',
					type: '',
					name: '',
					addr: '',
					description: '',
					opening_hours: '',
					image_url: '',
					image_file: undefined,
					email: '',
					phone: '',
					budget: '',
					start_time: '',
					end_time: '',
					date: '',
					place: '',
					postal_code: '',
					region: '',
					active: true,
					status: 'inreview',
					openingTimes: {},
				});
				setStep(1);
			}
			router.push('/');
		} catch (error) {
			toast.error('Error submitting form. Please try again.');
			console.error('Submission Error:', error);
			setSubmitError(
				error instanceof Error
					? error.message
					: 'Failed to submit form. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitForm = () => handleSubmit(false);
	const saveDraft = () => handleSubmit(true);

	const handleCancel = () => {
		if (isSubmitting) return;

		// Check if form has been modified
		const hasChanges = Object.entries(formData).some(([key, value]) => {
			if (key === 'image_file') return false; // Skip image file comparison
			return initialData
				? initialData[key as keyof FormData] !== value
				: value !== '';
		});

		if (hasChanges) {
			const confirmed = window.confirm(
				'Are you sure you want to cancel? Any unsaved changes will be lost.'
			);
			if (!confirmed) return;
		}

		router.push('/activities');
	};

	const isFormValid = (isDraft: boolean = false) => {
		// Basic validation functions
		const isValidName = (name: string) => name.length >= 5;
		const isValidDescription = (desc: string) => desc.length >= 10;
		const isValidPlace = (place: string) => place.length >= 2;
		const isValidAddress = (addr: string) => addr.length >= 5;

		// For drafts, any valid field is enough
		if (isDraft) {
			return (
				(formData.name ? isValidName(formData.name) : false) ||
				(formData.description
					? isValidDescription(formData.description)
					: false) ||
				(formData.place ? isValidPlace(formData.place) : false) ||
				(formData.addr ? isValidAddress(formData.addr) : false)
			);
		}

		// For final submission, all fields must be valid
		return (
			isValidName(formData.name) &&
			isValidDescription(formData.description) &&
			isValidPlace(formData.place) &&
			isValidAddress(formData.addr)
		);
	};

	return (
		<form className={styles.form}>
			<div className={styles.form__topButtons}>
				<button
					type="button"
					className={styles.form__draftButton}
					onClick={saveDraft}
					disabled={isSubmitting || !isFormValid(true)}
				>
					{isSubmitting ? 'Saving...' : 'Save as Draft'}
				</button>
				<button
					type="button"
					className={styles.form__cancelButton}
					onClick={handleCancel}
					disabled={isSubmitting}
				>
					Cancel
				</button>
			</div>

			{step === 1 && (
				<EventInfo
					formData={formData}
					setFormData={setFormData}
					nextStep={nextStep}
					prevStep={prevStep}
				/>
			)}
			{step === 2 && (
				<LocationInfo
					formData={formData}
					setFormData={setFormData}
					nextStep={nextStep}
					prevStep={prevStep}
				/>
			)}
			{step === 3 && formData.type === 'activity' && (
				<OpeningTimes
					formData={formData}
					setFormData={setFormData}
					nextStep={nextStep}
					prevStep={prevStep}
				/>
			)}

			{(formData.type === 'event' && step === 3) ||
			(formData.type === 'activity' && step === 4) ? (
				<ReviewSubmit
					formData={formData}
					prevStep={prevStep}
					submitForm={submitForm}
					step={step}
					isSubmitting={isSubmitting}
					submitError={submitError}
					handleInputChange={handleInputChange}
				/>
			) : null}
		</form>
	);
};

export default MultiStepForm;
