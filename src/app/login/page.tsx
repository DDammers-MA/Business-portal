'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../../utils/firebase.browser';
import styles from './login.module.scss';

export default function Login() {
    //Hier maak ik een State voor email, wachtwoord, foutmeldingen, loading, success, etc.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    //Hier heb ik een useEffect gemaakt dat laat een succesmelding zien als je net geregristreerd bent.
	//Deze effect gebeurd wel alleen wanneer de component wordt geladen.
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccessMessage(true);
        }
        console.log('[Login Page Component] Component Mounted in Browser');
    }, [searchParams, router]);

    // hier handel ik de login af
    const handleLogin = async () => {
        // Hier valideer ik de email en wachtwoord
        if (!email) {
            setError('Please enter your company email.');
            setResetMessage(null);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setResetMessage(null);
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            setResetMessage(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResetMessage(null);
        try {
            // Dit is voor inloggen met Firebase Auth
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

           
            const redirectedFrom = searchParams.get('redirectedFrom');
            router.push(redirectedFrom || '/');
        } catch (err) {
            console.error('Login or Session Error:', err);
            setLoading(false);
            
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
        }
    };

    // Hier handel ik de wachtwoord vergeten functionaliteit af 
    const handlePasswordReset = async () => {
        if (!email) {
            setError('Please enter your email address to reset the password.');
            setResetMessage(null);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setResetMessage(null);
            return;
        }

        setResetLoading(true);
        setError(null);
        setResetMessage(null);

        try {
            // hier laat ik een  een wachtwoord reset email via Firebase sturen
            await sendPasswordResetEmail(auth, email);
            setResetMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            console.error('Password Reset Error:', err);
			// Hier word een foutmelding laten zien, je hebt verschillende voor verschillende errors
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/user-not-found') {
                    setError('No user found with this email address.');
                } else {
                    setError('Failed to send password reset email. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            setResetMessage(null);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                {/* Logo die boven de formulier staat*/}
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={150}
                    height={50}
                    className={styles.logo}
                />
                {/* Melding (succesmelding) nadat je hebt geregristreerd */}
                {showSuccessMessage && (
                    <div className={styles.successBanner}>
                        Registration successful! You can now log in.
                    </div>
                )}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    <h2 className={styles.title}>Login</h2>
                    {/* Hier staat de input van de email */}
                    <input
                        type="email"
                        placeholder="Company email"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {/* Hier staat de input van de wachtwoord */}
                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    {/* Hier staat de link voor wachtwoord vergteten */}
                    <span
                        onClick={handlePasswordReset}
                        className={styles.forgotPassword}
                        style={{
                            cursor: 'pointer',
                            display: 'block',
                            marginBottom: '10px',
                            textAlign: 'right',
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handlePasswordReset();
                        }}
                    >
                        {resetLoading ? 'Sending...' : 'Forgot password'}
                    </span>
                    {/* Dit is de login knop */}
                    <button
                        className={styles.loginButton}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <span className={styles.spinner}></span> : 'Login'}
                    </button>
                    {/* foutmelding als er iets fout gaat */}
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    {/* succesmelding als je je wachtwoord hebt gereset */}
                    {resetMessage && (
                        <div className={styles.successBanner}>{resetMessage}</div>
                    )}
                </form>
            </div>
        </div>
    );
}