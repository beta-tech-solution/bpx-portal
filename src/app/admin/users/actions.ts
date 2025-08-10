
"use server";

import { auth as adminAuth, db } from "@/lib/firebase/admin";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

export async function deleteUserAction(uid: string) {
    if (!uid) {
        throw new Error("User ID is required.");
    }

    try {
        // Attempt to delete from Firebase Authentication first.
        await adminAuth.deleteUser(uid);
    } catch (error: any) {
        // If the user doesn't exist in Auth, we can ignore the error and proceed.
        // This makes the cleanup more robust.
        if (error.code !== 'auth/user-not-found') {
            console.error("Error deleting user from Firebase Auth:", error);
            throw new Error(error.message || "An error occurred while deleting the user from Authentication.");
        }
    }

    try {
        // Always attempt to delete from Firestore.
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
        return { success: true, message: "User deleted successfully." };
    } catch(error: any) {
        console.error("Error deleting user from Firestore:", error);
        throw new Error(error.message || "An error occurred while deleting the user from the database.");
    }
}

export async function updateUserVerificationAction(uid: string, isVerified: boolean) {
    if (!uid) {
        throw new Error("User ID is required.");
    }

    try {
        // Update Firebase Authentication
        await adminAuth.updateUser(uid, {
            emailVerified: isVerified
        });

        // Update Firestore
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            emailVerified: isVerified
        });

        return { success: true, message: `User email verification status set to ${isVerified}.` };

    } catch (error: any) {
        console.error("Error updating user verification:", error);
        throw new Error(error.message || "An unknown error occurred while updating verification status.");
    }
}
