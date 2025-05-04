'use client';

import React, { useState, useEffect } from 'react';
import styles from './profile.module.scss';

import { db } from '../../../utils/firebase.browser';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
	getAuth,
	reauthenticateWithCredential,
	EmailAuthProvider,
	updatePassword,
} from 'firebase/auth';

const ProfilePage = () => {
	const { user } = useAuth();
	const auth = getAuth();

	const [profile, setProfile] = useState({
		companyName: '',
		companyEmail: '',
		kvkNumber: '',
		phoneNumber: '',
		password: '',
	});

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (!user) return;

			try {
				const profileRef = doc(db, 'users', user.uid);
				const profileSnap = await getDoc(profileRef);

				if (profileSnap.exists()) {
					const data = profileSnap.data();
					setProfile({
						companyName: data.companyName || '',
						companyEmail: data.companyEmail || '',
						kvkNumber: data.kvk || '',
						phoneNumber: data.phone || '',
						password: '********',
					});
				}
			} catch (err) {
				console.error('Error fetching profile:', err);
			}
		};

		fetchUserProfile();
	}, [user]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setProfile((prevProfile) => ({
			...prevProfile,
			[name]: value,
		}));
	};

	const handleSaveChanges = async () => {
		if (!user) return;

		try {
			const profileRef = doc(db, 'users', user.uid);
			await setDoc(profileRef, {
				companyName: profile.companyName,
				companyEmail: profile.companyEmail,
				kvk: profile.kvkNumber,
				phone: profile.phoneNumber,
				creatorUid: user.uid
			}, { merge: true });

			setIsEditing(false);
			console.log('Profiel succesvol bijgewerkt/aangemaakt.');
			alert('Profiel succesvol bijgewerkt!');
		} catch (err) {
			console.error('Fout bij bijwerken/aanmaken profiel:', err);
			setError('Fout bij bijwerken profiel: ' + err);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			setError('De nieuwe wachtwoorden komen niet overeen.');
			return;
		}

		if (newPassword.length < 6) {
			setError('Het wachtwoord moet minimaal 6 tekens lang zijn.');
			return;
		}

		try {
			if (!user) {
				setError('Er is geen gebruiker ingelogd.');
				return;
			}

			// Reauthenticate the user
			const credential = EmailAuthProvider.credential(
				user.email || '',
				currentPassword
			);
			await reauthenticateWithCredential(auth.currentUser!, credential);

			// If reauthentication is successful, update password
			await updatePassword(auth.currentUser!, newPassword);
			console.log('Wachtwoord succesvol gewijzigd.');
			setError(null);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');

			alert('Wachtwoord successvol gewijzigd.');
		} catch (err) {
			setError('Fout bij het wijzigen van wachtwoord: ' + err);
		}
	};

	return (
		<div className={styles.profileContainer}>
			<h1 className={styles.title}>Mijn Profiel</h1>

			{error && <p className={styles.error}>{error}</p>}

			<div className={styles.profileInfo}>
				<div className={styles.infoItem}>
					<strong>Bedrijfsnaam:</strong>
					{isEditing ? (
						<input
							name="companyName"
							value={profile.companyName}
							onChange={handleInputChange}
						/>
					) : (
						<span>{profile.companyName}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong>Bedrijfsemail:</strong>
					{isEditing ? (
						<input
							name="companyEmail"
							value={profile.companyEmail}
							onChange={handleInputChange}
						/>
					) : (
						<span>{profile.companyEmail}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong>KvK-nummer:</strong>
					{isEditing ? (
						<input
							name="kvkNumber"
							value={profile.kvkNumber}
							onChange={handleInputChange}
						/>
					) : (
						<span>{profile.kvkNumber}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong>Telefoonnummer:</strong>
					{isEditing ? (
						<input
							name="phoneNumber"
							value={profile.phoneNumber}
							onChange={handleInputChange}
						/>
					) : (
						<span>{profile.phoneNumber}</span>
					)}
				</div>
			</div>

			<div className={styles.buttonGroup}>
				<div className={styles.buttonGroup__btns}>
					{isEditing ? (
						<>
							<button className={styles.saveButton} onClick={handleSaveChanges}>
								Opslaan
							</button>
							<button
								className={styles.cancelButton}
								onClick={() => setIsEditing(false)}
							>
								Annuleren
							</button>
						</>
					) : (
						<button
							className={styles.toggleButton}
							onClick={() => setIsEditing(true)}
						>
							Profiel bewerken
						</button>
					)}
				</div>

				<div>
					<button
						className={styles.toggleButton}
						onClick={() => setShowPasswordForm(!showPasswordForm)}
					>
						{showPasswordForm ? 'Annuleren' : 'Wachtwoord wijzigen'}
					</button>
				</div>
			</div>

			{showPasswordForm && (
				<div className={styles.passwordSection}>
					<h2 className={styles.subtitle}>Wachtwoord wijzigen</h2>
					<form className={styles.passwordForm} onSubmit={handlePasswordChange}>
						<div className={styles.formGroup}>
							<label htmlFor="currentPassword">Huidig wachtwoord</label>
							<div className={styles.passwordInput}>
								<input
									type={showCurrentPassword ? 'text' : 'password'}
									id="currentPassword"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									required
								/>
								<span
									className={styles.showText}
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								>
									{showCurrentPassword ? 'Hide' : 'Show'}
								</span>
							</div>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="newPassword">Nieuw wachtwoord</label>
							<div className={styles.passwordInput}>
								<input
									type={showNewPassword ? 'text' : 'password'}
									id="newPassword"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<span
									className={styles.showText}
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? 'Hide' : 'Show'}
								</span>
							</div>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</label>
							<div className={styles.passwordInput}>
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
								<span
									className={styles.showText}
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? 'Hide' : 'Show'}
								</span>
							</div>
						</div>

						<button type="submit" className={styles.submitButton}>
							Wachtwoord wijzigen
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default ProfilePage;
