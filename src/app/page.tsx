
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, DollarSign, Send, Landmark, Smartphone, Tablet } from 'lucide-react';
import Image from "next/image";
import AppLogo from "@/components/app-logo";

function AnimatedScreen({ src, alt }: { src: string; alt: string; }) {
  return (
    <div className="relative aspect-[9/16] w-full h-full rounded-2xl overflow-hidden bg-gray-800">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={src}
      >
        {alt}
      </video>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center gap-2 font-bold" prefetch={false}>
            <AppLogo className="w-8 h-8 text-primary" />
            <span className="font-headline text-lg">BPX Master</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              prefetch={false}
            >
              Login
            </Link>
            <Button asChild>
              <Link href="/signup" prefetch={false}>
                Sign Up
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Seamless Financial Management for BPExch
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your one-stop portal for effortless deposits, transfers, and withdrawals. Secure, fast, and reliable.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup" prefetch={false}>
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x600.png"
                width="600"
                height="600"
                data-ai-hint="financial technology abstract"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need in One Place</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is designed to make your financial interactions with BPExch as smooth as possible.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary"><DollarSign className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold font-headline">Easy Deposits</h3>
                </div>
                <p className="text-muted-foreground">
                  Quickly add funds to your account. Upload your proof of payment and let our admins handle the rest.
                </p>
              </div>
               <div className="relative w-full max-w-md mx-auto">
                 <Smartphone className="w-full h-auto text-gray-800" />
                 <div className="absolute inset-0 m-[calc(5%)] mb-[calc(6%)] rounded-xl overflow-hidden">
                    <AnimatedScreen src="https://cdn.dribbble.com/users/412235/screenshots/4737248/crypto-wallet-app.mp4" alt="Deposit screen animation" />
                 </div>
              </div>
            </div>
             <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
               <div className="relative w-full max-w-lg mx-auto lg:order-last">
                 <Tablet className="w-full h-auto text-gray-800" />
                 <div className="absolute inset-0 m-[calc(6%)] rounded-xl overflow-hidden">
                    <AnimatedScreen src="https://cdn.dribbble.com/users/10946/screenshots/14717467/media/13c7886a1437d2e0555d7a2283a546a2.mp4" alt="Transfer screen animation" />
                 </div>
               </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary"><Send className="w-6 h-6" /></div>
                    <h3 className="text-xl font-bold font-headline">Instant Transfers</h3>
                </div>
                <p className="text-muted-foreground">
                  Move funds from your portal wallet to your BPExch account in just a few clicks. It's fast and secure.
                </p>
              </div>
            </div>
             <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary"><Landmark className="w-6 h-6" /></div>
                    <h3 className="text-xl font-bold font-headline">Secure Withdrawals</h3>
                </div>
                <p className="text-muted-foreground">
                  Request withdrawals to your bank account. Our team processes requests promptly and securely.
                </p>
              </div>
               <div className="relative w-full max-w-md mx-auto">
                 <Smartphone className="w-full h-auto text-gray-800" />
                 <div className="absolute inset-0 m-[calc(5%)] mb-[calc(6%)] rounded-xl overflow-hidden">
                    <AnimatedScreen src="https://cdn.dribbble.com/users/412235/screenshots/4819717/crypto-wallet-app-2.mp4" alt="Withdrawal screen animation" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Frequently Asked Questions</h2>
                 <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about our platform.
                </p>
            </div>
            <div className="mx-auto mt-8 max-w-3xl">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is this platform secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we prioritize security. All data is encrypted, and we use secure protocols for all transactions and user information.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How long do deposits take to confirm?</AccordionTrigger>
                  <AccordionContent>
                    Deposits are typically reviewed and confirmed by our admin team within a few hours. You will be notified once the funds are credited to your account.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                  <AccordionTrigger>What are the withdrawal processing times?</AccordionTrigger>
                  <AccordionContent>
                    Withdrawal requests are processed within 24-48 business hours. The time it takes for funds to appear in your bank account may vary depending on your bank.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger>Can I use this service on my mobile device?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. Our web platform is fully responsive and designed to work seamlessly across all devices, including desktops, tablets, and smartphones.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-muted">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Get Started?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Create an account today and take control of your funds with ease.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full">
                    <Link href="/signup" prefetch={false}>
                        Sign Up Now
                    </Link>
                </Button>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 BPX Master. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

    