"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Wallet } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would add your Firebase signup logic
        // On success, navigate to the dashboard
        router.push('/dashboard')
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
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
                    <Input id="full-name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
