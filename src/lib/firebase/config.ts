
// This file is git-ignored. Do not remove from .gitignore
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbuTawc-_136hVH4R1GNOLPtQR7WAviZ0",
  authDomain: "bpx-portal.firebaseapp.com",
  projectId: "bpx-portal",
  storageBucket: "bpx-portal.firebasestorage.app",
  messagingSenderId: "196941778357",
  appId: "1:196941778357:web:c19a592fe9a11c1688ddfc"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
