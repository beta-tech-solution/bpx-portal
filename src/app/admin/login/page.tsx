
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { auth } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

        try {
            // A simple check to only allow the master admin email
            if (email !== 'admin@bpxmaster.com') {
                 toast({ title: "Access Denied", description: "You are not authorized to access this panel.", variant: "destructive" })
                 setIsLoading(false)
                 return
            }

            await signInWithEmailAndPassword(auth, email, password)
            toast({ title: "Login Successful", description: "Welcome, Admin!" })
            router.push('/admin/dashboard')
        } catch (error: any) {
            console.error("Admin login error:", error)
            toast({ title: "Login Failed", description: "Invalid credentials. Please try again.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
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
                <Input id="email" type="email" placeholder="admin@bpxmaster.com" required defaultValue="admin@bpxmaster.com" />
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
