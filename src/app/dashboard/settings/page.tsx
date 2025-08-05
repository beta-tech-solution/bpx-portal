
"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, User, Camera, KeyRound, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface UserData {
    fullName: string;
    phone: string;
    photoURL: string;
    email: string;
    createdAt?: Timestamp;
}

export default function UserSettingsPage() {
    const { toast } = useToast();
    const [user, loadingUser] = useAuthState(auth);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editableFullName, setEditableFullName] = useState("");

    const getInitials = (name: string | undefined | null): string => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };
    
    useEffect(() => {
        if(user) {
            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if(docSnap.exists()){
                    const data = docSnap.data() as UserData;
                    setUserData(data);
                    setEditableFullName(data.fullName);
                }
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else if (!loadingUser) {
            setIsLoading(false);
        }
    }, [user, loadingUser]);

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!user) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);
    
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
    
            if (!uploadResponse.ok) throw new Error('Cloudinary upload failed');
            
            const cloudinaryData = await uploadResponse.json();
            const photoURL = cloudinaryData.secure_url;

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL });

            toast({ title: "Profile Picture Updated" });
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast({ title: "Error", description: "Could not update profile picture.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    }


    const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!user) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                fullName: editableFullName
            });
            toast({
                title: "Profile Updated",
                description: "Your full name has been saved successfully.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast({ title: "Error", description: "Could not save your profile.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    }

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user || !user.email) return;

        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
            return;
        }
        
        if (newPassword.length < 6) {
             toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
             return;
        }

        setIsPasswordSaving(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            toast({ title: "Password Updated", description: "Your password has been changed successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Password change error:", error);
            let description = "Could not update password. Please try again.";
            if (error.code === 'auth/wrong-password') {
                description = "The current password you entered is incorrect.";
            }
            toast({ title: "Error", description, variant: "destructive" });
        } finally {
            setIsPasswordSaving(false);
        }
    }

    if (isLoading || loadingUser) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Profile</CardTitle>
                    <CardDescription>Manage your personal and security information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveChanges} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={userData?.photoURL} alt={userData?.fullName} />
                                <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                            </Avatar>
                             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                                <Camera className="mr-2 h-4 w-4" /> Change Picture
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" value={editableFullName} onChange={(e) => setEditableFullName(e.target.value)} />
                        </div>
                         <div className="flex items-center gap-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Name
                            </Button>
                        </div>
                    </form>

                    <Separator className="my-8" />
                    
                    <div className="space-y-4">
                        <h3 className="font-headline font-semibold text-lg">Account Information</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            <Mail className="h-5 w-5 text-primary"/>
                            <span>{userData?.email}</span>
                        </div>
                         <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            <Phone className="h-5 w-5 text-primary"/>
                            <span>{userData?.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary"/>
                            <span>Joined on {userData?.createdAt ? format(userData.createdAt.toDate(), 'PPP') : 'N/A'}</span>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                         <h3 className="font-headline font-semibold text-lg">Change Password</h3>
                         <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={isPasswordSaving}>
                                {isPasswordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
