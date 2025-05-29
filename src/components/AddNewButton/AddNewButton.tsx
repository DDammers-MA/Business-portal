import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import styles from './addNewButton.module.scss';

const AddNewButton = () => {
	const { user, isAdmin } = useAuth();
	const [canCreateActivities, setCanCreateActivities] = useState(false);

	useEffect(() => {
		const fetchSettings = async () => {
			if (!user || !isAdmin) return;

			try {
				const token = await user.getIdToken();
				const response = await fetch('/api/admin/settings/get', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data = await response.json();
					setCanCreateActivities(data.settings?.canCreateActivities || false);
				}
			} catch (error) {
				console.error('Error fetching admin settings:', error);
			}
		};

		fetchSettings();
	}, [user, isAdmin]);

	if (isAdmin && !canCreateActivities) {
		return null;
	}

	if (!isAdmin) {
		return (
			<Link className={styles.addNewButton} href="/create">
				<i className="fa-solid fa-plus"></i>Add new
			</Link>
		);
	}

	return (
		<Link className={styles.addNewButton} href="/create">
			<i className="fa-solid fa-plus"></i>Add new
		</Link>
	);
};

export default AddNewButton;
