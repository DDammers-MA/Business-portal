/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

"use client";

import React, { useState, useEffect } from "react";
import styles from "./activiteiten.module.scss";
import Link from "next/link"; // Add import for Link
// Import Firestore functions and db instance
import { db } from "../../../utils/firebase.browser";
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
} from "firebase/firestore";
// Import AuthContext hook
import { useAuth } from "@/context/AuthContext";

import { FormData } from '@/types/FormData';
import { ActivityInfoModal } from '@/app/activities/approve/infoModal';
import { toast } from 'sonner';
import { getUserDetailsAction, UserDetails } from '@/app/activities/approve/actions';

// Define configuration for status badges
const STATUS_CONFIG = {
	published: {
		label: "Published",
		backgroundColor: "#198754",
		color: "white",
	},
	inreview: {
		label: "In review",
		backgroundColor: "#ffc107",
		color: "#333",
	},
	denied: {
		label: "Denied",
		backgroundColor: "#ffc107",
		color: "#333",
	},
	draft: {
		label: "Draft",
		backgroundColor: "#6c757d",
		color: "white",
	},
	default: {
		label: "Unknown",
		backgroundColor: "#6c757d",
		color: "white",
	},
};

// Add online/offline badge configuration
const ONLINE_STATUS_CONFIG = {
	online: {
		label: 'Online',
		backgroundColor: '#198754',
		color: 'white',
	},
	offline: {
		label: 'Offline',
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
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<FormData | null>(null);
	const [creatorData, setCreatorData] = useState<UserDetails | null>(null);
	const [modalUserLoading, setModalUserLoading] = useState<boolean>(false);
	const [activiteiten, setActiviteiten] = useState<FormData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isAdmin, loading: authLoading } = useAuth();

	const handleOpenInfoModal = async (activity: FormData) => {
		setSelectedActivity(activity);
		setIsModalOpen(true);
		setCreatorData(null);
		
		if (activity.creatorUid) {
			setModalUserLoading(true);
			const result = await getUserDetailsAction(activity.creatorUid);
			if (result.success && result.user) {
				setCreatorData(result.user);
			} else {
				console.error('Failed to fetch creator details:', result.message);
				setCreatorData(null);
			}
			setModalUserLoading(false);
		}
	};
	
	const handleCloseInfoModal = () => {
		setSelectedActivity(null);
		setIsModalOpen(false);
		setCreatorData(null);
	};

	useEffect(() => {
		if (isModalOpen) {
			// Prevent scrolling
			document.body.style.overflow = 'hidden';
		} else {
			// Restore scrolling
			document.body.style.overflow = '';
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = '';
		};
	}, [isModalOpen]);

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

				console.log(filter);

				// Apply filter if it's valid
				if (filter === 'draft') {
					// If filter is 'draft', fetch both 'draft' and 'denied'
					q = query(q, where('status', 'in', ['draft', 'denied']));
				} else if (
					filter &&
					['published', 'inreview', 'denied'].includes(filter)
				) {
					// For other valid statuses, filter specifically
					q = query(q, where('status', '==', filter.toLowerCase()));
				}

				// Apply user-specific filter if not admin and logged in
				if (!isAdmin && user) {
					// Use 'creatorId' as confirmed
					q = query(q, where('creatorUid', '==', user.uid));
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
			toast.success('Activity deleted successfully!')
		} catch (err) {
			toast.error('Failed to delete activity.')
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
						activiteiten.map((activiteit, index) => {
							// Determine status and look up config
							const currentStatus = activiteit.status || 'draft'; // Default to draft if undefined
							const badgeConfig =
								STATUS_CONFIG[currentStatus] || STATUS_CONFIG.default;

							return (
								<ActiviteitCard
									key={activiteit.id}
									id={activiteit.id || ''}
									image={activiteit.image_url || '/images/default.png'}
									title={activiteit.name}
									description={activiteit.description}
									badgeConfig={badgeConfig}
									active={activiteit.active ?? false}
									onDelete={() => handleDelete(activiteit.id || '', activiteit.name)}
									onInfoClick={() => handleOpenInfoModal(activiteit)}
									animationDelay={`${index * 50}ms`}
								/>
							);
						})
					)}
				</div>
			</div>
			{selectedActivity && (
				<ActivityInfoModal
					isOpen={isModalOpen}
					onClose={handleCloseInfoModal}
					activity={selectedActivity}
					creatorData={creatorData}
					modalUserLoading={modalUserLoading}
					modalActionLoading={false}
					onStatusUpdate={() => { }}
				/>
			)}
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
	onInfoClick: () => void;
	animationDelay?: string;
}

const ActiviteitCard: React.FC<ActiviteitCardProps> = ({
	id, // Receive id
	image,
	title,
	description,
	badgeConfig, // Receive badgeConfig
	active, // Receive corrected prop
	onDelete,
	onInfoClick,
	animationDelay,
}) => {
	const defaultImage = '/images/default.png';
	const [isToggled, setIsToggled] = useState(active);
	const [isUpdating, setIsUpdating] = useState(false);
	// State for image loading and error
	const [imageLoading, setImageLoading] = useState(
		!!image && image !== defaultImage
	);
	const [imageError, setImageError] = useState(false);

	// Get online status config
	const onlineStatusConfig = ONLINE_STATUS_CONFIG[isToggled ? 'online' : 'offline'];

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
			onClick={onInfoClick}
			className={`${styles.project} ${!isToggled ? styles.project__toggled : ''} ${styles.cardFadeIn}`}
			style={{ animationDelay }}
		>
			<div className={styles.project__badges}>
				{/* Status Badge - Left side */}
				<span
					className={styles.statusBadge}
					style={{
						backgroundColor: badgeConfig.backgroundColor,
						color: badgeConfig.color,
					}}
				>
					{badgeConfig.label}
				</span>

				{/* Online/Offline Badge - Right side */}
				<span
					className={styles.statusBadge}
					style={{
						backgroundColor: onlineStatusConfig.backgroundColor,
						color: onlineStatusConfig.color,
					}}
				>
					{onlineStatusConfig.label}
				</span>
			</div>

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

			<div className={styles.project__content}>
				<h2 className={styles.project__title}>{title}</h2>
				<p className={styles.project__description}>{description}</p>
			</div>

			<div className={styles.project__footer}>
				<div className={styles.project__actions} onClick={(e) => e.stopPropagation()}>
					<i
						className="fa-solid fa-trash"
						style={{ color: '#f00f0f', cursor: 'pointer' }}
						onClick={onDelete}
					></i>

					<Link href={`/activity/edit/${id}`} legacyBehavior>
						<a
							style={{ color: 'inherit', textDecoration: 'none' }}
							onClick={(e) => e.stopPropagation()} // prevent card click
						>
							<i
								className="fa-regular fa-pen-to-square"
								style={{ cursor: 'pointer' }}
							></i>
						</a>
					</Link>
				</div>
				<div
					className={`${styles.toggle} ${!isToggled ? styles.toggle__on : ''} ${
						isUpdating ? styles.toggle__disabled : ''
					}`} 
					onClick={(e) => {
						e.stopPropagation();
						handleToggle();
					}}
				>
					<div className={styles.toggle__circle}></div>
				</div>
			</div>
		</div>
	);
};

export default Activiteiten;
