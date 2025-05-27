/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

"use client";

import React, { useState, useEffect } from "react";
import styles from "./activiteiten.module.scss";
import Link from "next/link";
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
		backgroundColor: "#ff2d2d",
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
		backgroundColor: '#474141',
		color: 'white',
	},
};

 // Add event/activities badge configuration
const TYPE_BADGE_CONFIG = {
  event: {
    label: "Event",
    backgroundColor: "#007bff",
    color: "white",
  },
  activity: {
    label: "Activity",
    backgroundColor: "#28a745",
    color: "white",
  },
  default: {
    label: "Unknown",
    backgroundColor: "#6c757d",
    color: "white",
  },
};

interface ActiviteitenProps {
	filter?: string;
}

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
			return;
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
							const typeKey = activiteit.type && (activiteit.type === 'event' || activiteit.type === 'activity') ? activiteit.type : 'default';
							const currentStatus = activiteit.status || 'draft'; // Default to draft if undefined
							const badgeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.default;
							const typeBadgeConfig = TYPE_BADGE_CONFIG[typeKey];
							return (
								<ActiviteitCard
									key={activiteit.id}
									id={activiteit.id || ''}
									image={activiteit.image_url || '/images/default.png'}
									title={activiteit.name}
									description={activiteit.description}
									typeBadgeConfig={typeBadgeConfig} 
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
	id: string;
	image: string;
	title: string;
	description: string;

	  typeBadgeConfig: {
    label: string;
    backgroundColor: string;
    color: string;
  };
	badgeConfig: {
		label: string;
		backgroundColor: string;
		color: string;
	};
	active: boolean;
	onDelete: () => void;
	onInfoClick: () => void;
	animationDelay?: string;
}

const ActiviteitCard: React.FC<ActiviteitCardProps> = ({
	id,
	image,
	title,
	description,
	badgeConfig, 
	typeBadgeConfig,
	active,
	onDelete,
	onInfoClick,
	animationDelay,
}) => {
	const defaultImage = '/images/default.png';
	const [isToggled, setIsToggled] = useState(active);
	const [isUpdating, setIsUpdating] = useState(false);
	const [imageLoading, setImageLoading] = useState(
		!!image && image !== defaultImage
	);
	const [imageError, setImageError] = useState(false);

	// Get online status config
	const onlineStatusConfig = ONLINE_STATUS_CONFIG[isToggled ? 'online' : 'offline'];

	useEffect(() => {
		setImageError(false);
		setImageLoading(!!image && image !== defaultImage);
	}, [image]);

	// Update handler to toggle 'active' status in Firebase
	const handleToggle = async () => {
		if (isUpdating) return; // Prevent multiple clicks

		const newActiveStatus = !isToggled;
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
			
				<span
					className={styles.statusBadge}
					style={{
						backgroundColor: badgeConfig.backgroundColor,
						color: badgeConfig.color,
					}}
				>
					{badgeConfig.label}
				</span>

				<span
					className={styles.statusBadge}
					style={{
						backgroundColor: onlineStatusConfig.backgroundColor,
						color: onlineStatusConfig.color,
					}}
				>
					{typeBadgeConfig.label}
				</span>
			</div>

		
			<div className={styles.project__imageContainer}>
				{/* Show spinner while loading */}
				{imageLoading && <div className={styles.spinner}></div>}
				
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
							onClick={(e) => e.stopPropagation()}
						>
							<i
								className="fa-regular fa-pen-to-square"
								style={{ cursor: 'pointer' }}
							></i>
						</a>
					</Link>
				</div>
				<div
    className={`${styles.toggle} ${isToggled ? styles['toggle--online'] : styles.toggle__on} ${isUpdating ? styles.toggle__disabled : ''}`}
    onClick={(e) => {
        e.stopPropagation();
        handleToggle();
    }}
>
    <span className={styles.toggle__label}>
        {/* east: "On" altijd links, "Off" altijd rechts, maar alleen één zichtbaar */}
        <span style={{ visibility: isToggled ? 'visible' : 'hidden' }}>On</span>
        <span style={{ visibility: !isToggled ? 'visible' : 'hidden' }}>Off</span>
    </span>
    <div className={styles.toggle__circle}></div>
</div>
			</div>
		</div>
	);
};

export default Activiteiten;
