
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react"
import { auth, db } from "@/lib/firebase/config"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import ParticlesBackground from "@/components/particles-background"

export default function SignupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const form = e.currentTarget
        const fullName = (form.elements.namedItem('full-name') as HTMLInputElement).value
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const phoneCode = (form.elements.namedItem('phone-code') as HTMLInputElement)?.value || '+92'
        const phoneNumber = (form.elements.namedItem('phone-number') as HTMLInputElement).value
        const gender = (form.elements.namedItem('gender') as HTMLInputElement)?.value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value
        const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value

        if (password !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
            setIsLoading(false)
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName,
                email,
                phone: `${phoneCode}${phoneNumber}`,
                gender,
                createdAt: serverTimestamp(),
                balance: 0,
                status: 'Active',
                role: 'User',
                emailVerified: true, // Mark as true since we are skipping verification
                adminVerified: false,
            });

            toast({ title: "Account Created", description: "Your account has been created successfully. You can now log in." })
            router.push('/login')

        } catch (error: any) {
            console.error("Signup error:", error)
            let errorMessage = "An unexpected error occurred."
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "This email address is already in use."
            }
             toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8 animate-fade-in overflow-hidden">
        <ParticlesBackground variant="signup" />
      <Card className="w-full max-w-md mx-4 z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Wallet className="w-10 h-10 text-primary"/>
            </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" name="full-name" placeholder="Full Name" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                        <Label htmlFor="phone-code">Code</Label>
                        <Select name="phone-code" defaultValue="+92">
                             <SelectTrigger id="phone-code">
                                <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+92">+92</SelectItem>
                                <SelectItem value="+1">+1</SelectItem>
                                <SelectItem value="+44">+44</SelectItem>
                                <SelectItem value="+971">+971</SelectItem>
                                <SelectItem value="+966">+966</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <Input id="phone-number" name="phone-number" placeholder="3001234567" required />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender">
                        <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 relative">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="new-password" />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="grid gap-2 relative">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} required />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                </Button>
            </CardContent>
        </form>
        <CardFooter className="text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
