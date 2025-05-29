import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 250,
	uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
	try {
		await limiter.check(request, 5, 'TRANSFER_ACTIVITY_OWNERSHIP');

		// Verify admin authorization
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
				{ message: 'Forbidden: Only admins can transfer activity ownership' },
				{ status: 403 }
			);
		}

		// Get request body
		const { activityId, newOwnerId } = await request.json();

		if (!activityId || !newOwnerId) {
			return NextResponse.json(
				{ message: 'Missing required fields: activityId and newOwnerId' },
				{ status: 400 }
			);
		}

		const db = firebaseAdmin.firestore();

		// Verify the new owner exists
		const newOwnerDoc = await db.collection('users').doc(newOwnerId).get();
		if (!newOwnerDoc.exists) {
			return NextResponse.json(
				{ message: 'New owner not found' },
				{ status: 404 }
			);
		}

		// Get the activity
		const activityDoc = await db.collection('activities').doc(activityId).get();
		if (!activityDoc.exists) {
			return NextResponse.json(
				{ message: 'Activity not found' },
				{ status: 404 }
			);
		}

		// Update the activity with new owner
		await db.collection('activities').doc(activityId).update({
			creatorUid: newOwnerId,
			updated_at: new Date().toISOString(),
		});

		return NextResponse.json(
			{
				message: 'Activity ownership transferred successfully',
				activityId,
				newOwnerId,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error transferring activity ownership:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
