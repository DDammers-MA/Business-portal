import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 1000, // 1 second
	uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		await limiter.check(request, 1, 'ADMIN_ACTIONS');

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
				{ message: 'Forbidden: Only admins can demote users' },
				{ status: 403 }
			);
		}

		// Get target user ID from request body
		const { targetUserId } = await request.json();
		if (!targetUserId) {
			return NextResponse.json(
				{ message: 'Missing target user ID' },
				{ status: 400 }
			);
		}

		// Prevent self-demotion
		if (targetUserId === adminDecodedToken.uid) {
			return NextResponse.json(
				{ message: 'Cannot demote yourself' },
				{ status: 400 }
			);
		}

		// Get all users with admin claim
		const listUsersResult = await firebaseAdmin.auth().listUsers();
		const adminUsers = listUsersResult.users.filter(
			(user) => user.customClaims && (user.customClaims as any).admin
		);

		// Check if target is the last admin
		if (adminUsers.length === 1 && adminUsers[0].uid === targetUserId) {
			return NextResponse.json(
				{ message: 'Cannot demote the last admin' },
				{ status: 400 }
			);
		}

		// Verify target user exists and is an admin
		try {
			const targetUser = await firebaseAdmin.auth().getUser(targetUserId);
			const claims = targetUser.customClaims || {};
			if (!(claims as any).admin) {
				return NextResponse.json(
					{ message: 'Target user is not an admin' },
					{ status: 400 }
				);
			}
		} catch (error) {
			return NextResponse.json(
				{ message: 'Target user not found' },
				{ status: 404 }
			);
		}

		// Remove admin custom claim
		await firebaseAdmin
			.auth()
			.setCustomUserClaims(targetUserId, { admin: false });

		return NextResponse.json(
			{ message: 'Admin demoted to user successfully' },
			{ status: 200 }
		);
	} catch (error) {
		if ((error as any).code === 'rate_limit_exceeded') {
			return NextResponse.json(
				{ message: 'Rate limit exceeded. Please try again later.' },
				{ status: 429 }
			);
		}

		console.error('Error demoting admin:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
