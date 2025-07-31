
"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, Phone, MapPin, Loader2, Search, Globe } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SiteHeader = () => (
     <header className="absolute top-0 z-50 w-full animate-fade-in">
        <div className="container mx-auto flex items-center justify-between p-4 bg-black/20 text-white rounded-b-lg">
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
                <AppLogo className="h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-center group" prefetch={false}>
                        <span className="text-sm font-semibold tracking-wider group-hover:text-primary transition-colors">HOME</span>
                        <p className="text-xs text-white/70">Showcase</p>
                    </Link>
                    <Link href="/#features" className="text-center group" prefetch={false}>
                        <span className="text-sm font-semibold tracking-wider group-hover:text-primary transition-colors">FEATURES</span>
                        <p className="text-xs text-white/70">Our Best</p>
                    </Link>
                    <Link href="/about-us" className="text-center group" prefetch={false}>
                        <span className="text-sm font-semibold tracking-wider group-hover:text-primary transition-colors">ABOUT US</span>
                        <p className="text-xs text-white/70">Our Story</p>
                    </Link>
                    <Link href="/contact-us" className="text-center group" prefetch={false}>
                        <span className="text-sm font-semibold tracking-wider text-primary transition-colors">CONTACT</span>
                        <p className="text-xs text-white/70">Get in Touch</p>
                    </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4">
                 <button className="group">
                    <Globe className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                </button>
                <button className="group">
                    <Search className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                </button>
                <Link href="/login" className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">
                    Login
                </Link>
            </div>
             <div className="md:hidden">
                <Link href="/login" className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">
                    Login
                </Link>
            </div>
        </div>
    </header>
)

export default function ContactUsPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Message Sent!",
                description: "Thank you for contacting us. We'll get back to you shortly.",
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    }

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <SiteHeader />
      <main className="flex-1 animate-fade-in pt-20">
        <div className="relative w-full py-20 md:py-24 lg:py-32 overflow-hidden">
             <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg-neutral-200/40 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]"></div>
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                            Get in Touch
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                           We're here to help. Contact us with any questions or feedback.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <section className="w-full pb-12 md:pb-24 lg:pb-32 -mt-16">
            <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
                <Card className="p-2 border-2 border-transparent [background:padding-box,linear-gradient(120deg,hsl(var(--card)),hsl(var(--primary)/0.2),hsl(var(--card)))_border-box]">
                    <CardHeader>
                        <CardTitle className="font-headline">Contact Form</CardTitle>
                        <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Deposit Issue" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" required />
                            </div>
                             <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="flex flex-col justify-center space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary"><Mail className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">Email</h3>
                            <p className="text-muted-foreground">For general inquiries and support.</p>
                            <a href="mailto:support@bpxmaster.com" className="text-primary hover:underline">support@bpxmaster.com</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary"><Phone className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">Phone</h3>
                            <p className="text-muted-foreground">Available during business hours (9am-5pm).</p>
                            <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-890</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary"><MapPin className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold">Office</h3>
                            <p className="text-muted-foreground">123 Finance Street, Innovation City, 45678</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
                        <AppLogo className="h-10 w-auto" />
                    </Link>
                    <p className="text-sm text-muted-foreground">Your Portal to Effortless Finance.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Company</h4>
                    <Link href="/about-us" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>About Us</Link>
                    <Link href="/contact-us" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Contact Us</Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Legal</h4>
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Terms of Service</Link>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Privacy Policy</Link>
                    <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Refund Policy</Link>
                </div>
                 <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Support</h4>
                    <Link href="/#faq" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>FAQ</Link>
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>My Account</Link>
                </div>
            </div>
             <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t pt-6">
                <p className="text-xs text-muted-foreground">&copy; 2024 BPX Master. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-2 md:mt-0">
                    Developed by <a href="https://beta-tech.solutions" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary underline underline-offset-4">Beta Tech Solutions</a>.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
