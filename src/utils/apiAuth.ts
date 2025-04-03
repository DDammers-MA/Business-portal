import { type NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../utils/firebase.admin';
import { DecodedIdToken, FirebaseAuthError } from 'firebase-admin/auth';

export async function verifyApiAuth(
	request: NextRequest
): Promise<DecodedIdToken | NextResponse> {
	const token = request.cookies.get('auth-token')?.value;

	if (!token) {
		console.log('[API Auth Helper] No auth token found in request.');
		return NextResponse.json(
			{ message: 'Authentication token missing.' },
			{ status: 401 }
		);
	}

	try {
		const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		console.log(
			`[API Auth Helper] Token verified successfully for UID: ${decodedToken.uid}`
		);
		return decodedToken;
	} catch (error) {
		console.error('[API Auth Helper] Token verification failed:');
		const status = 401;
		let message = 'Invalid or expired token';

		if (error instanceof FirebaseAuthError) {
			console.error(`  - Code: ${error.code}`);
			console.error(`  - Message: ${error.message}`);
			if (error.code === 'auth/id-token-expired') {
				message = 'Session token expired. Please log in again.';
			} else if (error.code === 'auth/argument-error') {
				message = 'Invalid session token format.';
			}
		} else if (error instanceof Error) {
			console.error(`  - Message: ${error.message}`);
		} else {
			console.error('  - Unknown error type');
		}
		return NextResponse.json({ message: message }, { status });
	}
}
