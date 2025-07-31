
"use client";

import { AppLogo } from "@/components/app-logo";
import { Users, Target, Eye, Rocket } from 'lucide-react';
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";


export default function AboutUsPage() {
  const timelineEvents = [
    {
      year: "2022",
      title: "The Genesis",
      description: "A team of fintech and security experts saw a need for a simpler, more secure way to manage digital asset exchanges. The BPX Master concept was born.",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      year: "2023",
      title: "Building the Foundation",
      description: "We developed our core platform, focusing on a robust security architecture and an intuitive user interface. Our goal was to eliminate complexity for the user.",
       icon: <Target className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "Launch & Growth",
      description: "BPX Master officially launched, offering seamless deposit and withdrawal services. We continue to innovate, driven by user feedback and the evolving financial landscape.",
       icon: <Users className="w-6 h-6" />
    },
     {
      year: "Future",
      title: "Vision for Tomorrow",
      description: "Our vision is to expand our services, integrating more tools and platforms to become the ultimate, all-in-one portal for digital finance management.",
       icon: <Eye className="w-6 h-6" />
    }
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <SiteHeader />
      <main className="flex-1 animate-fade-in pt-24">
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-neutral-200/40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>
             <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">Our Story</div>
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Engineering the Future of Finance.
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                           We are a team of innovators dedicated to creating secure, efficient, and user-friendly financial tools for the digital age.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
            <div className="container px-4 md:px-6">
                 <div className="mx-auto grid max-w-5xl">
                    <div className="relative">
                        {/* The vertical line */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border -translate-x-1/2 hidden sm:block"></div>
                        
                        {timelineEvents.map((event, index) => (
                             <div key={index} className="relative mb-12 pl-16 sm:pl-12">
                                <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground border-4 border-background sm:-translate-x-1/2">
                                    {event.icon}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-bold font-headline">{event.title} <span className="text-primary text-2xl ml-2">{event.year}</span></h3>
                                    <p className="mt-2 text-muted-foreground">{event.description}</p>
                                </div>
                            </div>
                        ))}
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
