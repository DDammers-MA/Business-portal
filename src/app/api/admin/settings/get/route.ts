import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 250,
	uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
	try {
		await limiter.check(request, 5, 'GET_ADMIN_SETTINGS');

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
				{ message: 'Forbidden: Only admins can access settings' },
				{ status: 403 }
			);
		}

		const db = firebaseAdmin.firestore();
		const userDoc = await db.collection('users').doc(decodedToken.uid).get();
		const settings = userDoc.data()?.settings || {};

		return NextResponse.json({ settings }, { status: 200 });
	} catch (error) {
		console.error('Error getting admin settings:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
