'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	updateDoc,
	DocumentData,
	Query,
} from 'firebase/firestore';
import { db } from '../../../../utils/firebase.browser'; // Adjust path as necessary
import { useAuth } from '@/context/AuthContext';
import { FormData } from '@/types/FormData'; // Adjust path as necessary
import styles from './approve.module.scss';
import Image from 'next/image'; // Using next/image for optimized images
import { getUserDetailsAction, UserDetails } from './actions';
import { ActivityInfoModal } from './infoModal';
import DenyModal from './denyModal';

// --------------- Activity Summary Card Component ---------------
interface ActivitySummaryCardProps {
	activity: FormData;
	onCardClick: (activity: FormData) => void; // Renamed from onClick
	onApprove: (activityId: string) => Promise<void>;
	onDeny: (activityId: string) => Promise<void>;
	isUpdating: boolean; // Loading state for this specific card's actions
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({
	activity,
	onCardClick,
	onApprove,
	onDeny,
	isUpdating,
}) => {
	const defaultImage = '/images/default.png'; // Define a default image
	const imageUrl = activity.image_url || defaultImage;
	const [submitterName, setSubmitterName] = useState<string | null>(
		'Loading...'
	);
	const [isSubmitterLoading, setIsSubmitterLoading] = useState<boolean>(true);

	useEffect(() => {
		let isMounted = true;
		const getSubmitter = async () => {
			if (activity.creatorUid) {
				setIsSubmitterLoading(true);
				const result = await getUserDetailsAction(activity.creatorUid);
				if (isMounted) {
					if (result.success && result.user) {
						setSubmitterName(
							result.user.companyName || result.user.displayName || 'N/A'
						);
					} else {
						setSubmitterName('N/A');
						console.error('Failed to fetch submitter:', result.message);
					}
					setIsSubmitterLoading(false);
				}
			} else {
				if (isMounted) {
					setSubmitterName('N/A');
					setIsSubmitterLoading(false);
				}
			}
		};
		getSubmitter();
		return () => {
			isMounted = false;
		}; // Cleanup function
	}, [activity.creatorUid]);

	const handleApproveClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering modal open
		if (!isUpdating && activity.id) {
			onApprove(activity.id);
		}
	};

	const handleDenyClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering modal open
		if (!isUpdating && activity.id) {
			onDeny(activity.id);
		}
	};

	// Removed duplicate handleDenyWithReason function as it is unused

	return (
		<div className={styles.summaryCard}>
			{/* Make only this part clickable for modal */}
			<div
				className={styles.summaryCard__ClickableArea}
				onClick={() => onCardClick(activity)}
			>
				<div className={styles.summaryCard__ImageContainer}>
					<Image
						src={imageUrl}
						alt={activity.name || 'Activity image'}
						fill // Use fill to cover the container
						style={{ objectFit: 'cover' }} // Ensure image covers the area
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image sizes
						onError={(e) => {
							// Optional: Handle image loading errors, e.g., show default
							(e.target as HTMLImageElement).src = defaultImage;
						}}
						priority={false} // Consider setting priority for above-the-fold images if applicable
					/>
				</div>
				<div className={styles.summaryCard__Content}>
					<h3 className={styles.summaryCard__Title} title={activity.name}>
						{activity.name}
					</h3>
					<p className={styles.summaryCard__Submitter}>
						Submitted by:{' '}
						{isSubmitterLoading ? (
							<span className={styles.inlineSpinner}></span>
						) : (
							submitterName || 'N/A'
						)}
					</p>
				</div>
			</div>
			{/* Action buttons always visible at the bottom */}
			<div className={styles.summaryCard__Actions}>
				<button
					className={`${styles.summaryCard__Button} ${styles.summaryCard__ButtonDeny}`}
					onClick={handleDenyClick}
					disabled={isUpdating}
				>
					{isUpdating ? <span className={styles.inlineSpinner}></span> : 'Deny'}
				</button>
				<button
					className={`${styles.summaryCard__Button} ${styles.summaryCard__ButtonApprove}`}
					onClick={handleApproveClick}
					disabled={isUpdating}
				>
					{isUpdating ? (
						<span className={styles.inlineSpinner}></span>
					) : (
						'Approve'
					)}
				</button>
			</div>
		</div>
	);
};

