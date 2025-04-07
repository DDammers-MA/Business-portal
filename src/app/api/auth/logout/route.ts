import { NextResponse } from 'next/server';

export async function POST() {
	try {
		// Prepare response to clear the cookie
		const response = NextResponse.json({ status: 'success' }, { status: 200 });

		// Clear the cookie by setting its maxAge to 0
		response.cookies.set('auth-token', '', {
			maxAge: 0,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			sameSite: 'lax',
		});

		console.log('[API/Auth/Logout] Session cookie cleared.');
		return response;
	} catch (error) {
		console.error('[API/Auth/Logout] Error:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
