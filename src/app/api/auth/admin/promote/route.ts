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
				{ message: 'Forbidden: Only admins can promote users' },
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

		// Verify target user exists
		try {
			await firebaseAdmin.auth().getUser(targetUserId);
		} catch (error) {
			return NextResponse.json(
				{ message: 'Target user not found' },
				{ status: 404 }
			);
		}

		// Set admin custom claim
		await firebaseAdmin
			.auth()
			.setCustomUserClaims(targetUserId, { admin: true });

		return NextResponse.json(
			{ message: 'User promoted to admin successfully' },
			{ status: 200 }
		);
	} catch (error) {
		if ((error as any).code === 'rate_limit_exceeded') {
			return NextResponse.json(
				{ message: 'Rate limit exceeded. Please try again later.' },
				{ status: 429 }
			);
		}

		console.error('Error promoting user to admin:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
