'use client';

import { useState, useTransition, useEffect } from 'react';
import styles from './user.module.scss';
import { Modal } from '@/components/modal/modal';
import { CombinedUser } from './page'; // Import the type from page.tsx
// Import Server Actions
import { addUserAction, updateUserAction, deleteUserAction } from './actions';

// Infer return types for better type safety (or define explicit types)
type AddUserResult = Awaited<ReturnType<typeof addUserAction>>;
type UpdateUserResult = Awaited<ReturnType<typeof updateUserAction>>;
type DeleteUserResult = Awaited<ReturnType<typeof deleteUserAction>>;

interface UserManagementClientProps {
	initialUsers: CombinedUser[];
}

export default function UserManagementClient({
	initialUsers,
}: UserManagementClientProps) {
	const [users, setUsers] = useState<CombinedUser[]>(initialUsers);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// Use Partial<CombinedUser> | null for currentUser to handle both editing and adding new
	const [currentUser, setCurrentUser] = useState<Partial<CombinedUser> | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState('');

	// State for loading and errors
	const [isPending, startTransition] = useTransition(); // For form submission/deletion loading
	const [formError, setFormError] = useState<string | null>(null);
	// Optional: state to track which user is being deleted for specific feedback
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

	// Filter users based on search term (case-insensitive)
	const filteredUsers = users.filter(
		(user) =>
			(user.companyName?.toLowerCase() || '').includes(
				searchTerm.toLowerCase()
			) || (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
	);

	// --- Handlers calling Server Actions ---

	const handleDeleteUser = (userId: string) => {
		if (isPending) return; // Prevent multiple deletions at once

		// Confirm before deleting (optional but recommended)
		if (
			!window.confirm(
				'Are you sure you want to delete this user? This action cannot be undone.'
			)
		) {
			return;
		}

		setDeletingUserId(userId); // Indicate which user is being deleted
		setFormError(null); // Clear previous errors

		startTransition(async () => {
			const result: DeleteUserResult = await deleteUserAction(userId);
			if (result.success) {
				// Remove user from local state on successful deletion
				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
				// Optionally show a success message (e.g., using a toast library)
				console.log(result.message);
			} else {
				// Show error message (could be displayed near the deleted row or globally)
				setFormError(result.message);
				console.error('Deletion failed:', result.message);
			}
			setDeletingUserId(null); // Clear deleting indicator
		});
	};

	const handleFormSubmit = (userFormData: Partial<CombinedUser>) => {
		if (isPending) return;
		setFormError(null);

		startTransition(async () => {
			try {
				if (currentUser && currentUser.id) {
					// --- Edit User ---
					const { companyName, phone, kvk } = userFormData;
					const updateData = { companyName, phone, kvk };
					const result: UpdateUserResult = await updateUserAction(
						currentUser.id,
						updateData
					);
					if (result.success) {
						setUsers((prevUsers) =>
							prevUsers.map((u) =>
								u.id === currentUser.id ? { ...u, ...updateData } : u
							)
						);
						setIsModalOpen(false);
						setCurrentUser(null);
					} else {
						setFormError(result.message);
					}
				} else {
					// --- Add User ---
					if (!userFormData.email) {
						setFormError('Email is required to add a new user.');
						return;
					}
					const addData = {
						email: userFormData.email,
						companyName: userFormData.companyName,
						phone: userFormData.phone,
					};
					// Call addUserAction specifically here
					const result: AddUserResult = await addUserAction(addData);
					// Now TypeScript knows result is AddUserResult
					if (result.success && result.newUser) {
						// Add new user to local state, casting to ensure type match
						setUsers((prevUsers) => [
							...prevUsers,
							result.newUser as CombinedUser,
						]);
						setIsModalOpen(false);
						setCurrentUser(null);
					} else {
						// Handle failure case for addUserAction
						setFormError(result.message || 'Failed to add user.');
					}
				}
			} catch (error) {
				console.error('Form submission error:', error);
				setFormError('An unexpected error occurred during submission.');
			}
		});
	};

	return (
		<div className={styles.user__container}>
			<div className={styles.user__header}>
				<div className={styles.user__searchBar}>
					<i className="fa-solid fa-magnifying-glass"></i>
					<input
						type="text"
						placeholder="Search users by name or email"
						className={styles.user__inputField}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						disabled={isPending} // Disable search while actions are pending
					/>
				</div>
				<button
					className={styles.user__addUserButton}
					onClick={() => {
						setCurrentUser(null); // Clear current user for add mode
						setFormError(null); // Clear errors when opening modal
						setIsModalOpen(true);
					}}
					disabled={isPending} // Disable button while actions are pending
				>
					Add new user
				</button>
			</div>

			{/* Display global errors (like delete error) here if needed */}
			{formError && !isModalOpen && (
				<p className={styles.errorBanner}>{formError}</p>
			)}

			<div className={styles.user__userList}>
				{filteredUsers.map((user) => (
					<div
						key={user.id}
						className={`${styles.user__userRow} ${
							deletingUserId === user.id ? styles.deleting : ''
						}`}
					>
						<i
							className={`fa-regular fa-circle-user ${styles.user__userIcon}`}
						></i>
						<span className={styles.user__userName}>
							{user.companyName || user.email || 'N/A'}
						</span>
						{/* Add spinner or disable buttons when deleting this specific user */}
						{deletingUserId === user.id ? (
							<span className={styles.spinner}></span> // Add a spinner style
						) : (
							<>
								<i
									className={`fa-regular fa-pen-to-square ${
										styles.user__editIcon
									} ${isPending ? styles.disabledIcon : ''}`}
									onClick={() => {
										if (isPending) return;
										setCurrentUser(user); // Set user for editing
										setFormError(null); // Clear errors
										setIsModalOpen(true);
									}}
									title="Edit User"
									aria-disabled={isPending}
								></i>
								<i
									className={`fa-solid fa-trash ${styles.user__deleteIcon} ${
										isPending ? styles.disabledIcon : ''
									}`}
									onClick={() => handleDeleteUser(user.id)} // Pass user ID
									title="Delete User"
									aria-disabled={isPending}
								></i>
							</>
						)}
					</div>
				))}
				{filteredUsers.length === 0 && <p>No users found.</p>}
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					if (isPending) return; // Prevent closing while submitting
					setIsModalOpen(false);
					setCurrentUser(null); // Reset current user on close
					setFormError(null); // Clear errors on close
				}}
			>
				<UserForm
					user={currentUser}
					onSubmit={handleFormSubmit}
					isLoading={isPending} // Pass loading state to form
					error={formError} // Pass error state to form
					clearError={() => setFormError(null)} // Allow form to clear error
				/>
			</Modal>
		</div>
	);
}

