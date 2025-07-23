
"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, User, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase/config";
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CLOUDINARY_CLOUD_NAME = "datq7sbdp";
const CLOUDINARY_UPLOAD_PRESET = "bpxmaster";

export default function UserSettingsPage() {
    const { toast } = useToast();
    const [user, loadingUser] = useAuthState(auth);
    const [userData, setUserData] = useState({ fullName: '', phone: '', photoURL: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            getDoc(userDocRef).then(docSnap => {
                if(docSnap.exists()){
                    const data = docSnap.data();
                    setUserData({
                        fullName: data.fullName || '',
                        phone: data.phone || '',
                        photoURL: data.photoURL || ''
                    });
                }
                setIsLoading(false);
            })
        } else if (!loadingUser) {
            setIsLoading(false);
        }
    }, [user, loadingUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({...prev, [name]: value}));
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!user) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });
    
            if (!uploadResponse.ok) throw new Error('Cloudinary upload failed');
            
            const cloudinaryData = await uploadResponse.json();
            const photoURL = cloudinaryData.secure_url;

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL });
            setUserData(prev => ({...prev, photoURL}));

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
                fullName: userData.fullName,
                phone: userData.phone
            });
            toast({
                title: "Profile Updated",
                description: "Your profile details have been saved successfully.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast({ title: "Error", description: "Could not save your profile.", variant: "destructive"});
        } finally {
            setIsSaving(false);
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
        <div className="max-w-2xl mx-auto animate-fade-in grid gap-8">
            <form onSubmit={handleSaveChanges}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Your Profile</CardTitle>
                        <CardDescription>Manage your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={userData.photoURL} alt={userData.fullName} />
                                <AvatarFallback>{getInitials(userData.fullName)}</AvatarFallback>
                            </Avatar>
                             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Camera className="mr-2 h-4 w-4" /> Change Picture
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" value={userData.fullName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" value={userData.phone} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
