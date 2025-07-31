
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, DollarSign, Landmark, Download } from 'lucide-react';
import Image from "next/image";
import AppLogo from "@/components/app-logo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import React from "react";
import { PhoneMockup, FeatureHotspot } from "@/components/phone-mockup";

const sliderItems = [
  {
    image: "/images/dashboard.png",
    alt: "Dashboard Screenshot",
    title: "All-in-One Dashboard",
    description: "Get a complete overview of your finances at a glance. Track deposits, withdrawals, and performance with our intuitive dashboard.",
    hotspots: [
      { top: "15%", left: "80%", title: "Real-time Balance" },
      { top: "35%", left: "10%", title: "Total Deposits" },
      { top: "70%", left: "85%", title: "Deposit History" },
    ]
  },
  {
    image: "https://placehold.co/380x823.png",
    alt: "Deposit Page Screenshot",
    title: "Effortless Deposits",
    description: "Fund your account in just a few simple steps. Our secure process ensures your money is safe and credited quickly.",
     hotspots: [
      { top: "20%", left: "10%", title: "Enter Amount" },
      { top: "45%", left: "88%", title: "Bank Details" },
      { top: "75%", left: "5%", title: "Upload Proof" },
    ]
  },
   {
    image: "https://placehold.co/380x823.png",
    alt: "Withdrawal Page Screenshot",
    title: "Secure Withdrawals",
    description: "Access your funds when you need them. Request withdrawals directly to your bank account with complete peace of mind.",
     hotspots: [
      { top: "25%", left: "88%", title: "Request Amount" },
      { top: "50%", left: "10%", title: "Enter Bank Info" },
      { top: "80%", left: "90%", title: "Submit Request" },
    ]
  }
];


export default function LandingPage() {
   const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
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
                <Download className="mr-2 h-4 w-4" /> Get Started
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
        <section className="relative w-full h-[calc(100vh-4rem)] lg:h-auto lg:aspect-[16/8] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
             <Carousel setApi={setApi} className="w-full h-full" loop>
                <CarouselContent>
                    {sliderItems.map((slide, index) => (
                        <CarouselItem key={index}>
                           <div className="w-full h-full lg:h-auto lg:aspect-[16/8] pt-12 pb-24 md:py-20 lg:py-24">
                             <div className="container h-full">
                                <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
                                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-fade-in-up">
                                        <h1 className="text-4xl lg:text-6xl font-headline font-bold text-foreground tracking-tighter">
                                            {slide.title}
                                        </h1>
                                        <p className="text-lg text-muted-foreground max-w-md">
                                            {slide.description}
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button size="lg" asChild>
                                                <Link href="/signup">Download App</Link>
                                            </Button>
                                             <Button size="lg" variant="outline" asChild>
                                                <Link href="#features">Learn More</Link>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative flex justify-center items-center h-[50vh] md:h-[60vh] lg:h-full">
                                        <PhoneMockup>
                                            <Image src={slide.image} alt={slide.alt} width={380} height={823} data-ai-hint="app screenshot" className="w-full h-full object-cover" />
                                            {slide.hotspots.map((hotspot, i) => (
                                                <FeatureHotspot key={i} top={hotspot.top} left={hotspot.left} title={hotspot.title} />
                                            ))}
                                        </PhoneMockup>
                                    </div>
                                </div>
                            </div>
                           </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {sliderItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-all ${current === index ? 'w-6 bg-primary' : 'bg-muted-foreground/50'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                    ))}
                </div>
            </Carousel>
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
                   <Image src="/images/deposit_guide.png" data-ai-hint="app deposit screen" alt="Deposit Screen" width={280} height={500} className="rounded-2xl shadow-lg" />
               </div>
            </div>
            
             <div className="mx-auto grid max-w-5xl items-center gap-12 py-12 lg:grid-cols-2 lg:gap-16">
               <div className="relative w-full max-w-[280px] mx-auto lg:order-last">
                  <Image src="/images/withdraw_guide.png" data-ai-hint="app withdraw screen" alt="Withdraw Screen" width={280} height={500} className="rounded-2xl shadow-lg" />
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

    