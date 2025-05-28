import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 1000, // 1 second
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		await limiter.check(request, 1, 'BATCH_USER_DATA');

		// Get the authorization token
		const authorization = request.headers.get('Authorization');
		if (!authorization?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: 'Unauthorized: Missing or invalid Bearer token' },
				{ status: 401 }
			);
		}

		const token = authorization.substring(7);

		// Verify the admin's token
		const adminDecodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		if (!adminDecodedToken.admin) {
			return NextResponse.json(
				{ message: 'Forbidden: Only admins can access batch user data' },
				{ status: 403 }
			);
		}

		// Get user IDs from request body
		const { userIds } = await request.json();
		if (!Array.isArray(userIds) || userIds.length === 0) {
			return NextResponse.json(
				{ message: 'Invalid or empty user IDs array' },
				{ status: 400 }
			);
		}

		const db = firebaseAdmin.firestore();
		const auth = firebaseAdmin.auth();

		// Batch get Firestore user data
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

		// Get admin status for all users in a single batch
		const userRecords = await auth.getUsers(userIds.map((uid) => ({ uid })));

		// Get custom claims for all users
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

		// Combine all data
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
