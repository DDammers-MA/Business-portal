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
import { db } from '../../../../utils/firebase.browser';
import { useAuth } from '@/context/AuthContext';

import { FormData } from '@/types/FormData';
import styles from './approve.module.scss';
import Image from 'next/image';
import {
	getUserDetailsAction,
	UserDetails,
	getBatchUserDetailsAction,
} from './actions';
import { ActivityInfoModal } from './infoModal';
import DenyModal from './denyModal';

interface ActivitySummaryCardProps {
	activity: FormData;
	onCardClick: (activity: FormData) => void;
	onApprove: (activityId: string) => Promise<void>;
	onDeny: (activityId: string) => Promise<void>;
	isUpdating: boolean;
	animationDelay?: string;
	userDetails?: UserDetails;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({
	activity,
	onCardClick,
	onApprove,
	onDeny,
	isUpdating,
	animationDelay,
	userDetails,
}) => {
	const defaultImage = '/images/default.png';
	const imageUrl = activity.image_url || defaultImage;
	const [submitterName, setSubmitterName] = useState<string | null>(
		userDetails
			? userDetails.companyName || userDetails.displayName || 'N/A'
			: 'Loading...'
	);
	const [isSubmitterLoading, setIsSubmitterLoading] = useState<boolean>(
		!userDetails
	);

	useEffect(() => {
		let isMounted = true;
		const getSubmitter = async () => {
			if (!userDetails && activity.creatorUid) {
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
			}
		};
		getSubmitter();
		return () => {
			isMounted = false;
		};
	}, [activity.creatorUid, userDetails]);

	// Update submitter name when userDetails changes
	useEffect(() => {
		if (userDetails) {
			setSubmitterName(
				userDetails.companyName || userDetails.displayName || 'N/A'
			);
			setIsSubmitterLoading(false);
		}
	}, [userDetails]);

	const handleApproveClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isUpdating && activity.id) {
			onApprove(activity.id);
		}
	};

	const handleDenyClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isUpdating && activity.id) {
			onDeny(activity.id).catch((error) => {
				console.error('Error denying activity:', error);
			});
		}
	};

	return (
		<div
			style={{ animationDelay }}
			className={`${styles.summaryCard} ${styles.cardFadeIn}`}
		>
			<span className={`${styles.statusBadge} ${styles.inReview}`}>
				In Review
			</span>

			<div
				className={styles.summaryCard__ClickableArea}
				onClick={() => onCardClick(activity)}
			>
				<div className={styles.summaryCard__ImageContainer}>
					<Image
						src={imageUrl}
						alt={activity.name || 'Activity image'}
						fill
						style={{ objectFit: 'cover' }}
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						onError={(e) => {
							(e.target as HTMLImageElement).src = defaultImage;
						}}
						priority={false}
					/>
				</div>
				<div className={styles.summaryCard__Content}>
					<h3 className={styles.summaryCard__Title} title={activity.name}>
						{activity.name}
					</h3>

					<div className={styles.locationDateContainer}>
						{activity.place && activity.addr && (
							<div className={styles.locationInfo}>
								<i className="fas fa-map-marker-alt"></i>
								<span>{`${activity.place} | ${activity.addr}`}</span>
							</div>
						)}
						{activity.date && (
							<div className={styles.dateInfo}>
								<i className="far fa-calendar-alt"></i>
								<span>{activity.date}</span>
							</div>
						)}
					</div>

					<p className={styles.summaryCardSubmitter}>
						Submitted by:{' '}
						{isSubmitterLoading ? (
							<span className={styles.inlineSpinner}></span>
						) : (
							submitterName || 'N/A'
						)}
					</p>
				</div>
			</div>
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

export default function ApprovePage() {
	const { isAdmin, loading: authLoading } = useAuth();
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
	const [modalUserLoading, setModalUserLoading] = useState<boolean>(false);
	const [modalActionLoading, setModalActionLoading] = useState<boolean>(false);
	const [directUpdateStates, setDirectUpdateStates] = useState<
		Record<string, boolean>
	>({});
	const [userDetailsMap, setUserDetailsMap] = useState<{
		[key: string]: UserDetails;
	}>({});

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

				// Get unique creator IDs
				const creatorIds = Array.from(
					new Set(
						fetchedActivities
							.map((activity) => activity.creatorUid)
							.filter((id): id is string => id !== undefined)
					)
				);

				// Fetch all user details in one batch
				if (creatorIds.length > 0) {
					const result = await getBatchUserDetailsAction(creatorIds);
					if (result.success && result.users) {
						setUserDetailsMap(result.users);
					}
				}

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

	const handleOpenModal = useCallback(
		async (activity: FormData) => {
			setSelectedActivity(activity);
			setIsModalOpen(true);
			if (activity.creatorUid) {
				setModalUserLoading(true);
				// Use the cached user details instead of making a new request
				const userDetails = userDetailsMap[activity.creatorUid];
				if (userDetails) {
					setCreatorData(userDetails);
				} else {
					// Fallback to individual request if not in cache
					const result = await getUserDetailsAction(activity.creatorUid);
					if (result.success && result.user) {
						setCreatorData(result.user);
						// Add to cache
						setUserDetailsMap((prev) => ({
							...prev,
							[activity.creatorUid!]: result.user!,
						}));
					}
				}
				setModalUserLoading(false);
			}
		},
		[userDetailsMap]
	);

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false);
		setSelectedActivity(null);
		setCreatorData(null);
		setModalActionLoading(false);
	}, []);

	const handleDenySubmit = async (reason: string) => {
		if (!activityToDeny?.id) return;

		try {
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

	const updateActivityStatus = useCallback(
		async (activityId: string, newStatus: 'published' | 'denied') => {
			const activityRef = doc(db, 'activities', activityId);
			try {
				await updateDoc(activityRef, { status: newStatus });
				setActivitiesToApprove((prev) =>
					prev.filter((activity) => activity.id !== activityId)
				);
			} catch (err) {
				console.error(`Error updating status to ${newStatus}:`, err);
				alert(
					`Failed to ${
						newStatus === 'published' ? 'approve' : 'deny'
					} activity.`
				);
				throw err;
			}
		},
		[]
	);

	const handleModalStatusUpdate = useCallback(
		async (newStatus: 'published' | 'denied') => {
			if (!selectedActivity?.id || modalActionLoading) return;
			setModalActionLoading(true);
			try {
				await updateActivityStatus(selectedActivity.id, newStatus);
				handleCloseModal();
			} catch {
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
	const handleDenyWithReason = async (activityId: string): Promise<void> => {
		const activity = activitiesToApprove.find((a) => a.id === activityId);
		if (activity) {
			setActivityToDeny(activity);
			setIsDenyModalOpen(true);
		}
		return Promise.resolve();
	};

	const handleDirectStatusUpdate = useCallback(
		async (activityId: string, newStatus: 'published' | 'denied') => {
			setDirectUpdateStates((prev) => ({ ...prev, [activityId]: true }));
			try {
				await updateActivityStatus(activityId, newStatus);
			} catch {}
		},
		[updateActivityStatus]
	);

	if (authLoading || loading) {
		return <div className={styles.spinner}></div>;
	}

	if (error) {
		return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
	}

	if (!isAdmin) {
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
					{activitiesToApprove.map((activity, index) => (
						<ActivitySummaryCard
							key={activity.id}
							activity={activity}
							onCardClick={handleOpenModal}
							onApprove={(id) => handleDirectStatusUpdate(id, 'published')}
							onDeny={handleDenyWithReason}
							isUpdating={directUpdateStates[activity.id || ''] || false}
							animationDelay={`${index * 100}ms`}
							userDetails={
								activity.creatorUid
									? userDetailsMap[activity.creatorUid]
									: undefined
							}
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
					activity={activityToDeny}
				/>
			)}
		</div>
	);
}
