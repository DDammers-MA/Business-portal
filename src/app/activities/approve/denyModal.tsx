'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/modal/modal';
import styles from './denyModal.module.scss';
import { toast } from 'sonner';

interface DenyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (reason: string) => void;
	activity?: any;
}

const DenyModal: React.FC<DenyModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	activity,
}) => {
	const [reason, setReason] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!reason.trim()) {
			toast.error('Please provide a reason for denying the event.');
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(reason);
			setReason('');
			onClose();
			toast.success(
				`${
					activity?.type === 'event' ? 'Event' : 'Activity'
				} has been denied successfully`
			);
		} catch (error) {
			console.error('Error submitting reason:', error);
			toast.error('Failed to submit the reason. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modal}>
				<h2 className={styles.modal__title}>
					Deny {activity?.type === 'event' ? 'Event' : 'Activity'}
				</h2>
				<p className={styles.modal__description}>
					Please provide a reason for denying this{' '}
					{activity?.type === 'event' ? 'event' : 'activity'}.
				</p>
				<textarea
					className={styles.modal__textarea}
					placeholder="Enter your reason here..."
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					disabled={isSubmitting}
				/>
				<div className={styles.modal__actions}>
					<button
						className={styles.modal__buttonCancel}
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						className={styles.modal__buttonSubmit}
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default DenyModal;
