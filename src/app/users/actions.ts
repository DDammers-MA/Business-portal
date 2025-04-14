'use server';

import { revalidatePath } from 'next/cache';
import { firebaseAdmin, db } from '../../../utils/firebase.admin';
import admin from 'firebase-admin'; // Import admin
import { CombinedUser } from './page'; // Assuming type is exported from page.tsx
// Import FirebaseError from the correct path
import { FirebaseError } from 'firebase-admin/app';
import type { UpdateData } from 'firebase-admin/firestore'; // Import UpdateData type for Firestore updates

// Define the structure for Firestore user data (if not already defined/imported correctly)
// Ensure this matches the definition in page.tsx if needed elsewhere
interface FirestoreUserData {
	companyName?: string;
	phone?: string;
	createdAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
	// Add other fields from Firestore as needed
}

// --- Error Handling Helper ---
function isFirebaseError(error: unknown): error is FirebaseError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		'message' in error
	);
}

function formatFirebaseError(error: unknown): string {
	if (isFirebaseError(error)) {
		switch (error.code) {
			case 'auth/email-already-exists':
				return 'This email is already in use by another account.';
			case 'auth/invalid-email':
				return 'The email address is badly formatted.';
			// Add more specific Firebase Auth error codes as needed
			case 'not-found': // Firestore specific
				return 'The requested user data was not found in the database.';
			default:
				return `Firebase error (${error.code}): ${error.message}`;
		}
	}
	if (error instanceof Error) {
		return error.message;
	}
	return 'An unknown error occurred.';
}

// --- Add User Action ---
export async function addUserAction(
	formData: Pick<CombinedUser, 'email' | 'companyName' | 'phone'>
): Promise<{ success: boolean; message: string; newUser?: CombinedUser }> {
	console.log('Attempting to add user:', formData);
	if (!formData.email) {
		return { success: false, message: 'Email is required.' };
	}

	try {
		const auth = firebaseAdmin.auth();

		// 1. Create user in Firebase Authentication
		// Generate a temporary secure password (user should likely set their own later via reset)
		const tempPassword = Math.random().toString(36).slice(-12); // Example: Consider a more robust method
		const newUserRecord = await auth.createUser({
			email: formData.email,
			emailVerified: false, // Or true if you have a verification flow
			password: tempPassword,
			displayName: formData.companyName || formData.email, // Use company name or fallback to email
			// photoURL: optional,
			disabled: false,
		});
		console.log('User created in Auth, UID:', newUserRecord.uid);

		// 2. Add user data to Firestore 'users' collection
		const userData: FirestoreUserData = {
			companyName: formData.companyName || '',
			phone: formData.phone || '',
			createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp correctly
		};
		await db.collection('users').doc(newUserRecord.uid).set(userData);
		console.log('User data saved to Firestore for UID:', newUserRecord.uid);

		// Revalidate the users page path to refresh the list
		revalidatePath('/users');

		const combinedUserData: CombinedUser = {
			id: newUserRecord.uid,
			email: newUserRecord.email,
			displayName: newUserRecord.displayName,
			photoURL: newUserRecord.photoURL,
			companyName: userData.companyName,
			phone: userData.phone,
			// createdAt: userData.createdAt, // This won't be available immediately after set with serverTimestamp
		};

		// You might want to trigger a password reset email here
		// await auth.generatePasswordResetLink(newUserRecord.email);
		// console.log("Password reset link generation potentially triggered for:", newUserRecord.email);

		return {
			success: true,
			message: 'User added successfully. A temporary password was set.',
			newUser: combinedUserData,
		};
	} catch (error) {
		console.error('Error adding user:', error);
		return { success: false, message: formatFirebaseError(error) };
	}
}

// --- Update User Action ---
// Note: Updating Firebase Auth email/password is more complex and often requires user interaction/verification.
// This action focuses on updating Firestore data for simplicity.

// UserUpdateData type removed as UpdateData<FirestoreUserData> is used directly

export async function updateUserAction(
	userId: string,
	formData: Pick<CombinedUser, 'companyName' | 'phone'>
): Promise<{ success: boolean; message: string }> {
	console.log(`Attempting to update user ${userId}:`, formData);
	if (!userId) {
		return { success: false, message: 'User ID is missing.' };
	}

	try {
		const userRef = db.collection('users').doc(userId);
		// Use UpdateData<FirestoreUserData> for type safety with update method
		const updateData: UpdateData<FirestoreUserData> = {};

		// Only include fields that are provided in the form data
		if (formData.companyName !== undefined)
			updateData.companyName = formData.companyName;
		if (formData.phone !== undefined) updateData.phone = formData.phone;

		if (Object.keys(updateData).length === 0) {
			return { success: true, message: 'No changes detected to update.' };
		}

		await userRef.update(updateData);
		console.log('User data updated in Firestore for UID:', userId);

		// Optionally, update displayName in Auth if companyName changed?
		// if (updateData.companyName) {
		//   await firebaseAdmin.auth().updateUser(userId, { displayName: updateData.companyName });
		//   console.log("Updated displayName in Auth for UID:", userId);
		// }

		revalidatePath('/users');
		return { success: true, message: 'User updated successfully.' };
	} catch (error) {
		console.error(`Error updating user ${userId}:`, error);
		return { success: false, message: formatFirebaseError(error) };
	}
}

// --- Delete User Action ---
export async function deleteUserAction(
	userId: string
): Promise<{ success: boolean; message: string }> {
	console.log(`Attempting to delete user ${userId}`);
	if (!userId) {
		return { success: false, message: 'User ID is missing.' };
	}

	try {
		const auth = firebaseAdmin.auth();

		// 1. Delete user from Firebase Authentication
		await auth.deleteUser(userId);
		console.log('User deleted from Auth, UID:', userId);

		// 2. Delete user data from Firestore 'users' collection
		await db.collection('users').doc(userId).delete();
		console.log('User data deleted from Firestore for UID:', userId);

		revalidatePath('/users');
		return { success: true, message: 'User deleted successfully.' };
	} catch (error) {
		console.error(`Error deleting user ${userId}:`, error);
		// Handle case where user might be deleted from Auth but Firestore delete fails, or vice versa
		// Use the type guard
		if (isFirebaseError(error) && error.code === 'auth/user-not-found') {
			// Try deleting Firestore data even if Auth user is gone
			try {
				await db.collection('users').doc(userId).delete();
				console.log(
					'Cleaned up Firestore data for already deleted Auth user:',
					userId
				);
				revalidatePath('/users');
				return {
					success: true,
					message: 'User already deleted from Auth, Firestore data cleaned up.',
				};
			} catch (firestoreError) {
				console.error(
					`Error cleaning up Firestore data for user ${userId}:`,
					firestoreError
				);
				return {
					success: false,
					message: `User deleted from Auth, but failed to clean up Firestore data: ${formatFirebaseError(
						firestoreError
					)}`,
				};
			}
		}
		return { success: false, message: formatFirebaseError(error) };
	}
}
