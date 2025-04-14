import { firebaseAdmin, db } from '../../../utils/firebase.admin'; // Corrected relative path again
import { UserRecord } from 'firebase-admin/auth';
import admin from 'firebase-admin'; // Needed for FieldPath, QuerySnapshot, QueryDocumentSnapshot
import UserManagementClient from './UserManagementClient'; // Import the new client component
import styles from './user.module.scss';

// Define the structure for Firestore user data
interface FirestoreUserData {
	companyName?: string;
	phone?: string;
	createdAt?: admin.firestore.Timestamp;
	// Add other fields from Firestore as needed
}

// Define the structure for the combined user data
export type CombinedUser = {
	id: string; // Firebase UID
	email?: string;
	displayName?: string | null; // From Auth
	photoURL?: string | null; // From Auth
	companyName?: string; // From Firestore
	phone?: string; // From Firestore
	// createdAt?: admin.firestore.Timestamp; // Optional: include if needed
};

// This is now a Server Component
export default async function UsersPage() {
	let combinedUsers: CombinedUser[] = [];
	let fetchError: string | null = null;

	try {
		// 1. Fetch users from Firebase Authentication
		const auth = firebaseAdmin.auth();
		const listUsersResult = await auth.listUsers(1000); // Consider pagination for large user bases
		const authUsers = listUsersResult.users;

		// 2. Fetch corresponding data from Firestore 'users' collection
		const userIds = authUsers.map((user: UserRecord) => user.uid); // Added type
		const firestoreUsersData: { [key: string]: FirestoreUserData } = {}; // Used defined type

		if (userIds.length > 0) {
			const MAX_IDS_PER_QUERY = 30;
			const userDocPromises: Promise<admin.firestore.QuerySnapshot>[] = []; // Type promise array
			for (let i = 0; i < userIds.length; i += MAX_IDS_PER_QUERY) {
				const batchIds = userIds.slice(i, i + MAX_IDS_PER_QUERY);
				// Use admin.firestore.FieldPath.documentId() for querying by document ID
				const usersQuery = db
					.collection('users')
					.where(admin.firestore.FieldPath.documentId(), 'in', batchIds);
				userDocPromises.push(usersQuery.get());
			}

			const querySnapshots = await Promise.all(userDocPromises);
			querySnapshots.forEach((snapshot: admin.firestore.QuerySnapshot) => {
				// Added type
				snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
					// Added type
					firestoreUsersData[doc.id] = doc.data() as FirestoreUserData;
				});
			});
		}

		// 3. Merge Auth and Firestore data
		combinedUsers = authUsers.map((authUser: UserRecord) => {
			const firestoreData = firestoreUsersData[authUser.uid] || {};
			return {
				id: authUser.uid,
				email: authUser.email,
				displayName: authUser.displayName,
				photoURL: authUser.photoURL,
				// Map Firestore fields
				companyName: firestoreData.companyName,
				phone: firestoreData.phone,
				// createdAt: firestoreData.createdAt, // Uncomment if needed
			};
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		// Handle specific errors if needed
		fetchError = 'Failed to load users. Please try again later.';
	}

	// Render the client component, passing the fetched data
	return (
		<div className={styles.user}>
			{fetchError ? (
				<p /* className={styles.errorLoading} */>{fetchError}</p> // Commented out potentially missing style
			) : (
				<UserManagementClient initialUsers={combinedUsers} />
			)}
		</div>
	);
}

// Remove the old client-side code (useState, handlers, UserForm, etc.)
// All that logic will be moved to UserManagementClient.tsx
