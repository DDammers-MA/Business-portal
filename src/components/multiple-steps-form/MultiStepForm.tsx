'use client';

import { useState } from 'react';
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

const MultiStepForm = () => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({
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
		active: true,
		status: 'unpublished',
		openingTimes: {}, // Ensure openingTimes is part of the formData state
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => setStep((prev) => prev - 1);

	const handleInputChange = (
		field: keyof FormData,
		value: string | boolean | File | undefined
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const submitForm = async () => {
		const user = auth.currentUser;
		if (!user) {
			setSubmitError('You must be logged in to submit the form.');
			setIsSubmitting(false);
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		let finalImageUrl = formData.image_url;

		try {
			if (formData.image_file) {
				const file = formData.image_file;
				const randomString = Math.random().toString(36).substring(7);
				const fileName = `${Date.now()}-${randomString}-${formData.name}-${
					file.name
				}`;
				const storageRef = ref(storage, `activityImages/${fileName}`);

				const metadata = {
					customMetadata: {
						creatorUid: user.uid,
					},
				};

				const uploadTask = uploadBytesResumable(storageRef, file, metadata);

				await uploadTask;

				finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
				console.log('File uploaded successfully. URL:', finalImageUrl);
			}

			const finalData = {
				type: 'activity',
				name: formData.name,
				addr: formData.addr,
				description: formData.description,
				opening_hours: formData.opening_hours,
				image_url: finalImageUrl,
				email: user.email || '',
				phone: user.phoneNumber || '',
				budget: formData.budget,
				start_time: formData.start_time,
				end_time: formData.end_time,
				date: formData.date,
				place: formData.place,
				postal_code: formData.postal_code,
				active: formData.active ?? true,
				status: formData.status ?? 'unpublish',
			};

			const token = await user.getIdToken();

			console.log('Submitting data to API:', finalData);
			const response = await fetch('/api/activity/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(finalData),
			});

			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch {
					console.log('Response was not JSON, using status text.');
				}
				throw new Error(errorMessage);
			}

			const result = await response.json();
			console.log('API Response:', result);
			toast.success('Activity created successfully!');
		
			setFormData({
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
				active: true,
				status: 'unpublished',
				openingTimes: {},
			});
			setStep(1);
			router.push('/');
		} catch (error) {
			console.error('Submission Error:', error);
			toast.error('Failed to create activity. Please try again.');

			setSubmitError(
				error instanceof Error
					? error.message
					: 'Failed to submit form. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className={styles.form}>
			{step === 1 && (
				<EventInfo
					formData={formData}
					setFormData={setFormData}
					nextStep={nextStep}
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
			{step === 3 && ( // Adjust step number for OpeningTimes
				<OpeningTimes
					formData={formData}
					setFormData={setFormData}
					nextStep={nextStep}
					prevStep={prevStep}
				/>
			)}
			{step === 4 && ( // Adjust step number for ReviewSubmit
				<ReviewSubmit
					formData={formData}
					prevStep={prevStep}
					submitForm={submitForm}
					step={step}
					isSubmitting={isSubmitting}
					submitError={submitError}
					handleInputChange={handleInputChange}
				/>
			)}
		</form>
	);
};

export default MultiStepForm;
