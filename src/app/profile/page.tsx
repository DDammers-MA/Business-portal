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

export default ProfilePage;