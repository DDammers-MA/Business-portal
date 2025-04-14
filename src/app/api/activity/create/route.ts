import { NextResponse } from 'next/server';
import { db, firebaseAdmin } from '../../../../../utils/firebase.admin';

// Define the expected data structure, including creatorUid
interface ActivityData {
	type: string;
	name: string;
	addr: string;
	description: string;
	opening_hours: string;
	image_url: string;
	email: string;
	phone: string;
	budget: string;
	start_time: string;
	end_time: string;
	date: string;
	place: string;
	postal_code: string;
	creatorUid?: string; // Added creatorUid as optional here, will be added before saving
}

export async function POST(request: Request) {
	try {
		// 1. Verify Firebase Auth Token
		const authorization = request.headers.get('Authorization');
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: 'Unauthorized: Missing or invalid Bearer token' },
				{ status: 401 }
			);
		}
		const token = authorization.substring(7); // Remove 'Bearer '

		let decodedToken;
		try {
			decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		} catch (error) {
			console.error('Error verifying Firebase ID token:', error);
			return NextResponse.json(
				{ message: 'Forbidden: Invalid or expired token' },
				{ status: 403 }
			);
		}

		const uid = decodedToken.uid;

		// 2. Parse Request Body
		const data: Omit<ActivityData, 'creatorUid'> = await request.json(); // Exclude creatorUid initially

		// 3. Basic Validation - Check for essential fields
		const requiredFields: (keyof Omit<ActivityData, 'creatorUid'>)[] = [
			'type',
			'name',
			'addr',
			'description',
			'date',
			'place',
			'postal_code',
		];
		const missingFields = requiredFields.filter((field) => !data[field]);

		if (missingFields.length > 0) {
			return NextResponse.json(
				{
					message: `Missing required fields: ${missingFields.join(', ')}`,
				},
				{ status: 400 }
			);
		}

		// 4. Add creatorUid to data
		const dataWithUid: ActivityData = {
			...data,
			creatorUid: uid, // Add the verified user ID
		};

		// 5. Add data to Firestore
		const docRef = await db.collection('activities').add(dataWithUid);

		console.log('Document written with ID: ', docRef.id);

		// 6. Respond with success
		return NextResponse.json(
			{
				message: 'Activity created successfully',
				id: docRef.id,
			},
			{ status: 201 } // 201 Created
		);
	} catch (error) {
		console.error('Error creating activity:', error);

		let errorMessage = 'Internal Server Error';
		let statusCode = 500;

		if (error instanceof SyntaxError) {
			errorMessage = 'Invalid JSON payload';
			statusCode = 400;
		} else if (error instanceof Error) {
			// Handle other errors (e.g., Firestore)
			errorMessage = error.message || errorMessage;
		}

		return NextResponse.json(
			{
				message: errorMessage,
			},
			{ status: statusCode }
		);
	}
}
