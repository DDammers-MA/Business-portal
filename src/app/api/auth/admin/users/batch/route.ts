import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 250,
	uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
	try {
		await limiter.check(request, 5, 'GET_ALL_USERS');

		const authorization = request.headers.get('Authorization');
		if (!authorization?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: 'Unauthorized: Missing or invalid Bearer token' },
				{ status: 401 }
			);
		}

		const token = authorization.substring(7);
		const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

		if (!decodedToken.admin) {
			return NextResponse.json(
				{ message: 'Forbidden: Only admins can access user data' },
				{ status: 403 }
			);
		}

		const auth = firebaseAdmin.auth();
		const db = firebaseAdmin.firestore();

		// Get all users from Firebase Auth
		const listUsersResult = await auth.listUsers();
		const users = listUsersResult.users;

		// Get Firestore data for all users
		const usersSnapshot = await db.collection('users').get();
		const firestoreData: { [key: string]: any } = {};
		usersSnapshot.forEach((doc) => {
			firestoreData[doc.id] = doc.data();
		});

		// Combine Auth and Firestore data
		const combinedUsers = users.map((user) => ({
			id: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
			lastLoginAt: user.metadata.lastSignInTime,
			isAdmin: user.customClaims?.admin || false,
			...firestoreData[user.uid],
		}));

		return NextResponse.json({ users: combinedUsers }, { status: 200 });
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await limiter.check(request, 5, 'BATCH_USER_DATA');

		const authorization = request.headers.get('Authorization');
		if (!authorization?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: 'Unauthorized: Missing or invalid Bearer token' },
				{ status: 401 }
			);
		}

		const token = authorization.substring(7);

		const adminDecodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		if (!adminDecodedToken.admin) {
			return NextResponse.json(
				{ message: 'Forbidden: Only admins can access batch user data' },
				{ status: 403 }
			);
		}

		const { userIds } = await request.json();
		if (!Array.isArray(userIds) || userIds.length === 0) {
			return NextResponse.json(
				{ message: 'Invalid or empty user IDs array' },
				{ status: 400 }
			);
		}

		const db = firebaseAdmin.firestore();
		const auth = firebaseAdmin.auth();

		const MAX_BATCH_SIZE = 30;
		const firestoreData: { [key: string]: any } = {};

		for (let i = 0; i < userIds.length; i += MAX_BATCH_SIZE) {
			const batchIds = userIds.slice(i, i + MAX_BATCH_SIZE);
			const snapshot = await db
				.collection('users')
				.where(firebaseAdmin.firestore.FieldPath.documentId(), 'in', batchIds)
				.get();

			snapshot.forEach((doc) => {
				firestoreData[doc.id] = doc.data();
			});
		}

		const userRecords = await auth.getUsers(userIds.map((uid) => ({ uid })));

		const customClaimsPromises = userRecords.users.map((user) =>
			auth.getUser(user.uid).then((fullUser) => ({
				uid: user.uid,
				isAdmin: fullUser.customClaims?.admin === true,
			}))
		);
		const adminStatuses = await Promise.all(customClaimsPromises);
		const adminStatusMap = Object.fromEntries(
			adminStatuses.map((status) => [status.uid, status.isAdmin])
		);

		const combinedUsers = userRecords.users.map((user) => ({
			id: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
			lastLoginAt: user.metadata.lastSignInTime,
			isAdmin: adminStatusMap[user.uid] || false,
			...firestoreData[user.uid],
		}));

		return NextResponse.json({ users: combinedUsers }, { status: 200 });
	} catch (error) {
		console.error('Error in batch user data:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
