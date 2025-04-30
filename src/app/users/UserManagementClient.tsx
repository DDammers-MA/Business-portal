'use client';

import { useState, useTransition, useEffect } from 'react';
import styles from './user.module.scss';
import { Modal } from '@/components/modal/modal';
import { CombinedUser } from './page';
import { addUserAction, updateUserAction, deleteUserAction } from './actions';
import { useAuth } from '@/context/AuthContext';

type AddUserResult = Awaited<ReturnType<typeof addUserAction>>;
type UpdateUserResult = Awaited<ReturnType<typeof updateUserAction>>;
type DeleteUserResult = Awaited<ReturnType<typeof deleteUserAction>>;

interface UserManagementClientProps {
	initialUsers: CombinedUser[];
}

export default function UserManagementClient({
	initialUsers,
}: UserManagementClientProps) {
	const { user: loggedInUser } = useAuth();
	const [users, setUsers] = useState<CombinedUser[]>(initialUsers);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<Partial<CombinedUser> | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState('');

	const [isPending, startTransition] = useTransition();
	const [formError, setFormError] = useState<string | null>(null);
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

	const filteredUsers = users.filter(
		(user) =>
			(user.companyName?.toLowerCase() || '').includes(
				searchTerm.toLowerCase()
			) || (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
	);

	const handleDeleteUser = (userId: string) => {
		if (isPending) return;

		if (
			!window.confirm(
				'Are you sure you want to delete this user? This action cannot be undone.'
			)
		) {
			return;
		}

		setDeletingUserId(userId);
		setFormError(null);

		startTransition(async () => {
			const result: DeleteUserResult = await deleteUserAction(userId);
			if (result.success) {
				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
				console.log(result.message);
			} else {
				setFormError(result.message);
				console.error('Deletion failed:', result.message);
			}
			setDeletingUserId(null);
		});
	};

	const handleFormSubmit = (userFormData: Partial<CombinedUser>) => {
		if (isPending) return;
		setFormError(null);

		startTransition(async () => {
			try {
				if (currentUser && currentUser.id) {
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
					if (!userFormData.email) {
						setFormError('Email is required to add a new user.');
						return;
					}
					if (!loggedInUser) {
						setFormError('Cannot add user: Logged in user not found.');
						return;
					}
					const addData = {
						email: userFormData.email,
						companyName: userFormData.companyName,
						phone: userFormData.phone,
						kvk: userFormData.kvk,
					};
					const result: AddUserResult = await addUserAction(addData, loggedInUser.uid);
					if (result.success && result.newUser) {
						setUsers((prevUsers) => [
							...prevUsers,
							result.newUser as CombinedUser,
						]);
						setIsModalOpen(false);
						setCurrentUser(null);
					} else {
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
						disabled={isPending}
					/>
				</div>
				<button
					className={styles.user__addUserButton}
					onClick={() => {
						setCurrentUser(null);
						setFormError(null);
						setIsModalOpen(true);
					}}
					disabled={isPending}
				>
					Add new user
				</button>
			</div>

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
						{deletingUserId === user.id ? (
							<span className={styles.spinner}></span>
						) : (
							<>
								<i
									className={`fa-regular fa-pen-to-square ${
										styles.user__editIcon
									} ${isPending ? styles.disabledIcon : ''}`}
									onClick={() => {
										if (isPending) return;
										setCurrentUser(user);
										setFormError(null);
										setIsModalOpen(true);
									}}
									title="Edit User"
									aria-disabled={isPending}
								></i>
								<i
									className={`fa-solid fa-trash ${styles.user__deleteIcon} ${
										isPending ? styles.disabledIcon : ''
									}`}
									onClick={() => handleDeleteUser(user.id)}
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
					if (isPending) return;
					setIsModalOpen(false);
					setCurrentUser(null);
					setFormError(null);
				}}
			>
				<UserForm
					user={currentUser}
					onSubmit={handleFormSubmit}
					isLoading={isPending}
					error={formError}
					clearError={() => setFormError(null)}
				/>
			</Modal>
		</div>
	);
}

interface UserFormProps {
	user: Partial<CombinedUser> | null;
	onSubmit: (formData: Partial<CombinedUser>) => void;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
}

function UserForm({
	user,
	onSubmit,
	isLoading,
	error,
	clearError,
}: UserFormProps) {
	const [formData, setFormData] = useState<Partial<CombinedUser>>({});

	useEffect(() => {
		setFormData({
			companyName: user?.companyName || '',
			email: user?.email || '',
			phone: user?.phone || '',
			kvk: user?.kvk || '',
		});
		if (error) clearError();
	}, [user, error, clearError]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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
