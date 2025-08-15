
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
import { Wallet, Eye, EyeOff, Loader2, Mail } from "lucide-react"
import { auth, db } from "@/lib/firebase/config"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, sendPasswordResetEmail } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import ParticlesBackground from "@/components/particles-background"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"


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

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState("")
    const [isResetting, setIsResetting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await auth.signOut();
                toast({ title: "Login Failed", description: "User profile not found.", variant: "destructive" });
                setIsLoading(false);
                return;
            }
            
            const userData = userDoc.data();
            
            if (userData.role === 'Admin') {
                toast({ title: "Admin Login Successful", description: "Welcome back!" });
                router.push('/admin/dashboard');
                return;
            }
            
            const isVerified = user.emailVerified || userData.adminVerified === true;

            if (!isVerified) {
                await auth.signOut();
                toast({
                    title: "Email Not Verified",
                    description: "Please verify your email to log in, or contact support if the issue persists.",
                    variant: "destructive"
                });
                setIsLoading(false);
                return;
            }

            toast({ title: "Login Successful", description: "Welcome back!" })
            router.push('/dashboard')
        } catch (error: any) {
            console.error("Login error:", error)
            toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                 await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: user.displayName,
                    email: user.email,
                    phone: user.phoneNumber,
                    createdAt: new Date(),
                    balance: 0,
                    status: 'Active',
                    role: 'User',
                    emailVerified: user.emailVerified,
                    adminVerified: true,
                });
                toast({ title: "Account Created", description: "Welcome! Your account has been created." })
            } else {
                toast({ title: "Login Successful", description: "Welcome back!" })
            }

            router.push('/dashboard')
        } catch (error: any) {
            console.error("Google login error:", error)
             let errorMessage = "Could not sign in with Google. Please try again.";
            if (error.code === 'auth/unauthorized-domain') {
                errorMessage = "This domain is not authorized for Google Sign-In. Please contact support."
            }
            toast({ title: "Google Sign-in Failed", description: errorMessage, variant: "destructive" })
        } finally {
            setIsGoogleLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" });
            return;
        }
        setIsResetting(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast({ title: "Password Reset Email Sent", description: "Please check your inbox to reset your password." });
            setIsDialogOpen(false);
            setResetEmail("");
        } catch (error: any) {
            console.error("Password reset error:", error);
            let message = "Could not send password reset email. Please try again.";
            if (error.code === 'auth/user-not-found') {
                message = "No user found with this email address.";
            }
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setIsResetting(false);
        }
    }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in overflow-hidden">
      <ParticlesBackground variant="default" />
      <Card className="w-full max-w-sm mx-4 z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Wallet className="w-10 h-10 text-primary"/>
            </div>
          <CardTitle className="text-2xl font-headline">Welcome to BPX Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2 relative">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="link" type="button" className="text-xs p-0 h-auto">Forgot password?</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Your Password</DialogTitle>
                                <DialogDescription>
                                    Enter your email address below and we&apos;ll send you a link to reset your password.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                     <Label htmlFor="reset-email">Email</Label>
                                    <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                                </div>
                                <Button onClick={handlePasswordReset} disabled={isResetting}>
                                    {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mail className="mr-2 h-4 w-4" />}
                                    Send Reset Link
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <Input id="password" type={showPassword ? "text" : "password"} required />
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
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
         <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
                 {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Sign in with Google
            </Button>
            </CardContent>
        </form>
        <CardFooter className="text-sm flex flex-col items-start gap-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </p>
          <p>
            Admin?{" "}
            <Link href="/admin/login" className="underline text-primary">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
