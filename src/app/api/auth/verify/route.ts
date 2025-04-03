import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../utils/firebase.admin'; // Adjust path if necessary
import { FirebaseAuthError } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
	const token = request.cookies.get('auth-token')?.value;
	console.log('[API/Auth/Verify] Token found in request:', token);

	if (!token) {
		console.log('[API/Auth/Verify] No auth token found in request.');
		return NextResponse.json(
			{ valid: false, error: 'No token provided' },
			{ status: 401 }
		);
	}

	try {
		const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		console.log(
			`[API/Auth/Verify] Token verified successfully for UID: ${decodedToken.uid}`
		);
		return NextResponse.json(
			{
				valid: true,
				uid: decodedToken.uid,
				claims: decodedToken,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('[API/Auth/Verify] Token verification failed:');
		let errorMessage = 'Invalid or expired token';
		let errorCode = 'auth/invalid-token';

		if (error instanceof FirebaseAuthError) {
			console.error(`  - Code: ${error.code}`);
			console.error(`  - Message: ${error.message}`);
			errorMessage = error.message;
			errorCode = error.code;
		} else if (error instanceof Error) {
			console.error(`  - Message: ${error.message}`);
			errorMessage = error.message;
		} else {
			console.error('  - Unknown error type');
		}
		return NextResponse.json(
			{ valid: false, error: errorMessage, errorCode: errorCode },
			{ status: 401 }
		);
	}
}
