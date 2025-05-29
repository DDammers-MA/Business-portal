'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import styles from './TransferOwnership.module.scss';

interface User {
	id: string;
	email: string;
	companyName?: string;
	displayName?: string;
}

interface TransferOwnershipProps {
	activityId: string;
	currentOwnerId: string;
	onTransferComplete?: () => void;
}

export default function TransferOwnership({
	activityId,
	currentOwnerId,
	onTransferComplete,
}: TransferOwnershipProps) {
	const { user, isAdmin } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [showConfirm, setShowConfirm] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return users;

		const query = searchQuery.toLowerCase();
		return users.filter((user) => {
			const name = (user.companyName || user.displayName || '').toLowerCase();
			const email = user.email.toLowerCase();
			return name.includes(query) || email.includes(query);
		});
	}, [users, searchQuery]);

	// Fetch users when component mounts
	const fetchUsers = async () => {
		try {
			const token = await user?.getIdToken();
			const response = await fetch('/api/auth/admin/users/batch', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to fetch companies');

			const data = await response.json();
			setUsers(data.users.filter((u: User) => u.id !== currentOwnerId));
		} catch (error) {
			console.error('Error fetching companies:', error);
			toast.error('Failed to load companies');
		}
	};

	const handleTransfer = async () => {
		if (!selectedUserId) {
			toast.error('Please select a new owner');
			return;
		}

		try {
			setIsLoading(true);
			const token = await user?.getIdToken();
			const response = await fetch('/api/admin/activity/transfer', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					activityId,
					newOwnerId: selectedUserId,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Transfer failed');
			}

			toast.success('Activity ownership transferred successfully');
			setShowConfirm(false);
			setSelectedUserId('');
			onTransferComplete?.();
		} catch (error) {
			console.error('Transfer error:', error);
			toast.error(error instanceof Error ? error.message : 'Transfer failed');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isAdmin) return null;

	return (
		<div className={styles.container}>
			<button
				onClick={() => {
					fetchUsers();
					setShowConfirm(true);
				}}
				className={styles.transferButton}
				disabled={isLoading}
			>
				Transfer Ownership
			</button>

			{showConfirm && (
				<div className={styles.modal}>
					<div className={styles.modalContent}>
						<h3>Transfer Activity Ownership</h3>
						<p>Select the new owner for this activity:</p>

						<input
							type="text"
							placeholder="Search by name or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className={styles.searchInput}
						/>

						<select
							value={selectedUserId}
							onChange={(e) => setSelectedUserId(e.target.value)}
							className={styles.select}
							size={5}
						>
							<option value="">Select a user</option>
							{filteredUsers.map((user) => (
								<option key={user.id} value={user.id}>
									{user.companyName || user.displayName || 'Unnamed User'} (
									{user.email})
								</option>
							))}
						</select>

						<div className={styles.buttonGroup}>
							<button
								onClick={() => setShowConfirm(false)}
								className={styles.cancelButton}
								disabled={isLoading}
							>
								Cancel
							</button>
							<button
								onClick={handleTransfer}
								className={styles.confirmButton}
								disabled={isLoading || !selectedUserId}
							>
								{isLoading ? 'Transferring...' : 'Confirm Transfer'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
