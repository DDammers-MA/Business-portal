import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/', '/create', '/activities', '/users', '/statistics'];
const adminPaths = ['/bahblahjavg'];
const publicOnlyPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (
		/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/.test(pathname)
	) {
		return NextResponse.next();
	}

	console.log(`[Middleware] Processing request for path: ${pathname}`);

	const tokenCookie = request.cookies.get('auth-token');
	const token = tokenCookie?.value;
	console.log(`[Middleware] Auth token found in cookie: ${!!token}`);

	let userId: string | null = null;
	let isAdmin: boolean = false;

	if (token) {
		const verifyUrl = new URL('/api/auth/verify', request.url);
		try {
			console.log(
				`[Middleware] Calling verification API: ${verifyUrl.toString()}`
			);
			const response = await fetch(verifyUrl, {
				headers: {
					Cookie: request.headers.get('Cookie') || '',
				},
			});

			if (response.ok) {
				const data = await response.json();
				if (data.valid && data.uid) {
					userId = data.uid;
					isAdmin = data.claims?.admin === true;
					console.log(
						`[Middleware] Verification API returned valid UID: ${userId}, isAdmin: ${isAdmin}`
					);
				} else {
					console.log('[Middleware] Verification API returned invalid status.');
				}
			} else {
				console.error(
					`[Middleware] Verification API call failed with status: ${response.status}`
				);
			}
		} catch (error) {
			console.error('[Middleware] Error calling verification API:', error);
		}
	}

	console.log(`[Middleware] User ID: ${userId ?? 'null'}, isAdmin: ${isAdmin}`);

	const isAdminPath = adminPaths.some((path) => pathname === path);
	const isPublicOnlyPath = publicOnlyPaths.some((path) => pathname === path);
	const isProtectedRoute =
		protectedPaths.some((path) => pathname === path) || isAdminPath;

	console.log(
		`[Middleware] Path checks (Exact Match) - isAdminPath: ${isAdminPath}, isProtectedRoute: ${isProtectedRoute}, isPublicOnlyPath: ${isPublicOnlyPath}`
	);

	if (isPublicOnlyPath) {
		if (userId) {
			console.log(
				`[Middleware] Redirecting verified user (${userId}) from public-only path ${pathname} to /`
			);
			return NextResponse.redirect(new URL('/', request.url));
		}
		console.log(
			`[Middleware] Allowing unauthenticated access to public-only path ${pathname}`
		);
		return NextResponse.next();
	}

	if (isAdminPath) {
		if (!userId) {
			console.log(
				`[Middleware] Redirecting unauthenticated user from ADMIN path ${pathname} to /login`
			);
			return NextResponse.redirect(
				new URL(`/login?redirectedFrom=${pathname}`, request.url)
			);
		} else if (!isAdmin) {
			console.log(
				`[Middleware] Redirecting non-admin user (${userId}) from ADMIN path ${pathname} to /`
			);
			return NextResponse.redirect(new URL('/', request.url));
		}
		console.log(
			`[Middleware] Allowing ADMIN access for user ${userId} to ${pathname}`
		);
		return NextResponse.next();
	}

	if (isProtectedRoute) {
		if (!userId) {
			console.log(
				`[Middleware] Redirecting unauthenticated user from PROTECTED path ${pathname} to /login`
			);
			return NextResponse.redirect(
				new URL(`/login?redirectedFrom=${pathname}`, request.url)
			);
		}
		console.log(
			`[Middleware] Allowing authenticated access for user ${userId} to PROTECTED path ${pathname}`
		);
		return NextResponse.next();
	}

	console.log(
		`[Middleware] Allowing public access to unlisted path: ${pathname}`
	);
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
