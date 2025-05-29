'use client';

import { useState } from 'react';
import styles from './settings.module.scss';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SettingsClientProps {
	initialSettings: {
		canCreateActivities?: boolean;
	};
	userId: string;
}

export default function SettingsClient({
	initialSettings,
	userId,
}: SettingsClientProps) {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [canCreateActivities, setCanCreateActivities] = useState(
		initialSettings.canCreateActivities || false
	);

	const handleToggleChange = async () => {
		if (!user || isLoading) return;

		setIsLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await fetch('/api/admin/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					settings: {
						canCreateActivities: !canCreateActivities,
					},
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update settings');
			}

			setCanCreateActivities(!canCreateActivities);
			toast.success('Settings updated successfully');
		} catch (error) {
			console.error('Error updating settings:', error);
			toast.error('Failed to update settings');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.settings}>
			<div className={styles.settings__container}>
				<h1>Settings</h1>
				<div className={styles.settings__section}>
					<h2>Activity Creation</h2>
					<div className={styles.settings__option}>
						<label className={styles.settings__toggle}>
							<input
								type="checkbox"
								checked={canCreateActivities}
								onChange={handleToggleChange}
								disabled={isLoading}
							/>
							<span className={styles.settings__toggleSlider}></span>
						</label>
						<span className={styles.settings__optionLabel}>
							Allow this account to create activities
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
