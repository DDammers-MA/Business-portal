import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '../../../utils/firebase.browser';

interface AdminControlsProps {
	userId: string;
	isAdmin: boolean;
	isCurrentUser: boolean;
	isLastAdmin: boolean;
	onStatusChange: () => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({
	userId,
	isAdmin,
	isCurrentUser,
	isLastAdmin,
	onStatusChange,
}) => {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-start gap-2">
			<button
				onClick={handleAdminAction}
				disabled={
					isLoading || (isLastAdmin && isAdmin) || isCurrentUser || !user
				}
				className={`px-3 py-1 rounded text-sm font-medium transition-colors
                    ${
											isAdmin
												? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400'
												: 'bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400'
										}`}
			>
				{isLoading ? 'Processing...' : isAdmin ? 'Remove Admin' : 'Make Admin'}
			</button>

			{error && <p className="text-sm text-red-600">{error}</p>}

			{isLastAdmin && isAdmin && (
				<p className="text-sm text-gray-500">Cannot demote the last admin</p>
			)}

			{isCurrentUser && (
				<p className="text-sm text-gray-500">
					Cannot modify your own admin status
				</p>
			)}
		</div>
	);
};

export default AdminControls;
