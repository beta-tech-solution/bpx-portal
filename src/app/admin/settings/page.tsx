
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, PlusCircle, Trash2, Loader2, User, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db, auth } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Account {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function AdminSettingsPage() {
    const { toast } = useToast()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user] = useAuthState(auth)
    const [adminProfile, setAdminProfile] = useState({ name: '', email: '', photoURL: '' })
    const [profileSaving, setProfileSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string | undefined | null): string => {
        if (!name) return 'A';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true)
            const settingsDocRef = doc(db, "settings", "depositAccounts")
            const docSnap = await getDoc(settingsDocRef)
            if (docSnap.exists()) {
                setAccounts(docSnap.data().accounts || [])
            } else {
                setAccounts([{ id: crypto.randomUUID(), bankName: '', accountHolder: '', accountNumber: '' }])
            }
            setLoading(false)
        }
        fetchSettings()

         if(user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                     setAdminProfile({
                        name: data.fullName || 'Admin User',
                        email: data.email || 'admin@bpx.com',
                        photoURL: data.photoURL || ''
                    });
                }
            })
        }
    }, [user])

    const handleAddAccount = () => {
        setAccounts([...accounts, { id: crypto.randomUUID(), bankName: '', accountHolder: '', accountNumber: '' }])
    }

    const handleRemoveAccount = (id: string) => {
        if (accounts.length > 1) {
            setAccounts(accounts.filter(acc => acc.id !== id))
        } else {
            toast({ title: "Cannot Remove", description: "You must have at least one account.", variant: "destructive"})
        }
    }

    const handleAccountChange = (id: string, field: keyof Omit<Account, 'id'>, value: string) => {
        setAccounts(accounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc))
    }

    const handleSaveAccounts = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        try {
            const settingsDocRef = doc(db, "settings", "depositAccounts")
            await setDoc(settingsDocRef, { accounts })
            toast({
                title: "Bank Accounts Saved",
                description: "Account details have been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving settings:", error)
            toast({ title: "Error", description: "Could not save bank accounts.", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminProfile(prev => ({...prev, [name]: value}));
    }

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!user) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileSaving(true);
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
            setAdminProfile(prev => ({...prev, photoURL}));

            toast({ title: "Profile Picture Updated" });
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast({ title: "Error", description: "Could not update profile picture.", variant: "destructive"});
        } finally {
            setProfileSaving(false);
        }
    }

    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!user) return;
        setProfileSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                fullName: adminProfile.name,
                email: adminProfile.email,
            });
            toast({title: "Profile Updated", description: "Your admin profile has been updated."});
        } catch (error) {
            console.error("Error updating admin profile:", error);
            toast({title: "Error", description: "Could not update your profile.", variant: "destructive"});
        } finally {
            setProfileSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in grid gap-8">
        <form onSubmit={handleSaveProfile}>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Admin Profile</CardTitle>
                    <CardDescription>Manage your administrator profile details.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="flex items-center gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={adminProfile.photoURL} alt={adminProfile.name} />
                            <AvatarFallback>{getInitials(adminProfile.name)}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" /> Change Picture
                        </Button>
                     </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" name="name" value={adminProfile.name} onChange={handleProfileChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" value={adminProfile.email} onChange={handleProfileChange} />
                    </div>
                </CardContent>
                <CardFooter>
                     <Button type="submit" disabled={profileSaving}>
                        {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                        Save Profile
                    </Button>
                </CardFooter>
            </Card>
        </form>

        <form onSubmit={handleSaveAccounts}>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Account Details Management</CardTitle>
                    <CardDescription>Update the bank account information displayed to users on the deposit page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {accounts.map((account, index) => (
                        <div key={account.id} className="p-4 border rounded-lg space-y-4 relative">
                            <h3 className="font-semibold text-lg">Account {index + 1}</h3>
                             <div className="space-y-2">
                                <Label htmlFor={`bankName-${account.id}`}>Bank Name</Label>
                                <Input id={`bankName-${account.id}`} value={account.bankName} onChange={(e) => handleAccountChange(account.id, 'bankName', e.target.value)} placeholder="Global Trust Bank" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`accountNumber-${account.id}`}>Account Number</Label>
                                <Input id={`accountNumber-${account.id}`} value={account.accountNumber} onChange={(e) => handleAccountChange(account.id, 'accountNumber', e.target.value)} placeholder="1234567890" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`accountHolder-${account.id}`}>Account Holder Name</Label>
                                <Input id={`accountHolder-${account.id}`} value={account.accountHolder} onChange={(e) => handleAccountChange(account.id, 'accountHolder', e.target.value)} placeholder="BPX Services" />
                            </div>
                             <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveAccount(account.id)}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddAccount}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Account
                    </Button>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Bank Accounts
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  )
}
    
