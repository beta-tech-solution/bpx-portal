
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
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.735l5.657,5.657C14.631,16.59,18.986,14,24,14c3.055,0,5.838,1.15,7.957,3.035l5.653-5.653C34.042,6.05,29.263,4,24,4C16.318,4,9.656,8.337,6.306,14.735z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,35.596,44,30.163,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
    )
}

export default function SignupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
                variant: "destructive"
            });
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName,
                email,
                phone: `${phoneCode}${phoneNumber}`,
                gender,
                createdAt: serverTimestamp(),
                balance: 0,
                status: 'Active',
                role: 'User' // Default role for new sign-ups
            });

            toast({ title: "Account Created", description: "Your account has been created successfully. Please sign in." })
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

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true)
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            const additionalInfo = getAdditionalUserInfo(result)

            if (additionalInfo?.isNewUser) {
                 await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: user.displayName,
                    email: user.email,
                    phone: user.phoneNumber,
                    gender: 'Not specified',
                    createdAt: serverTimestamp(),
                    balance: 0,
                    status: 'Active',
                    role: 'User' // Default role
                });
                toast({ title: "Account Created", description: "Your account has been created successfully. Please sign in." })
                router.push('/login')
            } else {
                 toast({ title: "Welcome Back!", description: "You have been successfully signed in." })
                 router.push('/dashboard')
            }
        } catch (error: any) {
            console.error("Google signup error:", error)
            toast({ title: "Google Sign-in Failed", description: "Could not sign in with Google. Please try again.", variant: "destructive" })
        } finally {
            setIsGoogleLoading(false)
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8 animate-fade-in">
      <Card className="w-full max-w-md mx-4">
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
                    <Input id="full-name" name="full-name" placeholder="John Doe" required />
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
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} required />
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
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignup} disabled={isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                    Sign in with Google
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
