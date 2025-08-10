
"use server";

import { auth as adminAuth, db } from "@/lib/firebase/admin";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

export async function deleteUserAction(uid: string) {
    if (!uid) {
        throw new Error("User ID is required.");
    }

    try {
        // Delete from Firebase Authentication
        await adminAuth.deleteUser(uid);

        // Delete from Firestore
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);

        return { success: true, message: "User deleted successfully." };

    } catch (error: any) {
        console.error("Error deleting user:", error);
        
        // If the user is already deleted from auth but not firestore,
        // still try to delete from firestore
        if (error.code === 'auth/user-not-found') {
            try {
                const userDocRef = doc(db, "users", uid);
                await deleteDoc(userDocRef);
                return { success: true, message: "User cleaned up from database." };
            } catch (dbError) {
                 console.error("Error deleting user from Firestore after auth error:", dbError);
                 throw new Error("User not found in Authentication, and failed to delete from database.");
            }
        }
        
        throw new Error(error.message || "An unknown error occurred while deleting the user.");
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