// --------------- Approve Page Component ---------------
export default function ApprovePage() {
	const { /* user, */ isAdmin, loading: authLoading } = useAuth(); // Removed unused 'user'
	const [activitiesToApprove, setActivitiesToApprove] = useState<FormData[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedActivity, setSelectedActivity] = useState<FormData | null>(
		null
	);

	const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
const [activityToDeny, setActivityToDeny] = useState<FormData | null>(null);


	const [creatorData, setCreatorData] = useState<UserDetails | null>(null);
	const [modalUserLoading, setModalUserLoading] = useState<boolean>(false); // Separate loading for modal user data
	const [modalActionLoading, setModalActionLoading] = useState<boolean>(false); // Loading state for modal buttons
	const [directUpdateStates, setDirectUpdateStates] = useState<
		Record<string, boolean>
	>({}); // Loading state for card buttons

	// Fetch activities needing approval
	useEffect(() => {
		if (authLoading) {
			setLoading(true);
			return;
		}

		if (!isAdmin) {
			setError(
				'Access Denied. You must be an administrator to view this page.'
			);
			setLoading(false);
			setActivitiesToApprove([]);
			return;
		}

		const fetchActivities = async () => {
			setLoading(true);
			setError(null);
			try {
				const q: Query<DocumentData> = query(
					collection(db, 'activities'),
					where('status', '==', 'inreview')
				);

				const querySnapshot = await getDocs(q);
				const fetchedActivities = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...(doc.data() as Omit<FormData, 'id'>),
				}));
				setActivitiesToApprove(fetchedActivities);
			} catch (err) {
				console.error('Error fetching activities for approval:', err);
				setError('Failed to load activities for approval.');
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, [isAdmin, authLoading]);

	// Handle opening the modal and fetching user details for it
	const handleOpenModal = useCallback(async (activity: FormData) => {
		setSelectedActivity(activity);
		setIsModalOpen(true);
		setCreatorData(null);
		if (activity.creatorUid) {
			setModalUserLoading(true);
			const result = await getUserDetailsAction(activity.creatorUid);
			if (result.success && result.user) {
				setCreatorData(result.user);
			} else {
				console.error(
					'Failed to fetch creator details for modal:',
					result.message
				);
				setCreatorData(null); // Ensure it's null on failure
			}
			setModalUserLoading(false);
		} else {
			console.warn('Activity is missing creatorUid');
			setCreatorData(null);
			setModalUserLoading(false);
		}
	}, []);

	// Handle closing the modal
	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false);
		setSelectedActivity(null);
		setCreatorData(null);
		setModalActionLoading(false); // Reset modal button loading state
	}, []);

	const handleDenySubmit = async (reason: string) => {
		if (!activityToDeny?.id) return;
	
		try {
			// Save the reason somewhere if needed
			// e.g., updateDoc(..., { status: 'denied', denyReason: reason })
			await updateDoc(doc(db, 'activities', activityToDeny.id), {
				status: 'denied',
				denyReason: reason,
			});
	
			// Remove from list
			setActivitiesToApprove((prev) =>
				prev.filter((activity) => activity.id !== activityToDeny.id)
			);
	
			// Close modal
			setIsDenyModalOpen(false);
			setActivityToDeny(null);
		} catch (error) {
			console.error('Error denying activity with reason:', error);
			alert('Failed to deny the activity. Please try again.');
		}
	};
	

	// Generic function to update status and local state
	const updateActivityStatus = useCallback(
		async (activityId: string, newStatus: 'published' | 'denied') => {
			const activityRef = doc(db, 'activities', activityId);
			try {
				await updateDoc(activityRef, { status: newStatus });
				setActivitiesToApprove((prev) =>
					prev.filter((activity) => activity.id !== activityId)
				);
				// Optionally show a success message/toast
			} catch (err) {
				console.error(`Error updating status to ${newStatus}:`, err);
				alert(
					`Failed to ${
						newStatus === 'published' ? 'approve' : 'deny'
					} activity.`
				);
				throw err; // Re-throw error to handle loading state in callers
			}
		},
		[]
	);

	// Handler for modal action buttons
	const handleModalStatusUpdate = useCallback(
		async (newStatus: 'published' | 'denied') => {
			if (!selectedActivity?.id || modalActionLoading) return;
			setModalActionLoading(true);
			try {
				await updateActivityStatus(selectedActivity.id, newStatus);
				handleCloseModal(); // Close modal on success
			} catch /* (err) */ {
				// Error already handled/alerted in updateActivityStatus
			} finally {
				setModalActionLoading(false);
			}
		},
		[
			selectedActivity,
			modalActionLoading,
			updateActivityStatus,
			handleCloseModal,
		]
	);

	// Handler for direct card action buttons
	const handleDenyWithReason = (activityId: string) => {
		const activity = activitiesToApprove.find((a) => a.id === activityId);
		if (activity) {
			setActivityToDeny(activity);
			setIsDenyModalOpen(true);
		}
	};

	const handleDirectStatusUpdate = useCallback(
		async (activityId: string, newStatus: 'published' | 'denied') => {
			setDirectUpdateStates((prev) => ({ ...prev, [activityId]: true }));
			try {
				await updateActivityStatus(activityId, newStatus);
				// Item is removed from list by updateActivityStatus
			} catch /* (err) */ {
				// Error already handled/alerted in updateActivityStatus
			} finally {
				// No need to set false here, as the component will unmount/re-render without this item
			}
		},
		[updateActivityStatus]
	);

	// Render Logic
	if (authLoading || loading) {
		return <div className={styles.spinner}></div>;
	}

	if (error) {
		return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
	}

	if (!isAdmin) {
		// This case is technically handled by the error state above, but reinforces the check
		return (
			<div className={`${styles.message} ${styles.error}`}>Access Denied.</div>
		);
	}

	return (
		<div className={styles.pageContainer}>
			<h1 className={styles.title}>Activities Pending Approval</h1>

			{activitiesToApprove.length === 0 ? (
				<div className={styles.message}>
					No activities are currently awaiting approval.
				</div>
			) : (
				<div className={styles.grid}>
					{activitiesToApprove.map((activity) => (
						<ActivitySummaryCard
							key={activity.id}
							activity={activity}
							onCardClick={handleOpenModal}
							onApprove={(id) => handleDirectStatusUpdate(id, 'published')}
							onDeny={async (activityId) => {
								handleDenyWithReason(activityId);
								return Promise.resolve();
							}}

							isUpdating={directUpdateStates[activity.id || ''] || false}
						/>
					))}
				</div>
			)}

			{selectedActivity && (

				<ActivityInfoModal
			isOpen={isModalOpen}
			onClose={handleCloseModal}
			activity={selectedActivity}
			creatorData={creatorData}
			modalUserLoading={modalUserLoading}
			modalActionLoading={modalActionLoading}
			onStatusUpdate={handleModalStatusUpdate}
		/>
		
			)}

{activityToDeny && (
    <DenyModal
        isOpen={isDenyModalOpen}
        onClose={() => {
            setIsDenyModalOpen(false);
            setActivityToDeny(null);
        }}
        onSubmit={handleDenySubmit}
    />
)}

		</div>
	);
}
