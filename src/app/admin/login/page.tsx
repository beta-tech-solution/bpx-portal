
"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase/config"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useAuthState } from "react-firebase-hooks/auth"
import ParticlesBackground from "@/components/particles-background"

export default function AdminLoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [user, loading] = useAuthState(auth)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!loading && user) {
            const userDocRef = doc(db, 'users', user.uid)
            getDoc(userDocRef).then(userDoc => {
                if (userDoc.exists() && userDoc.data().role === 'Admin') {
                    router.push('/admin/dashboard')
                }
            })
        }
    }, [user, loading, router])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().role === 'Admin') {
                toast({ title: "Login Successful", description: "Welcome, Admin!" })
                router.push('/admin/dashboard')
            } else {
                 await auth.signOut();
                 toast({ title: "Access Denied", description: "You are not authorized to access this panel.", variant: "destructive" })
            }
        } catch (error: any) {
            console.error("Admin login error:", error)
            toast({ title: "Login Failed", description: "Invalid credentials or not an admin account.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    if(loading) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background overflow-hidden">
        <ParticlesBackground variant="admin" />
      <Card className="w-full max-w-sm mx-4 z-10 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Shield className="w-10 h-10 text-primary"/>
            </div>
          <CardTitle className="text-2xl font-headline">Admin Panel Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
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
            </CardContent>
        </form>
      </Card>
    </div>
  )
}
