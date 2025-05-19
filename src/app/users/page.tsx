import { firebaseAdmin, db } from '../../../utils/firebase.admin';
import { UserRecord } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import UserManagementClient from './UserManagementClient';
import styles from './user.module.scss';

//Bij deze inerface beschijf ik het type van extra gebruikerdate die uit Firestore word opgehaalde, zoals bedrijfsnaam ect..
//Zo kan ik ook deze extra velden combineren met de standaard Firebare Auth gebruikersdata in mijn applicatie.
interface FirestoreUserData {
    companyName?: string;
    phone?: string;
    createdAt?: admin.firestore.Timestamp;
    kvk?: string;
    creatorUid?: string;
}

// Dit is een TypeScript type dat een gecombineerde gebruiker beschrijft. 
// Zo kan ik in de applicatie 1 object gebruiker dat alle gegevens bevat.

export type CombinedUser = {
    id: string;
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
    companyName?: string;
    phone?: string;
    kvk?: string;
    lastLoginAt?: string | null; 
};

//Server component voor de gebruikerspagina
export default async function UsersPage() {
    let combinedUsers: CombinedUser[] = [];
    let fetchError: string | null = null;

    try {
        // Hier haal ik alle gebruiker op uit Firebase Auth 
        const auth = firebaseAdmin.auth();
        const listUsersResult = await auth.listUsers(1000);
        const authUsers = listUsersResult.users;

        //Hier verzamel ik alle user ID's voor firesotre query
        const userIds = authUsers.map((user: UserRecord) => user.uid);
        const firestoreUsersData: { [key: string]: FirestoreUserData } = {};

        //Hier haal ik de Firestore gebruikersdata op in batches
        //Ik heb een maximum gegevens van 30 gebruikers per query
        if (userIds.length > 0) {
            const MAX_IDS_PER_QUERY = 30;
            const userDocPromises: Promise<admin.firestore.QuerySnapshot>[] = [];
            for (let i = 0; i < userIds.length; i += MAX_IDS_PER_QUERY) {
                const batchIds = userIds.slice(i, i + MAX_IDS_PER_QUERY);
                const usersQuery = db
                    .collection('users')
                    .where(admin.firestore.FieldPath.documentId(), 'in', batchIds);
                userDocPromises.push(usersQuery.get());
            }


            //Hier combineer ik alle firestore resultaten in 1 object
            const querySnapshots = await Promise.all(userDocPromises);
            querySnapshots.forEach((snapshot: admin.firestore.QuerySnapshot) => {
                snapshot.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
                    firestoreUsersData[doc.id] = doc.data() as FirestoreUserData;
                });
            });
        }


        //Hier combineer ik Auth gebruikersdata met Firestore gebruikersdata
        combinedUsers = authUsers.map((authUser: UserRecord) => {
            const firestoreData = firestoreUsersData[authUser.uid] || {};
            return {
                id: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                companyName: firestoreData.companyName,
                phone: firestoreData.phone,
                kvk: firestoreData.kvk,
                lastLoginAt: authUser.metadata.lastSignInTime || null, 
            };
        });
    } catch (error) {
        //dit is een foutafhandelings functie, die word uitgevoerd als bij ophalen van gebruikers een fout optreed
        console.error('Error fetching users:', error);
        fetchError = 'Failed to load users. Please try again later.';
    }

    //Hier render ik de gebruikerspagina met UserManagementClient of foutmelding
    return (
        <div className={styles.user}>
            {fetchError ? (
                <p>{fetchError}</p>
            ) : (
                <UserManagementClient initialUsers={combinedUsers} />
            )}
        </div>
    );
}