// --- UserForm Component --- Props updated

interface UserFormProps {
	user: Partial<CombinedUser> | null;
	onSubmit: (formData: Partial<CombinedUser>) => void;
	isLoading: boolean; // Added prop
	error: string | null; // Added prop
	clearError: () => void; // Added prop
}

function UserForm({
	user,
	onSubmit,
	isLoading,
	error,
	clearError,
}: UserFormProps) {
	const [formData, setFormData] = useState<Partial<CombinedUser>>({});


	// Effect to initialize/reset form data when user or modal state changes
	useEffect(() => {
		setFormData({
			companyName: user?.companyName || '',
			email: user?.email || '',
			phone: user?.phone || '',
			
			kvk: user?.kvk || '',
			// Only include fields relevant to the form
		});
		// Clear previous errors when the form is re-initialized
		if (error) clearError();
	}, [user, error, clearError]); // Added error and clearError to dependencies

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (error) clearError();
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isLoading) return;
		onSubmit(formData);
	};

	const isEditMode = !!user?.id;

	return (
		<form className={styles.modalForm} onSubmit={handleSubmit}>
			<h3>
				{isEditMode ? `Edit ${formData.companyName || 'User'}` : 'Add New User'}
			</h3>

			{/* Display Form Error */}
			{error && <p className={styles.errorBannerModal}>{error}</p>}

			<div>
				<label htmlFor="email">Email:</label>
				<input
					id="email"
					type="email"
					name="email"
					value={formData.email || ''} 
					onChange={handleChange}
					className={styles.inputField}
					disabled={isLoading || isEditMode} 
					required={!isEditMode}
					readOnly={isEditMode}
					aria-describedby={
						error && error.toLowerCase().includes('email')
							? 'form-error'
							: undefined
					}
				/>
			</div>

			<div>
				<label htmlFor="companyName">Company Name:</label>
				<input
					id="companyName"
					type="text"
					name="companyName"
					value={formData.companyName || ''}
					onChange={handleChange}
					className={styles.inputField}
					disabled={isLoading}
					aria-describedby={
						error && error.toLowerCase().includes('company')
							? 'form-error'
							: undefined
					}
				/>
			</div>

			<div>
	<label htmlFor="kvk">KVK Number:</label>
	<input
		id="kvk"
		type="number"
		name="kvk"
		value={formData.kvk || ''}
		onChange={handleChange}
		className={styles.inputField}
		disabled={isLoading}
		aria-describedby={
			error && error.toLowerCase().includes('kvk')
				? 'form-error'
				: undefined
		}
	/>
</div>





			<div>
				<label htmlFor="phone">Phone Number:</label>
				<input
					id="phone"
					type="tel"
					name="phone"
					value={formData.phone || ''}
					onChange={handleChange}
					className={styles.inputField}
					disabled={isLoading}
					aria-describedby={
						error && error.toLowerCase().includes('phone')
							? 'form-error'
							: undefined
					}
				/>
			</div>

			{/* Add id to error message for better accessibility */}
			{error && (
				<p id="form-error" className="sr-only">
					Error: {error}
				</p>
			)}

			<button className={styles.saveButton} type="submit" disabled={isLoading}>
				{isLoading ? (
					<span className={styles.spinner}></span>
				) : isEditMode ? (
					'Save Changes'
				) : (
					'Add User'
				)}
			</button>
		</form>
	);
}
