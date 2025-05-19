'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import styles from './user.module.scss';
import { Modal } from '@/components/modal/modal';
import { CombinedUser } from './page';
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

type AddUserResult = Awaited<ReturnType<typeof addUserAction>>;
type UpdateUserResult = Awaited<ReturnType<typeof updateUserAction>>;
type DeleteUserResult = Awaited<ReturnType<typeof deleteUserAction>>;

interface UserManagementClientProps {
    initialUsers: CombinedUser[];
}

export default function UserManagementClient({
    initialUsers,
}: UserManagementClientProps) {
    // Hier haal ik de ingelogde gebruiker op uit context
    const { user: loggedInUser } = useAuth();
    // Hier is de state voor gebruikers, modals, zoeken, sorteren, etc.
    const [users, setUsers] = useState<CombinedUser[]>(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<CombinedUser> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Dit is een kolomdefinities voor de gebruikers-tabel
    const columnHelper = createColumnHelper<CombinedUser>();

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.companyName || row.displayName || row.email || 'Onbekend', {
                id: 'user',
                header: 'User',
                cell: (info) => (
                    //Hier toon ik de gebruikersnaam met een icoon ervoor
                    <div className={styles.user__userCell}>
                        <i className={`fa-solid fa-user ${styles.user__userIcon}`}></i>
                        <span className={styles.user__userName}>{info.getValue()}</span>
                    </div>
                ),
            }),

            // Hier defineer ik de kolommen voor de tabel
            // De informatie wordt weergegeven met een fallback tekst als het veld leeg is
            columnHelper.accessor('email', {
                header: 'Email address',
                cell: (info) => info.getValue() || 'Geen e-mailadres',
            }),
            columnHelper.accessor('phone', {
                header: 'Phone number',
                cell: (info) => info.getValue() || 'Geen telefoonnummer',
            }),
            columnHelper.accessor('lastLoginAt', {
                header: 'Last login',
                cell: (info) => info.getValue() ? new Date(info.getValue()!).toLocaleString() : 'No login data',
            }),
            columnHelper.accessor('id', {
                id: 'actions',
                header: 'Actions',
                cell: (info) => (
                    //Actie-iconen voor wijzigen en verwijderen
                    <div className={styles.user__actions}>
                        <i
                            className={`fa-regular fa-pen-to-square ${styles.user__editIcon}`}
                            title="Wijzig gebruiker"
                            onClick={() => {
                                if (isPending) return;
                                setCurrentUser(info.row.original);
                                setFormError(null);
                                setIsModalOpen(true);
                            }}
                        ></i>
                        <i
                            className={`fa-solid fa-trash ${styles.user__deleteIcon}`}
                            title="Verwijder gebruiker"
                            onClick={() => handleDeleteUser(info.getValue())}
                        ></i>
                    </div>
                ),
            }),
        ],
        [isPending]
    );

    //Hier filter ik gebruikers op naam, email of bedrijfsnaam
    const filteredData = useMemo(
        () =>
            users.filter(
                (user) =>
                    (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (user.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            ),
        [users, searchTerm]
    );

    //Hier initialiseer ik de react-table met de gefilterde data en kolommen 
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

    // Hier heb ik een handler voor verwijderen van een gebruiker
    //met een are u sure tekstje erbij tijdens het uitvoeren
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
                toast.success('User deleted successfully!');
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                console.log(result.message);
            } else {
                toast.error('Failed to delete user!')
                setFormError(result.message);
                console.error('Deletion failed:', result.message);
            }
            setDeletingUserId(null);
        });
    };

    //Hier is een handler voor het toevoegen of wijzigen van een gebruiker
    const handleFormSubmit = (userFormData: Partial<CombinedUser>) => {
        if (isPending) return;
        setFormError(null);

        startTransition(async () => {
            try {
                if (currentUser && currentUser.id) {
                    //Hier worden bestaande gebruikers geupdated
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
                    //Hier worden nieuwe gebruikers toegevoegd
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
                toast.error('Form submission error')
                console.error('Form submission error:', error);
                setFormError('An unexpected error occurred during submission.');
            }
        });
    };

    // Hier word gebruikersbeheer UI gerenderd
    return (
        <div className={styles.user__container}>
            {/* Dit is de html van de header met zoekbalk en knop voor nieuwe gebruiker */}
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

            {/* Dit is een foutmelding die word getoond als er iets fout gaat */}
            {formError && !isModalOpen && (
                <p className={styles.errorBanner}>{formError}</p>
            )}

            {/* De html van de  Gebruikerstabel */}
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
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* melding die komt als er geen gebruikers gevonden melding */}
            {filteredData.length === 0 && <p>No users found.</p>}

            {/* Pagina knoppen voor verschilldende paginas van de tabel als er meerdere users komen */}
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

            {/*  Modal voor toevoegen/wijzigen gebruiker */}
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

//Props voor het gebruikersformulier
interface UserFormProps {
    user: Partial<CombinedUser> | null;
    onSubmit: (formData: Partial<CombinedUser>) => void;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

// Hier is de formuliercomponent voor toevoegen/wijzigen gebruiker
function UserForm({
    user,
    onSubmit,
    isLoading,
    error,
    clearError,
}: UserFormProps) {
    // Hier is de state voor formulierdata
    const [formData, setFormData] = useState<Partial<CombinedUser>>({});

    //vul  de formulier met bestaande data bij openen of reset error
    useEffect(() => {
        setFormData({
            companyName: user?.companyName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            kvk: user?.kvk || '',
        });
        if (error) clearError();
    }, [user, error, clearError]);

    // Hier is een handler voor inputwijzigingen
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    // Hier is een handler voor formulier submit
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        onSubmit(formData);
    };

    // Hier wordt bepaald of het formulier in edit-modus is
    const isEditMode = !!user?.id;

    // Hier worde formulier gerenderd 
    return (
        <form className={styles.modalForm} onSubmit={handleSubmit}>
            <h3>
                {isEditMode ? `Edit ${formData.companyName || 'User'}` : 'Add New User'}
            </h3>

            {/* Voor een foutmelding in het formulier */}
            {error && <p className={styles.errorBannerModal}>{error}</p>}

               {/* De HTML van de render */}
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