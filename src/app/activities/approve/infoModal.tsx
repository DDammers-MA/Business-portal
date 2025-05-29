'use client';

import React from 'react';
import { Modal } from '@/components/modal/modal';
import { FormData } from '@/types/FormData';
import { UserDetails } from './actions';
import Image from 'next/image';
import styles from './infomodal.module.scss';
import { useAuth } from '@/context/AuthContext';
import TransferOwnership from '@/components/AdminControls/TransferOwnership';

interface ActivityInfoModalProps {
	isOpen: boolean;
	onClose: () => void;
	activity: FormData;
	creatorData: UserDetails | null;
	modalUserLoading: boolean;
	modalActionLoading: boolean;
	onStatusUpdate: (newStatus: 'published' | 'denied') => void;
	onTransferComplete?: () => void;
}

export const ActivityInfoModal: React.FC<ActivityInfoModalProps> = ({
	isOpen,
	onClose,
	activity,
	creatorData,
	modalUserLoading,
	onTransferComplete,
}) => {
	const imageUrl = activity.image_url || '/images/default.png';
	const { isAdmin } = useAuth();

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modal}>
				<div className={styles.modal__Header}>
					{activity.type === 'event' ? 'Event Details' : 'Activity Details'}
				</div>
				<div className={styles.modal__Body}>
					<div className={styles.modal__ImageContainer}>
						{activity.image_url ? (
							<Image
								src={imageUrl}
								alt={`${
									activity.type === 'event' ? 'Event' : 'Activity'
								} image`}
								fill
								style={{ objectFit: 'contain' }}
								sizes="(max-width: 768px) 100vw, 50vw"
								onError={(e) => {
									(e.target as HTMLImageElement).src = '/images/default.png'; // Fallback to default image
								}}
							/>
						) : (
							<div className={styles.message}>No Image Provided</div>
						)}
					</div>

					{activity.status === 'denied' && activity.denyReason && (
						<div className={styles.modal__DenyReason}>
							<h4 className={styles.modal__DenyReasonTitle}>Denial Reason</h4>
							<p className={styles.modal__DenyReasonText}>
								{activity.denyReason}
							</p>
						</div>
					)}

					<div className={styles.modal__DetailsSection}>
						<div className={styles.modal__Section}>
							<h3 className={styles.modal__ActivityTitle}>{activity.name}</h3>
							<p className={styles.modal__Text}>{activity.description}</p>
							<br></br>

							{[
								{ label: 'Published', value: activity.active ? 'Yes' : 'No' },
								{ label: 'Address', value: activity.addr || 'Not specified' },
								{ label: 'Date', value: activity.date },
								{ label: 'Type', value: activity.type },
								{ label: 'Place', value: activity.place },
								{ label: 'Postal Code', value: activity.postal_code },
								{ label: 'Start Time', value: activity.start_time },
								{ label: 'End Time', value: activity.end_time },
								{ label: 'Budget', value: activity.budget },
								{ label: 'Phone', value: activity.phone },
								{ label: 'Contact Email', value: activity.email },
							].map(
								(field, idx) =>
									field.value && (
										<div className={styles.modal__DetailItem} key={idx}>
											<strong>{field.label}:</strong> {field.value}
										</div>
									)
							)}
						</div>

						<div className={styles.modal__Section}>
							<h4 className={styles.modal__SectionTitle}>Submitted By</h4>
							{modalUserLoading ? (
								<div className={styles.spinner}></div>
							) : creatorData ? (
								<div className={styles.modal__UserInfo}>
									<p>
										<strong>Name:</strong>{' '}
										{creatorData.companyName ||
											creatorData.displayName ||
											'N/A'}
									</p>
									<p>
										<strong>Email:</strong> {creatorData.email || 'N/A'}
									</p>
									{isAdmin && activity.id && activity.creatorUid && (
										<div className={styles.modal__AdminActions}>
											<TransferOwnership
												activityId={activity.id}
												currentOwnerId={activity.creatorUid}
												onTransferComplete={() => {
													onTransferComplete?.();
													onClose();
												}}
											/>
										</div>
									)}
								</div>
							) : (
								<p className={styles.modalText}>
									Creator information not available.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};
