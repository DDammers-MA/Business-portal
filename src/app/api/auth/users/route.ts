import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 1000, // 1 second
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function GET(request: NextRequest) {
	try {
		// Apply rate limiting
		await limiter.check(request, 1, 'USER_LIST');

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
				{ message: 'Forbidden: Only admins can view user list' },
				{ status: 403 }
			);
		}

		// Get all users
		const listUsersResult = await firebaseAdmin.auth().listUsers();

		// Map users to include admin status
		const users = await Promise.all(
			listUsersResult.users.map(async (user) => {
				const userRecord = await firebaseAdmin.auth().getUser(user.uid);
				const customClaims = userRecord.customClaims || {};

				return {
					uid: user.uid,
					email: user.email,
					displayName: user.displayName,
					isAdmin: customClaims.admin === true,
				};
			})
		);

		return NextResponse.json({ users }, { status: 200 });
	} catch (error) {
		if ((error as any).code === 'rate_limit_exceeded') {
			return NextResponse.json(
				{ message: 'Rate limit exceeded. Please try again later.' },
				{ status: 429 }
			);
		}

		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
