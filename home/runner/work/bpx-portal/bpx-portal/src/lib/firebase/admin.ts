
import * as admin from 'firebase-admin';

// Check if the service account key is available in the environment variables
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please add it to your Vercel project settings.');
}

// Parse the service account key from the environment variable.
// This needs to be done carefully as it's a JSON string.
let serviceAccount;
try {
    // Vercel and other platforms escape newlines in multiline environment variables.
    // We need to un-escape them for JSON.parse to work correctly.
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid, unescaped JSON string in your environment variables.", e);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.');
}

// Initialize the Firebase Admin SDK, but only if it hasn't been initialized already.
// This prevents errors in hot-reloading environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error', error.stack);
  }
}

// Export the initialized admin services.
export const auth = admin.auth();
export const db = admin.firestore();
