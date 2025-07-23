
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, PlusCircle, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"

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

    useEffect(() => {
        const fetchAccounts = async () => {
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
        fetchAccounts()
    }, [])

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        try {
            const settingsDocRef = doc(db, "settings", "depositAccounts")
            await setDoc(settingsDocRef, { accounts })
            toast({
                title: "Settings Saved",
                description: "Account details have been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving settings:", error)
            toast({ title: "Error", description: "Could not save settings.", variant: "destructive" })
        } finally {
            setSaving(false)
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
    <div className="max-w-2xl mx-auto animate-fade-in">
        <form onSubmit={handleSubmit}>
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
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  )
}

    