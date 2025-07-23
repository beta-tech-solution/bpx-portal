
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "bpx-portal",
  "appId": "1:196941778357:web:cab72b07a754cf6488ddfc",
  "storageBucket": "bpx-portal.appspot.com",
  "apiKey": "AIzaSyCwGvOnK1C_SXurmFeyetXfKt9nX7MfN5Q",
  "authDomain": "bpx-portal.firebaseapp.com",
  "messagingSenderId": "196941778357"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// NOTE: Firebase Storage is not used in this project.
// We are using Cloudinary for image uploads.
const storage = {};

export { app, auth, db, storage };
