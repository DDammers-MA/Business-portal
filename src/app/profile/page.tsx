'use client';

import React, { useState } from 'react';
import styles from './profile.module.scss';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        companyName: 'Jouw Bedrijf',
        companyEmail: 'info@jouwbedrijf.nl',
        kvkNumber: '12345678', 
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
            <h1 className={styles.title}>Mijn Profiel</h1>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.profileInfo}>
                <div className={styles.infoItem}>
                    <strong>Bedrijfsnaam:</strong> <span>{profile.companyName}</span>
                </div>
                <div className={styles.infoItem}>
                    <strong>Bedrijfsemail:</strong> <span>{profile.companyEmail}</span>
                </div>
                <div className={styles.infoItem}>
                    <strong>KvK-nummer:</strong> <span>{profile.kvkNumber}</span> 
                </div>
                <div className={styles.infoItem}>
                    <strong>Telefoonnummer:</strong> <span>{profile.phoneNumber}</span>
                </div>
                <div className={styles.infoItem}>
                    <strong>Wachtwoord:</strong> <span>{profile.password}</span>
                </div>
            </div>

            <button
                className={styles.toggleButton}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
                {showPasswordForm ? 'Annuleren' : 'Wachtwoord wijzigen'}
            </button>

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