
"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import React from "react";
import Image from "next/image";
import { AppLogo } from "@/components/app-logo";
import { PhoneMockup, FeatureHotspot } from "@/components/phone-mockup";
import { Home, Users, Phone, HelpCircle, UserPlus, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';

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
    image: "/images/deposit_guide.png",
    dataAiHint: "app deposit screen",
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
    image: "/images/withdraw_guide.png",
    dataAiHint: "app withdraw screen",
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

const navLinks = [
    { href: "/", name: "Home", icon: Home },
    { href: "/about-us", name: "About Us", icon: Users },
    { href: "/contact-us", name: "Contact", icon: Phone },
    { href: "/#faq", name: "FAQs", icon: HelpCircle },
];

const SiteHeader = () => {
    const pathname = usePathname();
    const activeLink = navLinks.find(link => link.href === pathname) || navLinks[0];

    return (
        <header className="absolute top-0 left-0 w-full z-50 animate-fade-in">
            <div className="h-[20px] bg-primary" />
            <div className="bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between h-20 px-[5%]">
                    <Link href="/" aria-label="Back to homepage">
                        <AppLogo className="h-10 w-auto" />
                    </Link>

                    <nav className="hidden md:flex items-center h-full">
                        <ul className="flex items-center h-full">
                            {navLinks.map((link) => {
                                const isActive = link.href === activeLink?.href;
                                return (
                                    <li key={link.name} className="h-full">
                                        <Link href={link.href} className="relative flex flex-col items-center justify-center h-full px-5 text-sm font-medium transition-colors text-white/70 hover:text-white">
                                            <div className="relative flex flex-col items-center justify-center gap-1.5 pb-2">
                                                {isActive && (
                                                    <div
                                                        className="absolute -top-7 w-20 h-16 bg-primary"
                                                        style={{
                                                            borderRadius: '0 0 40px 40px',
                                                        }}
                                                    />
                                                )}
                                                <div className="relative z-10">
                                                    <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                                                </div>
                                                <span className={cn("relative z-10", { "text-white": isActive })}>{link.name}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors">
                           <LogIn className="h-4 w-4" /> Login
                        </Link>
                        <Link href="/signup" className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                           <UserPlus className="h-4 w-4" /> Register
                        </Link>
                    </div>

                    <div className="md:hidden">
                       <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">
                           Login
                       </Link>
                   </div>
                </div>
            </div>
        </header>
    );
};


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
    <div className="flex flex-col min-h-dvh bg-[#0c0a18] text-white font-body">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full h-screen lg:h-auto lg:aspect-[16/8] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
             <Carousel setApi={setApi} className="w-full h-full" loop>
                <CarouselContent>
                    {sliderItems.map((slide, index) => (
                        <CarouselItem key={index}>
                           <div className="w-full h-full pt-32 pb-24 md:py-40">
                             <div className="container h-full">
                                <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
                                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-fade-in-up">
                                        <h1 className="text-4xl lg:text-6xl font-headline font-bold text-white tracking-tighter">
                                            {slide.title}
                                        </h1>
                                        <p className="text-lg text-white/70 max-w-md">
                                            {slide.description}
                                        </p>
                                    </div>

                                    <div className="relative flex justify-center items-center h-[50vh] md:h-[60vh] lg:h-full">
                                        <PhoneMockup>
                                            <Image src={slide.image} alt={slide.alt} width={380} height={823} data-ai-hint={slide.dataAiHint || "app screenshot"} className="w-full h-full object-cover" />
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
                        className={`w-2 h-2 rounded-full transition-all ${current === index ? 'w-6 bg-primary' : 'bg-white/50'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                    ))}
                </div>
            </Carousel>
        </section>
      </main>
    </div>
  );
}
