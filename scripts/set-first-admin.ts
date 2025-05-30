import admin from 'firebase-admin';
import dotenv from 'dotenv';

const FIRST_ADMIN_UID: string = 'vk9Nv90RgKXNqZ6MTym3WYwW6Lo2';
dotenv.config({ path: '.env' });

let initializedAdmin: admin.app.App | null = null;

function initializeAdminSDK() {
	if (admin.apps.length > 0) {
		console.log('Admin SDK already initialized.');
		return admin.apps[0];
	}

	console.log('Initializing Admin SDK for script...');
	const serviceAccount = {
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
	};

	if (
		!serviceAccount.projectId ||
		!serviceAccount.clientEmail ||
		!serviceAccount.privateKey
	) {
		console.error(
			'Error: Missing required Firebase Admin credentials environment variables.'
		);
		console.error(
			'Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
		);
		process.exit(1);
	}

	try {
		const app = admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL:
				process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
				`https://${serviceAccount.projectId}.firebaseio.com`,
		});
		console.log('Admin SDK initialized successfully.');
		return app;
	} catch (error) {
		console.error('Error initializing Firebase Admin SDK:', error);
		process.exit(1);
	}
}

initializedAdmin = initializeAdminSDK();

async function setFirstAdminClaim() {
	if (!FIRST_ADMIN_UID || FIRST_ADMIN_UID === 'REPLACE_WITH_USER_UID') {
		console.error(
			'Error: Please replace FIRST_ADMIN_UID in the script with a valid user UID.'
		);
		process.exit(1);
	}

	if (!initializedAdmin) {
		console.error('Error: Firebase Admin SDK not initialized.');
		process.exit(1);
	}

	try {
		console.log(
			`Attempting to set admin claim for user: ${FIRST_ADMIN_UID}...`
		);
		await initializedAdmin
			.auth()
			.setCustomUserClaims(FIRST_ADMIN_UID, { admin: true });
		console.log(
			`✅ Successfully set 'admin: true' claim for user: ${FIRST_ADMIN_UID}`
		);
		console.log(
			'The user may need to sign out and back in, or force a token refresh in the app, for the change to take effect.'
		);
		process.exit(0);
	} catch (error) {
		console.error(
			`Error setting custom claims for user ${FIRST_ADMIN_UID}:`,
			error
		);
		process.exit(1);
	}
}

setFirstAdminClaim();
