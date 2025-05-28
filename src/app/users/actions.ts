'use server';

import { revalidatePath } from 'next/cache';
import { firebaseAdmin, db } from '../../../utils/firebase.admin';
import admin from 'firebase-admin'; // Import admin
import type { CombinedUser } from './types'; // Assuming type is exported from page.tsx
// Import FirebaseError from the correct path
import { FirebaseError } from 'firebase-admin/app';
import type { UpdateData } from 'firebase-admin/firestore'; // Import UpdateData type for Firestore updates
import { generateSecurePassword } from '@/utils/passwordUtils';

// Define the structure for Firestore user data (if not already defined/imported correctly)
// Ensure this matches the definition in page.tsx if needed elsewhere
interface FirestoreUserData {
	companyName?: string;
	phone?: string;
	kvk?: string;
	createdAt?: admin.firestore.Timestamp | admin.firestore.FieldValue;
	creatorUid?: string; // Add creatorUid field
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
	formData: Pick<CombinedUser, 'email' | 'companyName' | 'phone' | 'kvk'> & {
		password?: string;
	},
	creatorUid: string
): Promise<{ success: boolean; message: string; newUser?: CombinedUser }> {
	console.log(
		'Attempting to add user:',
		{ ...formData, password: formData.password ? '[REDACTED]' : undefined },
		'by creator:',
		creatorUid
	);
	if (!formData.email) {
		return { success: false, message: 'Email is required.' };
	}
	if (!creatorUid) {
		console.error('Creator UID is missing');
		return {
			success: false,
			message: 'Action failed: Creator information missing.',
		};
	}

	try {
		const auth = firebaseAdmin.auth();
		const isManualPassword = !!formData.password;
		const password = isManualPassword
			? formData.password
			: generateSecurePassword();

		const newUserRecord = await auth.createUser({
			email: formData.email,
			emailVerified: false,
			password: password,
			displayName: formData.companyName || formData.email,
			disabled: false,
		});
		console.log('User created in Auth, UID:', newUserRecord.uid);

		const userData: FirestoreUserData = {
			creatorUid: creatorUid,
			companyName: formData.companyName || '',
			phone: formData.phone || '',
			kvk: formData.kvk || '',
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		};
		await db.collection('users').doc(newUserRecord.uid).set(userData);
		console.log('User data saved to Firestore for UID:', newUserRecord.uid);

		revalidatePath('/users');

		const combinedUserData: CombinedUser = {
			id: newUserRecord.uid,
			email: newUserRecord.email,
			displayName: newUserRecord.displayName,
			photoURL: newUserRecord.photoURL,
			companyName: userData.companyName,
			phone: userData.phone,
			kvk: userData.kvk,
		};

		// Only send password reset email if not using manual password
		if (!isManualPassword && newUserRecord.email) {
			try {
				const resetLink = await auth.generatePasswordResetLink(
					newUserRecord.email
				);
				// Send the password reset email using the admin SDK
				await auth.generateEmailVerificationLink(newUserRecord.email);
				console.log('Password reset email sent to:', newUserRecord.email);
				return {
					success: true,
					message:
						'User added successfully. A password reset email has been sent.',
					newUser: combinedUserData,
				};
			} catch (emailError) {
				console.error('Error sending password reset email:', emailError);
				// Still return success since user was created, but indicate email issue
				return {
					success: true,
					message:
						'User added successfully, but there was an issue sending the password reset email. Please try resetting the password manually.',
					newUser: combinedUserData,
				};
			}
		}

		return {
			success: true,
			message: 'User added successfully with the specified password.',
			newUser: combinedUserData,
		};
	} catch (error) {
		console.error('Error adding user:', error);
		return { success: false, message: formatFirebaseError(error) };
	}
}

export async function updateUserAction(
	userId: string,
	formData: Pick<CombinedUser, 'companyName' | 'phone' | 'kvk'>
): Promise<{ success: boolean; message: string }> {
	console.log(`Attempting to update user ${userId}:`, formData);
	if (!userId) {
		return { success: false, message: 'User ID is missing.' };
	}

	try {
		const userRef = db.collection('users').doc(userId);
		const updateData: UpdateData<FirestoreUserData> = {};
		if (formData.companyName !== undefined)
			updateData.companyName = formData.companyName;
		if (formData.phone !== undefined) updateData.phone = formData.phone;

		if (formData.kvk !== undefined) updateData.kvk = formData.kvk;

		if (Object.keys(updateData).length === 0) {
			return { success: true, message: 'No changes detected to update.' };
		}

		await userRef.update(updateData);
		console.log('User data updated in Firestore for UID:', userId);

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
