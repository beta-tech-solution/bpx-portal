
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Settings Saved",
            description: "Account details have been updated successfully.",
        });
    }

  return (
    <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Account Details Management</CardTitle>
                    <CardDescription>Update the bank account information displayed to users on the deposit page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" defaultValue="Global Trust Bank" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" defaultValue="1234567890" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input id="accountHolder" defaultValue="BPX Services" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  )
}

    