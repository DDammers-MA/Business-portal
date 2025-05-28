'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import styles from './user.module.scss';
import { Modal } from '@/components/modal/modal';
import type { CombinedUser } from './types';
import { addUserAction, updateUserAction, deleteUserAction } from './actions';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	flexRender,
	createColumnHelper,
	SortingState,
} from '@tanstack/react-table';
import { PasswordField } from '@/components/password-field/PasswordField';
import AdminBadge from '@/components/AdminBadge';
import AdminControls from '@/components/AdminControls';

type AddUserResult = Awaited<ReturnType<typeof addUserAction>>;
type UpdateUserResult = Awaited<ReturnType<typeof updateUserAction>>;
type DeleteUserResult = Awaited<ReturnType<typeof deleteUserAction>>;

interface UserManagementClientProps {
	initialUsers: CombinedUser[];
}

export default function UserManagementClient({
	initialUsers,
}: UserManagementClientProps) {
	const { user: loggedInUser, isAdmin } = useAuth();
	const [users, setUsers] = useState<CombinedUser[]>(initialUsers);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<Partial<CombinedUser> | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState('');
	const [sorting, setSorting] = useState<SortingState>([]);

	const [isPending, startTransition] = useTransition();
	const [formError, setFormError] = useState<string | null>(null);
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

	const columnHelper = createColumnHelper<CombinedUser>();

	const adminCount = useMemo(
		() => users.filter((u) => u.isAdmin).length,
		[users]
	);

	const handleAdminStatusChange = () => {
		// Refresh the users list to get updated admin statuses
		window.location.reload();
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor(
				(row) => row.companyName || row.displayName || row.email || 'Unknown',
				{
					id: 'user',
					header: 'User',
					cell: (info) => (
						<div className={styles.user__userCell}>
							<i className={`fa-solid fa-user ${styles.user__userIcon}`}></i>
							<span className={styles.user__userName}>{info.getValue()}</span>
						</div>
					),
				}
			),
			columnHelper.accessor('email', {
				header: 'Email address',
				cell: (info) => info.getValue() || 'No email address',
			}),
			columnHelper.accessor('phone', {
				header: 'Phone number',
				cell: (info) => info.getValue() || 'No phone number',
			}),
			columnHelper.accessor('lastLoginAt', {
				header: 'Last login',
				cell: (info) =>
					info.getValue()
						? new Date(info.getValue()!).toLocaleString()
						: 'No login data',
			}),
			columnHelper.accessor('isAdmin', {
				header: 'Role',
				cell: (info) => (info.getValue() ?? false) && <AdminBadge />,
			}),
			columnHelper.accessor('id', {
				id: 'actions',
				header: 'Actions',
				cell: (info) => (
					<div className={styles.user__actions}>
						<i
							className={`fa-regular fa-pen-to-square ${styles.user__editIcon}`}
							title="Edit user"
							onClick={() => {
								if (isPending) return;
								setCurrentUser(info.row.original);
								setFormError(null);
								setIsModalOpen(true);
							}}
						></i>
						<i
							className={`fa-solid fa-trash ${styles.user__deleteIcon}`}
							title="Delete user"
							onClick={() => handleDeleteUser(info.getValue())}
						></i>
						{isAdmin && (
							<AdminControls
								userId={info.getValue()}
								isAdmin={Boolean(info.row.original.isAdmin)}
								isCurrentUser={info.getValue() === loggedInUser?.uid}
								isLastAdmin={
									adminCount === 1 && Boolean(info.row.original.isAdmin)
								}
								onStatusChange={handleAdminStatusChange}
							/>
						)}
					</div>
				),
			}),
		],
		[isPending, isAdmin, loggedInUser?.uid, adminCount]
	);

	const filteredData = useMemo(
		() =>
			users.filter(
				(user) =>
					(user.displayName?.toLowerCase() || '').includes(
						searchTerm.toLowerCase()
					) ||
					(user.email?.toLowerCase() || '').includes(
						searchTerm.toLowerCase()
					) ||
					(user.companyName?.toLowerCase() || '').includes(
						searchTerm.toLowerCase()
					)
			),
		[users, searchTerm]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	const handleDeleteUser = (userId: string) => {
		if (isPending) return;

		// Prevent self-deletion
		if (userId === loggedInUser?.uid) {
			toast.error('You cannot delete your own account');
			return;
		}

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
				toast.success('User deleted successfully');
				setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
				console.log(result.message);
			} else {
				toast.error(`Failed to delete user: ${result.message}`);
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
						toast.success('User updated successfully');
					} else {
						setFormError(result.message);
						toast.error(`Failed to update user: ${result.message}`);
					}
				} else {
					if (!userFormData.email) {
						setFormError('Email is required to add a new user.');
						toast.error('Email is required to add a new user');
						return;
					}
					if (!loggedInUser) {
						setFormError('Cannot add user: Logged in user not found.');
						toast.error('Cannot add user: You are not logged in');
						return;
					}
					const addData = {
						email: userFormData.email,
						companyName: userFormData.companyName || '',
						phone: userFormData.phone || '',
						kvk: userFormData.kvk || '',
						password: userFormData.password,
					};
					const result: AddUserResult = await addUserAction(
						addData,
						loggedInUser.uid
					);
					if (result.success && result.newUser) {
						setUsers((prevUsers) => [
							...prevUsers,
							result.newUser as CombinedUser,
						]);
						setIsModalOpen(false);
						setCurrentUser(null);
						toast.success(result.message || 'User added successfully');
					} else {
						setFormError(result.message || 'Failed to add user.');
						toast.error(result.message || 'Failed to add user');
					}
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'An unexpected error occurred';
				toast.error(`Form submission error: ${errorMessage}`);
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

			<div className={styles.user__tableContainer}>
				<table className={styles.user__table}>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										onClick={header.column.getToggleSortingHandler()}
										className={styles.user__sortableHeader}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
										{{
											asc: ' 🔼',
											desc: ' 🔽',
										}[header.column.getIsSorted() as string] ?? null}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className={styles.user__row}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredData.length === 0 && <p>No users found.</p>}

			<div className={styles.user__pagination}>
				<button
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
					className={styles.user__paginationButton}
				>
					{'<<'}
				</button>
				<button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className={styles.user__paginationButton}
				>
					{'<'}
				</button>
				<span className={styles.user__paginationInfo}>
					Page {table.getState().pagination.pageIndex + 1} of{' '}
					{table.getPageCount()}
				</span>
				<button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className={styles.user__paginationButton}
				>
					{'>'}
				</button>
				<button
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
					className={styles.user__paginationButton}
				>
					{'>>'}
				</button>
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
					setError={(error: string) => setFormError(error)}
				/>
			</Modal>
		</div>
	);
}

