import React, { useState } from 'react';
import { Modal } from '@/components/modal/modal';
import styles from './profile.module.scss';
import { toast } from 'sonner';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
            toast.success('Password changed successfully');
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Change Password</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.showText}
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">New Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.showText}
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.showText}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.modalButtonCancel}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.modalButtonSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default PasswordChangeModal; 