export type CombinedUser = {
	id: string;
	email?: string;
	displayName?: string | null;
	photoURL?: string | null;
	companyName?: string;
	phone?: string;
	kvk?: string;
	lastLoginAt?: string | null;
	password?: string;
	isAdmin?: boolean;
};
