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

// Define Props interface
interface MultiStepFormProps {
	mode: 'create' | 'edit';
	initialData?: FormData & { id?: string }; // Include optional id for edit mode
}

const MultiStepForm = ({ mode, initialData }: MultiStepFormProps) => {
	const router = useRouter();
	const [step, setStep] = useState(1);
	// Initialize state with initialData if provided, else default
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
			active: true,
			status: 'inreview',
			openingTimes: {},
		};
		return initialData ? { ...defaults, ...initialData } : defaults;
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Effect to update state if initialData changes (e.g., after fetch in edit page)
	// Important if initialData is fetched asynchronously
	useEffect(() => {
		if (initialData) {
			const defaults: Partial<FormData> = {
				active: true, // Ensure defaults are applied if missing in initialData
				status: 'inreview',
				openingTimes: {},
			};
			setFormData((prev) => ({
				...defaults,
				...initialData,
				image_file: prev.image_file,
			})); // Keep existing image_file if any
		}
	}, [initialData]);

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
				console.log('New image file detected, starting upload...');
				// **Optional: Delete old image here if initialData.image_url exists**
				const file = formData.image_file;
				const randomString = Math.random().toString(36).substring(7);
				const fileName = `${Date.now()}-${randomString}-${
					formData.name || 'activity'
				}-${file.name}`;
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
			} else {
				console.log('No new image file, keeping existing URL:', finalImageUrl);
			}

			// --- Prepare Data for API ---
			// Remove image_file before sending to API
			// Explicitly use the destructured variable 'dataToSend'
			const { image_file, ...dataToSend } = formData;
			// Use console.log or similar if needed to mark 'image_file' as used
			if (image_file)
				console.log('Preparing data, excluding image_file object.');

			const finalData: Partial<FormData> = {
				...dataToSend, // Use the rest of the form data
				type: 'activity', // Ensure type is set
				image_url: finalImageUrl, // Use the potentially updated URL
				// Ensure user-related fields are set correctly, especially for create mode
				email:
					mode === 'create'
						? user.email || ''
						: formData.email || user.email || '',
				phone:
					mode === 'create'
						? user.phoneNumber || ''
						: formData.phone || user.phoneNumber || '',
				// creatorUid is added server-side for create, don't send from client
				// For update, it's used for validation server-side but not updated
			};

			const token = await user.getIdToken();

			console.log(`Submitting data in ${mode} mode to API:`, finalData);

			// --- API Call (Conditional) ---
			const apiUrl =
				mode === 'create'
					? '/api/activity/create'
					: `/api/activity/${initialData?.id}`;
			const apiMethod = mode === 'create' ? 'POST' : 'PUT';

			if (mode === 'edit' && !initialData?.id) {
				throw new Error('Cannot update: Missing activity ID.');
			}

			const response = await fetch(apiUrl, {
				method: apiMethod,
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
			toast.success(`Activitie Submitted Successfully!`)
			// Reset form only in create mode, redirect in both
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
					active: true,
					status: 'inreview',
					openingTimes: {},
				});
				setStep(1);
			}
			router.push('/'); // Redirect to home page after create or update
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

	return (
		<form className={styles.form}>
			{step === 1 && (
				<EventInfo
					formData={formData}
					setFormData={setFormData} // Pass setFormData down
					nextStep={nextStep}
				/>
			)}
			{step === 2 && (
				<LocationInfo
					formData={formData}
					setFormData={setFormData} // Pass setFormData down
					nextStep={nextStep}
					prevStep={prevStep}
				/>
			)}
			{step === 3 && ( // Adjust step number for OpeningTimes
				<OpeningTimes
					formData={formData}
					setFormData={setFormData} // Pass setFormData down
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
