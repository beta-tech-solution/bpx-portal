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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import ParticlesBackground from "@/components/particles-background"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        await auth.signOut()
        toast({ title: "Login Failed", description: "User profile not found.", variant: "destructive" })
        setIsLoading(false)
        return
      }

      const userData = userDoc.data()

      if (userData.role === "Admin") {
        toast({ title: "Admin Login Successful", description: "Welcome back!" })
        router.push("/admin/dashboard")
        return
      }

      const isVerified = user.emailVerified || userData.adminVerified === true

      if (!isVerified) {
        await auth.signOut()
        toast({
          title: "Email Not Verified",
          description: "Please verify your email to log in, or contact support if the issue persists.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({ title: "Login Successful", description: "Welcome back!" })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" })
      return
    }
    setIsResetting(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast({ title: "Password Reset Email Sent", description: "Please check your inbox to reset your password." })
      setIsDialogOpen(false)
      setResetEmail("")
    } catch (error: any) {
      console.error("Password reset error:", error)
      let message = "Could not send password reset email. Please try again."
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email address."
      }
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in overflow-hidden">
      <ParticlesBackground variant="default" />
      <Card className="w-full max-w-sm mx-4 z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome to BPX Portal</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
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
                    <Button variant="link" type="button" className="text-xs p-0 h-auto">
                      Forgot password?
                    </Button>
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
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <Button onClick={handlePasswordReset} disabled={isResetting}>
                        {isResetting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
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
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
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
