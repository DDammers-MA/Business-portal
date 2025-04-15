/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import styles from './activiteiten.module.scss';
// Import Firestore functions and db instance
import { db } from '../../../utils/firebase.browser';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	deleteDoc,
	Query,
	DocumentData,
	updateDoc,
} from 'firebase/firestore';
// Import AuthContext hook
import { useAuth } from '@/context/AuthContext';

import { FormData } from '@/types/FormData';

// Define configuration for status badges
const STATUS_CONFIG = {
	published: {
		label: 'Published',
		backgroundColor: '#198754',
		color: 'white',
	},
	unpublished: {
		label: 'Unpublished',
		backgroundColor: '#ffc107',
		color: '#333',
	},
	draft: {
		label: 'Draft',
		backgroundColor: '#6c757d',
		color: 'white',
	},
	default: {
		label: 'Unknown',
		backgroundColor: '#6c757d',
		color: 'white',
	},
};

// Define props interface including the optional filter
interface ActiviteitenProps {
	filter?: string;
}

// Update component signature to accept props
const Activiteiten = ({ filter }: ActiviteitenProps) => {
	// State for activities, loading, and errors
	const [activiteiten, setActiviteiten] = useState<FormData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	// Get authentication state
	const { user, isAdmin, loading: authLoading } = useAuth();

	// Fetch data on mount and when filter changes
	useEffect(() => {
		const fetchData = async () => {
			// Show loading state if auth is still loading
			if (authLoading) {
				setLoading(true);
				return;
			}

			// If not admin and not logged in, show no activities
			if (!isAdmin && !user) {
				setActiviteiten([]);
				setLoading(false);
				setError(null); // Clear any previous errors
				return;
			}

			setLoading(true);
			setError(null);
			try {
				// Base query for the activities collection
				let q: Query<DocumentData> = query(collection(db, 'activities'));

				// Apply filter if it's valid
				if (filter && ['published', 'unpublished', 'draft'].includes(filter)) {
					q = query(q, where('status', '==', filter));
				}

				// Apply user-specific filter if not admin and logged in
				if (!isAdmin && user) {
					// Use 'creatorId' as confirmed
					q = query(q, where('creatorId', '==', user.uid));
				}

				const querySnapshot = await getDocs(q);
				const fetchedActiviteiten = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...(doc.data() as Omit<FormData, 'id'>),
				}));
				console.log(fetchedActiviteiten);
				setActiviteiten(fetchedActiviteiten);
			} catch (err) {
				console.error('Error fetching activities:', err);
				setError('Failed to load activities.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		// Update dependencies to include auth state
	}, [filter, user, isAdmin, authLoading]);

	// Update handleDelete to remove from Firestore
	const handleDelete = async (id: string, title: string) => {
		if (!id) return;

		// Add confirmation dialog
		const confirmation = window.confirm(
			`Are you sure you want to delete the activity "${title}"?`
		);
		if (!confirmation) {
			return; // Stop deletion if user cancels
		}

		try {
			await deleteDoc(doc(db, 'activities', id));
			setActiviteiten((prevActiviteiten) =>
				prevActiviteiten.filter((activiteit) => activiteit.id !== id)
			);
		} catch (err) {
			console.error('Error deleting activity:', err);
		}
	};

	return (
		<div className={styles.event}>
			<div className={styles.event__container}>
				<div className={styles.event__list}>
					{/* Conditional Rendering Section */}
					{loading ? (
						<div className={styles.spinner}></div>
					) : error ? (
						<div className={`${styles.message} ${styles.error}`}>{error}</div>
					) : activiteiten.length === 0 ? (
						<div className={styles.message}>No activities found.</div>
					) : (
						/* Map through activities only if not loading, no error, and activities exist */
						activiteiten.map((activiteit) => {
							// Determine status and look up config
							const currentStatus = activiteit.status || 'draft'; // Default to draft if undefined
							const badgeConfig =
								STATUS_CONFIG[currentStatus] || STATUS_CONFIG.default;

							return (
								<ActiviteitCard
									key={activiteit.id}
									id={activiteit.id || ''} // Pass ID
									image={activiteit.image_url || '/images/default.png'} // Handle potentially missing image
									title={activiteit.name}
									description={activiteit.description}
									badgeConfig={badgeConfig} // Pass the config object
									active={activiteit.active || true} // Pass renamed prop
									onDelete={() =>
										handleDelete(activiteit.id || '', activiteit.name)
									}
								/>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
};

interface ActiviteitCardProps {
	id: string; // Add id
	image: string;
	title: string;
	description: string;
	badgeConfig: {
		label: string;
		backgroundColor: string;
		color: string;
	}; // Add badge config prop
	active: boolean; // Renamed from online
	onDelete: () => void;
}

const ActiviteitCard: React.FC<ActiviteitCardProps> = ({
	id, // Receive id
	image,
	title,
	description,
	badgeConfig, // Receive badgeConfig
	active, // Receive renamed prop
	onDelete,
}) => {
	const defaultImage = '/images/default.png';
	const [isToggled, setIsToggled] = useState(active);
	const [isUpdating, setIsUpdating] = useState(false);
	// State for image loading and error
	const [imageLoading, setImageLoading] = useState(
		!!image && image !== defaultImage
	);
	const [imageError, setImageError] = useState(false);

	// Reset loading state if image prop changes
	useEffect(() => {
		setImageError(false);
		setImageLoading(!!image && image !== defaultImage);
	}, [image]);

	// Update handler to toggle 'active' status in Firebase
	const handleToggle = async () => {
		if (isUpdating) return; // Prevent multiple clicks

		const newActiveStatus = !isToggled; // Use new variable name
		setIsUpdating(true);

		try {
			const activityRef = doc(db, 'activities', id);
			await updateDoc(activityRef, {
				active: newActiveStatus, // Update active field in Firestore
			});
			setIsToggled(newActiveStatus); // Update local state on success
		} catch (error) {
			console.error('Error updating active status:', error); // Update error message
			// Optionally show an error message to the user
		} finally {
			setIsUpdating(false);
		}
	};

	// Determine the URL to display (handle error and default)
	const displayUrl = imageError ? defaultImage : image || defaultImage;

	return (
		<div
			className={`${styles.project} ${
				isToggled ? styles.project__toggled : '' // Style reflects the toggled status
			}`}
		>
			{/* Status Badge - Now uses config props */}
			<span
				className={styles.statusBadge}
				style={{
					backgroundColor: badgeConfig.backgroundColor,
					color: badgeConfig.color,
				}}
			>
				{badgeConfig.label}
			</span>

			{/* Image container */}
			<div className={styles.project__imageContainer}>
				{/* Show spinner while loading */}
				{imageLoading && <div className={styles.spinner}></div>}
				{/* Image element */}
				<img
					src={displayUrl}
					alt={title}
					className={styles.project__image}
					onLoad={() => setImageLoading(false)} // Set loading false on successful load
					onError={() => {
						// Set loading false and error true on failure
						setImageLoading(false);
						setImageError(true);
					}}
					// Hide img element itself while loading, spinner takes its place
					style={{ display: imageLoading ? 'none' : 'block' }}
				/>
			</div>

			<h2 className={styles.project__title}>{title}</h2>
			<p className={styles.project__description}>{description}</p>

			<div className={styles.project__footer}>
				<div className={styles.project__actions}>
					<i
						className="fa-solid fa-trash"
						style={{ color: '#f00f0f', cursor: 'pointer' }}
						onClick={onDelete}
					></i>
					<i className="fa-regular fa-pen-to-square"></i>
				</div>
				<div
					className={`${styles.toggle} ${isToggled ? styles.toggle__on : ''} ${
						isUpdating ? styles.toggle__disabled : ''
					}`}
					onClick={handleToggle}
				>
					<div className={styles.toggle__circle}></div>
				</div>
			</div>
		</div>
	);
};

export default Activiteiten;
