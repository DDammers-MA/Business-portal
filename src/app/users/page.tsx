import React from 'react';
import { firebaseAdmin, db } from '../../../utils/firebase.admin';
import { UserRecord } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import UserManagementClient from './UserManagementClient';
import styles from './user.module.scss';
import type { CombinedUser } from './types';

interface FirestoreUserData {
	companyName?: string;
	phone?: string;
	createdAt?: admin.firestore.Timestamp;
	kvk?: string;
	creatorUid?: string;
}

export default async function UsersPage() {
	const combinedUsers: CombinedUser[] = [];
	let fetchError: string | null = null;

	try {
		const auth = firebaseAdmin.auth();
		const listUsersResult = await auth.listUsers(1000);
		const authUsers = listUsersResult.users;

		const userIds = authUsers.map((user: UserRecord) => user.uid);
		const firestoreUsersData: { [key: string]: FirestoreUserData } = {};

		// Batch get Firestore data
		if (userIds.length > 0) {
			const MAX_IDS_PER_QUERY = 30;
			const userDocPromises: Promise<admin.firestore.QuerySnapshot>[] = [];
			for (let i = 0; i < userIds.length; i += MAX_IDS_PER_QUERY) {
				const batchIds = userIds.slice(i, i + MAX_IDS_PER_QUERY);
				const usersQuery = db
					.collection('users')
					.where(admin.firestore.FieldPath.documentId(), 'in', batchIds);
				userDocPromises.push(usersQuery.get());
			}

			const querySnapshots = await Promise.all(userDocPromises);
			querySnapshots.forEach((snapshot: admin.firestore.QuerySnapshot) => {
				snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
					firestoreUsersData[doc.id] = doc.data() as FirestoreUserData;
				});
			});
		}

		// Batch get admin status
		const userRecords = await auth.getUsers(userIds.map((uid) => ({ uid })));
		const adminStatusMap = Object.fromEntries(
			userRecords.users.map((user) => [
				user.uid,
				user.customClaims?.admin === true,
			])
		);

		// Combine all data
		combinedUsers.push(
			...authUsers.map((authUser: UserRecord) => {
				const firestoreData = firestoreUsersData[authUser.uid] || {};
				return {
					id: authUser.uid,
					email: authUser.email,
					displayName: authUser.displayName,
					photoURL: authUser.photoURL,
					companyName: firestoreData.companyName,
					phone: firestoreData.phone,
					kvk: firestoreData.kvk,
					lastLoginAt: authUser.metadata.lastSignInTime || null,
					isAdmin: adminStatusMap[authUser.uid] || false,
				};
			})
		);
	} catch (error) {
		console.error('Error fetching users:', error);
		fetchError = 'Failed to load users. Please try again later.';
	}

	return (
		<div className={styles.user}>
			{fetchError ? (
				<p>{fetchError}</p>
			) : (
				<UserManagementClient initialUsers={combinedUsers} />
			)}
		</div>
	);
}
