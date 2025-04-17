'use client';

import React, { useState } from 'react';
import styles from './profile.module.scss';

const ProfilePage = () => {

	const [profile, setProfile] = useState({
		companyName: 'Jouw Bedrijf',
		companyEmail: 'info@jouwbedrijf.nl',
		phoneNumber: '+31 6 12345678',
		password: '********',
	});


	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

};


const handlePasswordChange = (e: React.FormEvent) => {
	e.preventDefault();

	if (newPassword !== confirmPassword) {
		setError('De nieuwe wachtwoorden komen niet overeen.');
		return;
	}

	setError(null);
	console.log('Wachtwoord succesvol gewijzigd.');
	setCurrentPassword('');
	setNewPassword('');
	setConfirmPassword('');
};

return (
	<div className={styles.profileContainer}>
		{}
		<h1 className={styles.title}>Mijn Profiel</h1>

		{}
		{error && <p className={styles.error}>{error}</p>}

		{}
		<div className={styles.profileInfo}>
			<div className={styles.infoItem}>
				<strong>Bedrijfsnaam:</strong> <span>{profile.companyName}</span>
			</div>
			<div className={styles.infoItem}>
				<strong>Bedrijfsemail:</strong> <span>{profile.companyEmail}</span>
			</div>
			<div className={styles.infoItem}>
				<strong>Telefoonnummer:</strong> <span>{profile.phoneNumber}</span>
			</div>
			<div className={styles.infoItem}>
				<strong>Wachtwoord:</strong> <span>{profile.password}</span>
			</div>
		</div>

		{}
		<button
                className={styles.toggleButton}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
                {showPasswordForm ? 'Annuleren' : 'Wachtwoord wijzigen'}
            </button>


export default ProfilePage;