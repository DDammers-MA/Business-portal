'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useMemo,
} from 'react';
import {
	onAuthStateChanged,
	User,
	getIdTokenResult,
	IdTokenResult,
} from 'firebase/auth';
import { auth } from '../../utils/firebase.browser'; // Adjust path as needed

interface AuthContextState {
	user: User | null;
	isAdmin: boolean;
	loading: boolean;
	idTokenResult: IdTokenResult | null; // Store the full token result
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true); // Start as true
	const [idTokenResult, setIdTokenResult] = useState<IdTokenResult | null>(
		null
	);

	useEffect(() => {
		// Firebase listener for authentication state changes
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true); // Set loading true whenever auth state might change
			if (currentUser) {
				try {
					// Force refresh the token to get the latest custom claims
					const tokenResult = await getIdTokenResult(currentUser, true);
					setUser(currentUser);
					setIsAdmin(tokenResult.claims.admin === true);
					setIdTokenResult(tokenResult);
					console.log('tokenResult', tokenResult);
					console.log('currentUser', currentUser);
					console.log('isAdmin', isAdmin);
					console.log('user', tokenResult.claims.admin === true);
				} catch (error) {
					console.error('[AuthContext] Error getting ID token result:', error);
					setUser(null);
					setIsAdmin(false);
					setIdTokenResult(null);
				}
			} else {
				setUser(null);
				setIsAdmin(false);
				setIdTokenResult(null);
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);
	const value = useMemo(
		() => ({
			user,
			isAdmin,
			loading,
			idTokenResult,
		}),
		[user, isAdmin, loading, idTokenResult]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextState => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
