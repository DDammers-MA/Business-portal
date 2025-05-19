'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MultiStepForm from '@/components/multiple-steps-form/MultiStepForm';
import { FormData } from '@/types/FormData';
import { useAuth } from '@/context/AuthContext';
import styles from './edit.module.scss'; // Create a simple SCSS module if needed

export default function EditActivityPage() {
	const params = useParams();
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const id = params?.id as string; // Get ID from route params

	const [initialData, setInitialData] = useState<FormData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (authLoading) return; // Wait for auth state

		if (!user) {
			// Redirect to login if not authenticated
			router.push('/login');
			return;
		}

		if (id && user) {
			const fetchData = async () => {
				setLoading(true);
				setError(null);
				try {
					const token = await user.getIdToken();
					const response = await fetch(`/api/activity/${id}`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (!response.ok) {
						if (response.status === 404) {
							throw new Error('Activity not found.');
						} else if (response.status === 403) {
							throw new Error(
								'You do not have permission to edit this activity.'
							);
						} else {
							const errorData = await response.json();
							throw new Error(
								errorData.message ||
									`Failed to fetch activity: ${response.status}`
							);
						}
					}

					const data: FormData = await response.json();
					setInitialData(data);
				} catch (err: unknown) {
					console.error('Fetch error:', err);
					setError(
						err instanceof Error ? err.message : 'Failed to load activity data.'
					);
				} finally {
					setLoading(false);
				}
			};

			fetchData();
		}
	}, [id, user, router, authLoading]);

	if (authLoading || loading) {
		return (
			<div className={styles.page}>
				<div className={styles.container}>
					<div className={styles.spinner}></div>
					<p>Loading activity data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.page}>
				<div className={styles.container}>
					<p className={styles.error}>Error: {error}</p>
				</div>
			</div>
		);
	}

	if (!initialData) {
		return (
			<div className={styles.page}>
				<div className={styles.container}>
					<p>Activity data could not be loaded.</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<h1>Edit Activity: {initialData.name}</h1>
				<MultiStepForm
					mode="edit"
					initialData={{ ...initialData, id: id }} // Pass fetched data and ID
				/>
			</div>
		</div>
	);
}
