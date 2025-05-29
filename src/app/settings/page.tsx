import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '../../../utils/firebase.admin';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get('auth-token');

		if (!authToken?.value) {
			redirect('/login');
		}

		// Verify the ID token
		const decodedToken = await firebaseAdmin
			.auth()
			.verifyIdToken(authToken.value);

		if (!decodedToken.admin) {
			redirect('/');
		}

		// Get user settings from Firestore
		const db = firebaseAdmin.firestore();
		const userDoc = await db.collection('users').doc(decodedToken.uid).get();
		const settings = userDoc.data()?.settings || {};

		return (
			<div>
				<SettingsClient initialSettings={settings} userId={decodedToken.uid} />
			</div>
		);
	} catch (error) {
		console.error('Settings page error:', error);
		redirect('/login');
	}
}
