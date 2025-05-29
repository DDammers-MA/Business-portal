import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/', '/create'];
const adminPaths = ['/companies', '/activities/approve', '/settings'];
const publicOnlyPaths = ['/login'];

// Simple JWT token expiry check
function isTokenExpired(token: string): boolean {
	try {
		const base64Payload = token.split('.')[1];
		const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
		return Date.now() >= payload.exp * 1000;
	} catch {
		return true;
	}
}

function decodeToken(token: string): { uid: string; admin?: boolean } | null {
	try {
		const base64Payload = token.split('.')[1];
		const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
		return {
			uid: payload.user_id || payload.sub,
			admin: payload.admin === true,
		};
	} catch {
		return null;
	}
}

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

	if (token && !isTokenExpired(token)) {
		const decodedToken = decodeToken(token);
		if (decodedToken) {
			userId = decodedToken.uid;
			isAdmin = decodedToken.admin === true;
			console.log(
				`[Middleware] Token decoded for UID: ${userId}, isAdmin: ${isAdmin}`
			);
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
