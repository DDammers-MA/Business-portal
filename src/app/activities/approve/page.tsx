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
import { getUserDetailsAction, UserDetails } from './actions';
import { ActivityInfoModal } from './infoModal';
import DenyModal from './denyModal';

interface ActivitySummaryCardProps {
	activity: FormData;
	onCardClick: (activity: FormData) => void;
	onApprove: (activityId: string) => Promise<void>;
	onDeny: (activityId: string) => Promise<void>;
	isUpdating: boolean;
	animationDelay?: string;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({
	activity,
	onCardClick,
	onApprove,
	onDeny,
	isUpdating,
	animationDelay,
}) => {
	const defaultImage = '/images/default.png';
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
		};
	}, [activity.creatorUid]);

	const handleApproveClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isUpdating && activity.id) {
			onApprove(activity.id);
		}
	};

	const handleDenyClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isUpdating && activity.id) {
			onDeny(activity.id);
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
				setCreatorData(null);
			}
			setModalUserLoading(false);
		} else {
			console.warn('Activity is missing creatorUid');
			setCreatorData(null);
			setModalUserLoading(false);
		}
	}, []);

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
							onDeny={async (activityId) => {
								handleDenyWithReason(activityId);
								return Promise.resolve();
							}}
							isUpdating={directUpdateStates[activity.id || ''] || false}
							animationDelay={`${index * 100}ms`}
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
