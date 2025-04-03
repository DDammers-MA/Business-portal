'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../../../utils/firebase.browser';
import {
	checkPasswordStrength,
	isPasswordPwned,
} from '../../utils/passwordUtils';
import styles from './register.module.scss';

export default function Register() {
	const [companyName, setCompanyName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showRepeatPassword, setShowRepeatPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleGoToLogin = () => {
		router.push('/login');
	};

	const handleRegister = async () => {
		setError(null);

		// Basic Validation
		if (!companyName || !email || !phone || !password || !repeatPassword) {
			setError('Please fill in all fields.');
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		if (password !== repeatPassword) {
			setError('Passwords do not match.');
			return;
		}

		// Password Requirements Validation
		if (password.length < 12) {
			setError('Password must be at least 12 characters long.');
			return;
		}
		if (password.length > 4096) {
			setError('Password must be less than 4096 characters long.');
			return;
		}
		if (!/[A-Z]/.test(password)) {
			setError('Password must include at least one uppercase letter.');
			return;
		}
		if (!/[a-z]/.test(password)) {
			setError('Password must include at least one lowercase letter.');
			return;
		}
		if (!/[0-9]/.test(password)) {
			setError('Password must include at least one numeric character.');
			return;
		}
		if (!/[^A-Za-z0-9]/.test(password)) {
			setError('Password must include at least one special character.');
			return;
		}
		const strength = checkPasswordStrength(password);
		if (strength.score < 3) {
			let feedbackMessage = 'Password is too weak.';
			if (strength.feedback?.warning) {
				feedbackMessage += ` ${strength.feedback.warning}`;
			}
			if (
				strength.feedback?.suggestions &&
				strength.feedback.suggestions.length > 0
			) {
				feedbackMessage += ` Suggestions: ${strength.feedback.suggestions.join(
					' '
				)}`;
			}
			setError(feedbackMessage);
			return;
		}

		setLoading(true);
		try {
			const pwned = await isPasswordPwned(password);
			if (pwned) {
				setError(
					'This password has appeared in data breaches. Please choose a different one.'
				);
				setLoading(false);
				return;
			}
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			console.log('User registered successfully:', userCredential.user);

			const db = getFirestore(auth.app);
			const userDocRef = doc(db, 'users', userCredential.user.uid);
			const userData = {
				companyName: companyName,
				phone: phone,
				createdAt: new Date(),
			};
			await setDoc(userDocRef, userData);
			console.log('User data saved to Firestore');

			router.push('/login?registered=true');
		} catch (err) {
			console.error('Registration or Firestore Error:', err);
			if (err instanceof FirebaseError) {
				switch (err.code) {
					case 'auth/email-already-in-use':
						setError('This email address is already registered. Please login.');
						break;
					case 'auth/weak-password':
						setError(
							'Password is too weak. Please choose a stronger password.'
						);
						break;
					case 'auth/invalid-email':
						setError('The email address is not valid.');
						break;
					default:
						setError(
							'An error occurred during registration. Please try again.'
						);
				}
			} else if (err instanceof Error) {
				setError(err.message || 'An unexpected error occurred.');
			} else {
				setError('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.registerBox}>
				<Image
					src="/logo.png"
					alt="Logo"
					width={150}
					height={50}
					className={styles.logo}
				/>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleRegister();
					}}
				>
					<h2 className={styles.title}>Register</h2>
					<input
						type="text"
						placeholder="Company name"
						className={styles.inputField}
						value={companyName}
						onChange={(e) => setCompanyName(e.target.value)}
						disabled={loading}
					/>
					<input
						type="email"
						placeholder="Company email"
						className={styles.inputField}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
					<input
						type="tel"
						placeholder="Phone number"
						className={styles.inputField}
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						disabled={loading}
					/>
					<div className={styles.passwordInputContainer}>
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="Password"
							className={styles.inputField}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
						<button
							type="button"
							className={styles.showPasswordButton}
							onClick={() => setShowPassword(!showPassword)}
							disabled={loading}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
					<div className={styles.passwordInputContainer}>
						<input
							type={showRepeatPassword ? 'text' : 'password'}
							placeholder="Repeat password"
							className={styles.inputField}
							value={repeatPassword}
							onChange={(e) => setRepeatPassword(e.target.value)}
							disabled={loading}
						/>
						<button
							type="button"
							className={styles.showPasswordButton}
							onClick={() => setShowRepeatPassword(!showRepeatPassword)}
							disabled={loading}
						>
							{showRepeatPassword ? 'Hide' : 'Show'}
						</button>
					</div>
					{error && <div className={styles.errorBanner}>{error}</div>}
					<div className={styles.buttonContainer}>
						<button
							type="button"
							className={styles.loginButton}
							onClick={handleGoToLogin}
							disabled={loading}
						>
							Login
						</button>
						<button
							type="submit"
							className={styles.registerButton}
							disabled={loading}
						>
							{loading ? <span className={styles.spinner}></span> : 'Register'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
