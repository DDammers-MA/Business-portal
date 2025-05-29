import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '../../../utils/firebase.browser';
import styles from './adminControls.module.scss';

interface AdminControlsProps {
	userId: string;
	isAdmin: boolean;
	isCurrentUser: boolean;
	isLastAdmin: boolean;
	onStatusChange: () => void;
	onEdit: () => void;
	onDelete: () => void;
	userName: string;
}

const AdminControls: React.FC<AdminControlsProps> = ({
	userId,
	isAdmin,
	isCurrentUser,
	isLastAdmin,
	onStatusChange,
	onEdit,
	onDelete,
	userName,
}) => {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleToggleMenu = () => {
		if (!isOpen && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setMenuPosition({
				top: rect.bottom + window.scrollY,
				left: rect.left + rect.width / 2 - 90, // Half of min-width (180px)
			});
		}
		setIsOpen(!isOpen);
	};

	const handleAdminAction = async () => {
		if (isLoading || !user) return;
		if (isCurrentUser) {
			setError('You cannot change your own admin status');
			return;
		}
		if (isLastAdmin && isAdmin) {
			setError('Cannot demote the last admin');
			return;
		}

		const action = isAdmin ? 'remove admin rights from' : 'make';
		const confirmMessage = `Are you sure you want to ${action} ${userName} ${
			isAdmin ? '' : 'an admin'
		}?`;

		if (!window.confirm(confirmMessage)) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const token = await user.getIdToken();
			const endpoint = isAdmin
				? '/api/auth/admin/demote'
				: '/api/auth/admin/promote';

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ targetUserId: userId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to update admin status');
			}

			onStatusChange();
			setIsOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAction = (action: () => void) => {
		action();
		setIsOpen(false);
	};

	return (
		<div className={styles.dropdown} ref={dropdownRef}>
			<button
				ref={triggerRef}
				onClick={handleToggleMenu}
				className={styles.dropdown__trigger}
				title="Actions"
			>
				<i className="fa-solid fa-ellipsis"></i>
			</button>

			{isOpen && (
				<div
					className={styles.dropdown__menu}
					style={{
						top: `${menuPosition.top}px`,
						left: `${menuPosition.left}px`,
					}}
				>
					<button
						onClick={() => handleAction(onEdit)}
						className={styles.dropdown__item}
						title="Edit user"
					>
						<i className="fa-regular fa-pen-to-square"></i>
						<span>Edit</span>
					</button>

					{user && !isCurrentUser && (
						<button
							onClick={handleAdminAction}
							disabled={isLoading || (isLastAdmin && isAdmin) || isCurrentUser}
							className={styles.dropdown__item}
							title={isAdmin ? 'Remove admin rights' : 'Grant admin rights'}
						>
							<i
								className={`fa-solid ${
									isAdmin ? 'fa-crown text-purple-600' : 'fa-crown'
								}`}
							></i>
							<span>{isAdmin ? 'Remove Admin' : 'Make Admin'}</span>
						</button>
					)}

					{!isCurrentUser && (
						<button
							onClick={() => handleAction(onDelete)}
							className={`${styles.dropdown__item} ${styles.dropdown__item_danger}`}
							title="Delete user"
						>
							<i className="fa-solid fa-trash"></i>
							<span>Delete</span>
						</button>
					)}
				</div>
			)}

			{error && <p className={styles.dropdown__error}>{error}</p>}
		</div>
	);
};

export default AdminControls;
