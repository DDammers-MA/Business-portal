'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/modal/modal'; 
import styles from './denyModal.module.scss'; 

interface DenyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const DenyModal: React.FC<DenyModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for denying the event.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(reason);
            setReason(''); 
            onClose(); 
        } catch (error) {
            console.error('Error submitting reason:', error);
            alert('Failed to submit the reason. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.modal}>
                <h2 className={styles.modal__title}>Deny Event</h2>
                <p className={styles.modal__description}>
                    Please provide a reason for denying this event.
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