import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../../../utils/firebase.admin'; // Adjust path if necessary

export async function POST(request: NextRequest) {
	// Use NextRequest
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json(
				{ message: 'ID token is required.' },
				{ status: 400 }
			);
		}

		// Verify the ID token using Firebase Admin SDK.
		// This verifies the signature and expiration.
		const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

		// Token is valid, get UID
		const uid = decodedToken.uid;

		// TODO: Optionally fetch user data from Firestore based on UID if needed here.

		// Prepare response early to set cookie on it
		const response = NextResponse.json(
			{ status: 'success', uid },
			{ status: 200 }
		);

		// Set session cookie on the response
		const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
		response.cookies.set('auth-token', idToken, {
			maxAge: expiresIn / 1000, // maxAge is in seconds
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			path: '/',
			sameSite: 'lax', // Helps prevent CSRF
		});

		console.log('[API/Auth/Login] Session cookie set for user:', uid);
		return response; // Return the response with the cookie
	} catch (error) {
		// Catch block with type check
		console.error('[API/Auth/Login] Error:', error);
		// Handle specific Firebase Admin auth errors using type assertion/checking
		let errorMessage = 'Internal Server Error';
		let status = 500;

		if (typeof error === 'object' && error !== null && 'code' in error) {
			const firebaseError = error as { code: string }; // Type assertion
			if (firebaseError.code === 'auth/id-token-expired') {
				errorMessage = 'Session token expired. Please log in again.';
				status = 401;
			}
			if (firebaseError.code === 'auth/argument-error') {
				errorMessage = 'Invalid session token.';
				status = 401;
			}
		}

		return NextResponse.json({ message: errorMessage }, { status });
	}
}
