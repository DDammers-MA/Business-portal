'use client';

import React, { useState, useEffect } from 'react';
import styles from './profile.module.scss';
import { db } from '../../../utils/firebase.browser';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
	getAuth,
	reauthenticateWithCredential,
	EmailAuthProvider,
	updatePassword,
} from 'firebase/auth';
import PasswordChangeModal from './PasswordChangeModal';

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

	const [isEditing, setIsEditing] = useState(false);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
				toast.error('Failed to fetch profile');
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
			toast.success('Profile updated successfully');
		} catch (err) {
			toast.error('Failed to update profile');
			setError('Failed to update profile: ' + err);
		}
	};

	const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
		if (!user) {
			throw new Error('No user logged in');
		}

		const credential = EmailAuthProvider.credential(
			user.email || '',
			currentPassword
		);
		await reauthenticateWithCredential(auth.currentUser!, credential);
		await updatePassword(auth.currentUser!, newPassword);
	};

	return (
		<div className={styles.profileContainer}>
			<h1 className={styles.title}>
				<i className="fas fa-user-circle"></i>
				My Profile
			</h1>

			{error && (
				<div className={styles.error}>
					<i className="fas fa-exclamation-circle"></i>
					{error}
				</div>
			)}

			<div className={styles.profileInfo}>
				<div className={styles.infoItem}>
					<strong><i className="fas fa-building"></i> Company name</strong>
					{isEditing ? (
						<input
							name="companyName"
							value={profile.companyName}
							onChange={handleInputChange}
							placeholder="Enter company name"
						/>
					) : (
						<span>{profile.companyName}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong><i className="fas fa-envelope"></i> Company email</strong>
					{isEditing ? (
						<input
							name="companyEmail"
							value={profile.companyEmail}
							onChange={handleInputChange}
							placeholder="Enter company email"
						/>
					) : (
						<span>{profile.companyEmail}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong><i className="fas fa-id-card"></i> Unique entrepreneur ID</strong>
					{isEditing ? (
						<input
							name="kvkNumber"
							value={profile.kvkNumber}
							onChange={handleInputChange}
							placeholder="Enter KVK number"
						/>
					) : (
						<span>{profile.kvkNumber}</span>
					)}
				</div>
				<div className={styles.infoItem}>
					<strong><i className="fas fa-phone"></i> Phone number</strong>
					{isEditing ? (
						<input
							name="phoneNumber"
							value={profile.phoneNumber}
							onChange={handleInputChange}
							placeholder="Enter phone number"
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
								<i className="fas fa-save"></i>
								Save
							</button>
							<button
								className={styles.cancelButton}
								onClick={() => setIsEditing(false)}
							>
								<i className="fas fa-times"></i>
								Cancel
							</button>
						</>
					) : (
						<button
							className={styles.toggleButton}
							onClick={() => setIsEditing(true)}
						>
							<i className="fas fa-edit"></i>
							Edit profile
						</button>
					)}
				</div>

				<button
					className={styles.toggleButton}
					onClick={() => setIsPasswordModalOpen(true)}
				>
					<i className="fas fa-key"></i>
					Change password
				</button>
			</div>

			<PasswordChangeModal
				isOpen={isPasswordModalOpen}
				onClose={() => setIsPasswordModalOpen(false)}
				onSubmit={handlePasswordChange}
			/>
		</div>
	);
};

export default ProfilePage;
