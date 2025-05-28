'use server';

import { firebaseAdmin } from '../../../../utils/firebase.admin'; // Adjust path as necessary

// Define the structure of the data we want to return
// Combining potential Auth and Firestore data
export interface UserDetails {
	uid: string;
	displayName: string | null;
	email: string | null;
	// Add other fields if you also fetch from Firestore 'users' collection here
	companyName?: string | null;
	// phone?: string;
}

export async function getUserDetailsAction(
	userId: string
): Promise<{ success: boolean; user?: UserDetails; message?: string }> {
	if (!userId) {
		return { success: false, message: 'User ID is required.' };
	}

	try {
		const auth = firebaseAdmin.auth();
		const userRecord = await auth.getUser(userId);

		// Fetch Firestore data
		let firestoreData: { companyName?: string } = {};
		try {
			const db = firebaseAdmin.firestore();
			const firestoreUserDoc = await db.collection('users').doc(userId).get();
			if (firestoreUserDoc.exists) {
				firestoreData = firestoreUserDoc.data() as { companyName?: string };
			}
		} catch (firestoreError) {
			console.error(
				`Error fetching Firestore user data for ${userId}:`,
				firestoreError
			);
		}

		const userDetails: UserDetails = {
			uid: userRecord.uid,
			displayName: userRecord.displayName || null,
			email: userRecord.email || null,
			companyName: firestoreData.companyName || null,
		};

		return { success: true, user: userDetails };
	} catch (error: unknown) {
		console.error(`Error fetching user details for ${userId}:`, error);
		let message = 'An unexpected error occurred.';
		if (typeof error === 'object' && error !== null && 'code' in error) {
			const firebaseError = error as { code: string; message: string };
			message = firebaseError.message || message;
			if (firebaseError.code === 'auth/user-not-found') {
				message = 'User not found.';
			}
		} else if (error instanceof Error) {
			message = error.message;
		}
		return { success: false, message: message };
	}
}

export async function getBatchUserDetailsAction(userIds: string[]): Promise<{
	success: boolean;
	users?: { [key: string]: UserDetails };
	message?: string;
}> {
	if (!userIds || userIds.length === 0) {
		return { success: false, message: 'No user IDs provided.' };
	}

	try {
		const auth = firebaseAdmin.auth();
		const db = firebaseAdmin.firestore();

		// Get all users from Auth
		const userRecords = await auth.getUsers(userIds.map((uid) => ({ uid })));

		// Get all users from Firestore in batches
		const MAX_BATCH_SIZE = 30;
		const firestoreData: { [key: string]: { companyName?: string } } = {};

		for (let i = 0; i < userIds.length; i += MAX_BATCH_SIZE) {
			const batchIds = userIds.slice(i, i + MAX_BATCH_SIZE);
			const snapshot = await db
				.collection('users')
				.where(firebaseAdmin.firestore.FieldPath.documentId(), 'in', batchIds)
				.get();

			snapshot.forEach((doc) => {
				firestoreData[doc.id] = doc.data() as { companyName?: string };
			});
		}

		// Combine the data
		const users = Object.fromEntries(
			userRecords.users.map((user) => [
				user.uid,
				{
					uid: user.uid,
					displayName: user.displayName || null,
					email: user.email || null,
					companyName: firestoreData[user.uid]?.companyName || null,
				},
			])
		);

		return { success: true, users };
	} catch (error: unknown) {
		console.error('Error fetching batch user details:', error);
		let message = 'An unexpected error occurred.';
		if (error instanceof Error) {
			message = error.message;
		}
		return { success: false, message };
	}
}
