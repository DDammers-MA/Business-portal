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
			const db = firebaseAdmin.firestore(); // Get Firestore instance
			const firestoreUserDoc = await db.collection('users').doc(userId).get();
			if (firestoreUserDoc.exists) {
				firestoreData = firestoreUserDoc.data() as { companyName?: string }; // Cast carefully
			}
		} catch (firestoreError) {
			console.error(
				`Error fetching Firestore user data for ${userId}:`,
				firestoreError
			);
			// Decide if this error should prevent returning auth data.
			// For now, we'll proceed with auth data even if Firestore fetch fails.
		}

		const userDetails: UserDetails = {
			uid: userRecord.uid,
			displayName: userRecord.displayName || null,
			email: userRecord.email || null,
			// Merge firestoreData here
			companyName: firestoreData.companyName || null,
		};

		return { success: true, user: userDetails };
	} catch (error: unknown) {
		console.error(`Error fetching user details for ${userId}:`, error);
		let message = 'An unexpected error occurred.';
		// Type guard for FirebaseError (you might need to import FirebaseError type)
		if (typeof error === 'object' && error !== null && 'code' in error) {
			const firebaseError = error as { code: string; message: string }; // Basic type assertion
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