interface UserFormProps {
	user: Partial<CombinedUser> | null;
	onSubmit: (formData: Partial<CombinedUser> & { password?: string }) => void;
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
	setError: (error: string) => void;
}

function UserForm({
	user,
	onSubmit,
	isLoading,
	error,
	clearError,
	setError,
}: UserFormProps) {
	const [formData, setFormData] = useState<Partial<CombinedUser>>({});
	const [passwordMode, setPasswordMode] = useState<'email' | 'manual'>('email');
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');

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
		setFormData((prev: Partial<CombinedUser>) => ({ ...prev, [name]: value }));
		if (error) clearError();
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isLoading) return;

		if (!isEditMode && passwordMode === 'manual') {
			if (!password || !repeatPassword) {
				clearError();
				setError('Please fill in both password fields.');
				return;
			}
			if (password !== repeatPassword) {
				clearError();
				setError('Passwords do not match.');
				return;
			}
			onSubmit({ ...formData, password });
		} else {
			onSubmit({ ...formData });
		}
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
				/>
			</div>

			{!isEditMode && (
				<>
					<div className={styles.passwordModeContainer}>
						<label>Password Creation:</label>
						<div className={styles.radioGroup}>
							<label>
								<input
									type="radio"
									name="passwordMode"
									value="email"
									checked={passwordMode === 'email'}
									onChange={() => setPasswordMode('email')}
									disabled={isLoading}
								/>
								Send password reset email
							</label>
							<label>
								<input
									type="radio"
									name="passwordMode"
									value="manual"
									checked={passwordMode === 'manual'}
									onChange={() => setPasswordMode('manual')}
									disabled={isLoading}
								/>
								Set password manually
							</label>
						</div>
					</div>

					{passwordMode === 'manual' && (
						<PasswordField
							password={password}
							setPassword={setPassword}
							repeatPassword={repeatPassword}
							setRepeatPassword={setRepeatPassword}
							isLoading={isLoading}
						/>
					)}
				</>
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
