
// IMPORTANT: DO NOT COMMIT THIS FILE TO GITHUB.
// This file contains sensitive API keys. It has been added to .gitignore to prevent accidental exposure.

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded Firebase configuration for the development environment.
const firebaseConfig = {
  apiKey: "AlzaSyCwGvOnK1C_SXurmFeyetXfKt9nX7MfN5Q",
  authDomain: "bpx-portal.firebaseapp.com",
  projectId: "bpx-portal",
  storageBucket: "bpx-portal.appspot.com",
  messagingSenderId: "196941778357",
  appId: "1:196941778357:web:c19a592fe9a11c1688ddfc"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// NOTE: Firebase Storage is not used in this project.
// We are using Cloudinary for image uploads.
const storage = {};

export { app, auth, db, storage };
