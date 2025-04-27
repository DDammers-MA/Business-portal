import { NextResponse } from 'next/server';
import { db, firebaseAdmin } from '../../../../../utils/firebase.admin';

interface ActivityData {
	type: string;
	name: string;
	addr: string;
	description: string;
	opening_hours?: string; // Make optional fields truly optional if they can be
	image_url?: string;
	email?: string;
	phone?: string;
	budget?: string;
	start_time?: string;
	end_time?: string;
	date: string;
	place: string;
	postal_code: string;
	creatorUid?: string;
	status?: string; // Add fields observed in frontend component
	active?: boolean; // Add fields observed in frontend component
}

// Helper function to verify token and get UID
async function verifyToken(
	request: Request
): Promise<{ uid: string; admin: boolean; errorResponse?: NextResponse }> {
	const authorization = request.headers.get('Authorization');
	if (!authorization || !authorization.startsWith('Bearer ')) {
		return {
			uid: '',
			admin: false,
			errorResponse: NextResponse.json(
				{ message: 'Unauthorized: Missing or invalid Bearer token' },
				{ status: 401 }
			),
		};
	}
	const token = authorization.substring(7);

	try {
		const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
		// Check for admin custom claim
		const isAdmin = decodedToken.admin === true;
		return { uid: decodedToken.uid, admin: isAdmin };
	} catch (error) {
		console.error('Error verifying Firebase ID token:', error);
		return {
			uid: '',
			admin: false,
			errorResponse: NextResponse.json(
				{ message: 'Forbidden: Invalid or expired token' },
				{ status: 403 }
			),
		};
	}
}

// GET handler to fetch a single activity
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	if (!id) {
		return NextResponse.json(
			{ message: 'Missing activity ID' },
			{ status: 400 }
		);
	}

	const { uid, admin, errorResponse: authError } = await verifyToken(request);
	if (authError) {
		return authError;
	}

	try {
		const docRef = db.collection('activities').doc(id);
		const docSnap = await docRef.get();

		if (!docSnap.exists) {
			return NextResponse.json(
				{ message: 'Activity not found' },
				{ status: 404 }
			);
		}

		const activityData = docSnap.data() as ActivityData;

		// Authorization check based on Firestore rules (read: creator or admin)
		if (!admin && activityData.creatorUid !== uid) {
			return NextResponse.json(
				{
					message:
						'Forbidden: You do not have permission to view this activity',
				},
				{ status: 403 }
			);
		}

		return NextResponse.json(
			{ ...activityData, id: docSnap.id },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching activity:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

// PUT handler to update an activity
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	if (!id) {
		return NextResponse.json(
			{ message: 'Missing activity ID' },
			{ status: 400 }
		);
	}

	const { uid, admin, errorResponse: authError } = await verifyToken(request);
	if (authError) {
		return authError;
	}

	try {
		const data: Partial<ActivityData> = await request.json();

		// Basic Validation - Check for essential fields that should always exist
		const requiredFields: (keyof ActivityData)[] = [
			'type',
			'name',
			'addr',
			'description',
			'date',
			'place',
			'postal_code',
		];
		const missingFields = requiredFields.filter(
			(field) => !(field in data) || !data[field]
		);

		if (missingFields.length > 0) {
			return NextResponse.json(
				{ message: `Missing required fields: ${missingFields.join(', ')}` },
				{ status: 400 }
			);
		}

		// Remove creatorUid from update payload if present (should not be changeable)
		delete data.creatorUid;

		const docRef = db.collection('activities').doc(id);
		const docSnap = await docRef.get();

		if (!docSnap.exists) {
			return NextResponse.json(
				{ message: 'Activity not found' },
				{ status: 404 }
			);
		}

		const existingData = docSnap.data() as ActivityData;

		// Authorization check based on Firestore rules (update: creator or admin)
		if (!admin && existingData.creatorUid !== uid) {
			return NextResponse.json(
				{
					message:
						'Forbidden: You do not have permission to update this activity',
				},
				{ status: 403 }
			);
		}

		// Perform the update
		await docRef.update(data);

		console.log('Document updated with ID: ', id);

		return NextResponse.json(
			{ message: 'Activity updated successfully', id: id },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating activity:', error);

		let errorMessage = 'Internal Server Error';
		let statusCode = 500;

		if (error instanceof SyntaxError) {
			errorMessage = 'Invalid JSON payload';
			statusCode = 400;
		} else if (error instanceof Error) {
			errorMessage = error.message || errorMessage;
		}

		return NextResponse.json({ message: errorMessage }, { status: statusCode });
	}
}
