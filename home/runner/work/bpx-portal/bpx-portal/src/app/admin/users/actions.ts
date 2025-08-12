
"use server";

import { auth as adminAuth, db } from "@/lib/firebase/admin";
import { doc, deleteDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

export async function deleteUserAction(uid: string) {
    if (!uid) {
        throw new Error("User ID is required.");
    }

    try {
        await adminAuth.deleteUser(uid);
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
            console.error("Error deleting user from Firebase Auth:", error);
            throw new Error(error.message || "An error occurred while deleting the user from Authentication.");
        }
    }

    try {
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
        return { success: true, message: "User deleted successfully." };
    } catch(error: any) {
        console.error("Error deleting user from Firestore:", error);
        throw new Error(error.message || "An error occurred while deleting the user from the database.");
    }
}

const UserCreationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string(),
    balance: z.number(),
    status: z.string(),
    role: z.string(),
    bpexchUsername: z.string().optional(),
    bpexchPassword: z.string().optional(),
    adminMessage: z.string().optional(),
});

export async function createUserAction(userData: z.infer<typeof UserCreationSchema>) {
    try {
        const validatedData = UserCreationSchema.parse(userData);
        
        const userRecord = await adminAuth.createUser({
            email: validatedData.email,
            password: validatedData.password,
            displayName: validatedData.fullName,
            emailVerified: false, // Users created by admin are not verified by default
        });

        const newUser = {
            uid: userRecord.uid,
            fullName: validatedData.fullName,
            email: validatedData.email,
            balance: validatedData.balance,
            status: validatedData.status,
            role: validatedData.role,
            createdAt: serverTimestamp(),
            bpexchUsername: validatedData.bpexchUsername,
            bpexchPassword: validatedData.bpexchPassword,
            adminMessage: validatedData.adminMessage,
            emailVerified: false,
        };

        await setDoc(doc(db, "users", userRecord.uid), newUser);

        return { success: true, message: "User created successfully" };
    } catch (error: any) {
        console.error("Error creating user:", error);
        
        // Clean up Auth user if Firestore write fails
        if (error.uid) {
            await adminAuth.deleteUser(error.uid).catch(e => console.error("Cleanup failed:", e));
        }

        if (error instanceof z.ZodError) {
            return { success: false, message: "Invalid user data provided." };
        }

        return { success: false, message: error.message || "An unknown error occurred during user creation." };
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

    