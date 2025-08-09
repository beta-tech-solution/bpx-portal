"use server";

import { auth as adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { doc, deleteDoc } from "firebase/firestore";

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
