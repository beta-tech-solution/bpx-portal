
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let serviceAccount;
try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is set correctly in your environment variables.", e);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON.');
}

// A robust singleton pattern to initialize Firebase Admin SDK on Vercel
const getAdminApp = () => {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
};

const app = getAdminApp();
export const auth = admin.auth(app);
export const db = admin.firestore(app);
