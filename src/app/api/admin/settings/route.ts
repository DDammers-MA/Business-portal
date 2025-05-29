import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../utils/firebase.admin';
import { rateLimit } from '@/utils/rateLimit';

const limiter = rateLimit({
	interval: 250,
	uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
	try {
		await limiter.check(request, 5, 'ADMIN_SETTINGS_UPDATE');

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
				{ message: 'Forbidden: Only admins can update settings' },
				{ status: 403 }
			);
		}

		const { settings } = await request.json();
		if (!settings || typeof settings !== 'object') {
			return NextResponse.json(
				{ message: 'Invalid settings object' },
				{ status: 400 }
			);
		}

		const db = firebaseAdmin.firestore();
		await db.collection('users').doc(decodedToken.uid).set(
			{
				settings: settings,
			},
			{ merge: true }
		);

		return NextResponse.json(
			{ message: 'Settings updated successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating admin settings:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
