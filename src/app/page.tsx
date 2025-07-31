
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, DollarSign, Landmark } from 'lucide-react';
import Image from "next/image";
import AppLogo from "@/components/app-logo";

function AnimatedScreen({ src, alt }: { src: string; alt: string; }) {
  return (
    <div className="relative aspect-[9/16] w-full h-full rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={src}
      >
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
            <AppLogo className="w-8 h-8 text-primary" />
            <span className="font-headline text-lg">BPX Master</span>
          </Link>
          <nav className="ml-auto hidden md:flex items-center gap-6">
             <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" prefetch={false}>
                Features
            </Link>
             <Link href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" prefetch={false}>
                FAQs
            </Link>
             <Link href="/about-us" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" prefetch={false}>
                About Us
            </Link>
             <Link href="/contact-us" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" prefetch={false}>
                Contact Us
            </Link>
            <Button asChild>
              <Link href="/signup" prefetch={false}>
                Get Started
              </Link>
            </Button>
          </nav>
           <nav className="ml-auto flex md:hidden items-center">
             <Button asChild>
              <Link href="/login" prefetch={false}>
                Login
              </Link>
            </Button>
           </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
           <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg-neutral-200/40 [mask-image:radial-gradient(ellipse_at_50%_50%,_white_20%,_transparent_75%)]"></div>

          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Your Portal to Effortless Finance.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Experience seamless financial management with BPX Master. A secure, intuitive platform for your deposits, withdrawals, and BPExch account interactions.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup" prefetch={false}>
                      Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                     <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                     <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                    <Image
                      src="https://placehold.co/600x600.png"
                      width="600"
                      height="600"
                      data-ai-hint="futuristic finance app dashboard"
                      alt="Hero Image"
                      className="relative mx-auto aspect-square overflow-hidden rounded-2xl object-cover shadow-2xl"
                    />
                  </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Guided Tour of Your Finances</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See how simple it is to manage your funds. Our visual guides walk you through every step of the process.
              </p>
            </div>
            
            <div className="mx-auto grid max-w-5xl items-center gap-12 py-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary"><DollarSign className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline">1. Effortless Deposits</h3>
                    <p className="text-muted-foreground mt-2">
                      Funding your account is straightforward. Enter the amount, use the provided bank details, and upload your payment proof. We'll handle the verification swiftly.
                    </p>
                  </div>
                </div>
              </div>
               <div className="relative w-full max-w-[280px] mx-auto">
                  <AnimatedScreen src="https://cdn.dribbble.com/users/412235/screenshots/4737248/crypto-wallet-app.mp4" alt="Deposit screen animation" />
               </div>
            </div>
            
             <div className="mx-auto grid max-w-5xl items-center gap-12 py-12 lg:grid-cols-2 lg:gap-16">
               <div className="relative w-full max-w-[280px] mx-auto lg:order-last">
                  <AnimatedScreen src="https://cdn.dribbble.com/users/412235/screenshots/4819717/crypto-wallet-app-2.mp4" alt="Withdrawal screen animation" />
               </div>
              <div className="flex flex-col justify-center space-y-4">
                 <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary"><Landmark className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-2xl font-bold font-headline">2. Secure Withdrawals</h3>
                    <p className="text-muted-foreground mt-2">
                     Need your funds? Request a withdrawal to your personal bank account. Our system ensures your details are secure and transactions are processed promptly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
                 <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about our platform.
                </p>
            </div>
            <div className="mx-auto mt-12 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is this platform secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, absolutely. We prioritize your security above all else. All data is encrypted, we use secure protocols for all transactions, and our platform is built on modern, robust infrastructure.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How long do deposits take to confirm?</AccordionTrigger>
                  <AccordionContent>
                    Deposits are typically reviewed and confirmed by our admin team within a few business hours. You will receive a notification as soon as the funds are credited to your account.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                  <AccordionTrigger>What are the withdrawal processing times?</AccordionTrigger>
                  <AccordionContent>
                    Withdrawal requests are processed within 24-48 business hours. The time it takes for funds to appear in your bank account may vary slightly depending on your bank's processing times.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger>Can I use this service on my mobile device?</AccordionTrigger>
                  <AccordionContent>
                    Of course. Our web platform is fully responsive and designed to work seamlessly across all devices, including desktops, tablets, and smartphones, ensuring a consistent experience everywhere.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Elevate Your Financial Experience?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Create an account today and take control of your funds with unparalleled ease and security.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full">
                    <Link href="/signup" prefetch={false}>
                        Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                </div>
            </div>
        </section>
      </main>
       <footer className="border-t">
        <div className="container py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link href="#" className="flex items-center gap-2 font-bold" prefetch={false}>
                        <AppLogo className="w-8 h-8 text-primary" />
                        <span className="font-headline text-lg">BPX Master</span>
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
                    <Link href="#faq" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>FAQ</Link>
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
