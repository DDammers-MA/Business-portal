export interface User {
	uid: string;
	email: string;
	displayName?: string;
	isAdmin: boolean;
	photoURL?: string;
	emailVerified: boolean;
}
