'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../../utils/firebase.browser';
import styles from './login.module.scss';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		console.log('[Login Page Component] Component Mounted in Browser');
	}, []);

	const handleLogin = async () => {
		if (!email) {
			setError('Please enter your company email.');
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		if (!password) {
			setError('Please enter your password.');
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const idToken = await userCredential.user.getIdToken();

			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idToken }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to set session.');
			}

			router.push('/');
		} catch (err) {
			console.error('Login or Session Error:', err);
			if (err instanceof FirebaseError) {
				if (
					err.code === 'auth/invalid-email' ||
					err.code === 'auth/user-not-found' ||
					err.code === 'auth/wrong-password' ||
					err.code === 'auth/invalid-credential'
				) {
					setError('Invalid company name or password.');
				} else {
					setError('An error occurred during login. Please try again.');
				}
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.loginBox}>
				<Image
					src="/logo.png"
					alt="Logo"
					width={150}
					height={50}
					className={styles.logo}
				/>{' '}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleLogin();
					}}
				>
					<h2 className={styles.title}>Login</h2>
					<input
						type="email"
						placeholder="Company email"
						className={styles.inputField}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
					<input
						type="password"
						placeholder="Password"
						className={styles.inputField}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
					<a href="#" className={styles.forgotPassword}>
						Forgot password
					</a>
					<button
						className={styles.loginButton}
						type="submit"
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
					{error && <div className={styles.errorBanner}>{error}</div>}
				</form>
			</div>
		</div>
	);
}
