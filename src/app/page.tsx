
"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Wallet, Landmark, Smartphone, Apple, Star, Send, Headphones, DollarSign, ShieldCheck, TrendingUp, UploadCloud, Eye, Activity, TrendingDown, MessageSquare, Shield, KeyRound, User, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";

const sliderItems = [
  {
    title: "All-in-One Dashboard",
    description: "Your complete financial overview in one place.",
    screen: "/images/dash.png",
    alt: "Dashboard Mockup",
    features: [
      {
        Icon: TrendingUp,
        title: "Total Deposits",
        description: "See your total approved deposits at a glance.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: TrendingDown,
        title: "Total Withdrawals",
        description: "Monitor your all-time withdrawals from your account.",
        position: { top: "50%", left: "15%" },
        align: "right"
      },
      {
        Icon: Activity,
        title: "Recent Activity",
        description: "Keep an eye on recent transactions and logins for security.",
        position: { top: "45%", right: "15%" },
        align: "left"
      },
      {
        Icon: ShieldCheck,
        title: "Secure Access",
        description: "Your financial data is protected with robust security measures.",
        position: { top: "65%", right: "15%" },
        align: "left"
      },
    ],
  },
  {
    title: "Seamless Deposits",
    description: "Easily add funds to your account with our simple deposit system.",
    screen: "/images/deposit.png",
    alt: "Deposit Page Mockup",
    features: [
      {
        Icon: DollarSign,
        title: "Enter Amount",
        description: "Quickly input the amount you wish to deposit.",
        position: { top: "25%", left: "15%" },
        align: "right"
      },
      {
        Icon: Landmark,
        title: "Bank Details",
        description: "Clear instructions and account details for your transfer.",
        position: { top: "45%", left: "15%" },
        align: "right"
      },
      {
        Icon: UploadCloud,
        title: "Proof Upload",
        description: "Securely upload your transaction proof for fast verification.",
        position: { top: "65%", right: "15%" },
        align: "left"
      },
    ],
  },
    {
    title: "Effortless Withdrawals",
    description: "Request withdrawals to your bank account with just a few clicks.",
    screen: "/images/withdraw.png",
    alt: "Withdraw Page Mockup",
    features: [
      {
        Icon: Wallet,
        title: "Total Withdrawn",
        description: "Track your all-time approved withdrawals.",
        position: { top: "30%", left: "15%" },
        align: "right"
      },
      {
        Icon: Landmark,
        title: "Your Bank Info",
        description: "Fill in your bank details for a secure transfer.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
      {
        Icon: Send,
        title: "Submit Request",
        description: "Your withdrawal request is sent to admins for approval.",
        position: { top: "75%", right: "15%" },
        align: "left"
      },
    ],
  },
  {
    title: "Secure BPExch Login",
    description: "Access your BPExch account safely, with all attempts logged.",
    screen: "/images/bpexchlogin.png",
    alt: "BPExch Login Mockup",
    features: [
        {
            Icon: KeyRound,
            title: "Your Credentials",
            description: "Admin-provided username and password for BPExch.",
            position: { top: "45%", right: "10%" },
            align: "left"
        },
        {
            Icon: Shield,
            title: "Block Suspicious IPs",
            description: "Instantly block any unrecognized IP address from your history.",
            position: { top: "70%", right: "10%" },
            align: "left"
        },
        {
            Icon: Activity,
            title: "Login History",
            description: "Review all login attempts to your account for enhanced security.",
            position: { top: "60%", left: "10%" },
            align: "right"
        }
    ]
  },
  {
    title: "Instant Support Chat",
    description: "Get your questions answered in real-time by our support team.",
    screen: "/images/chat.png",
    alt: "Chat Mockup",
    features: [
        {
            Icon: User,
            title: "Admin Support",
            description: "Chat directly with our support staff for assistance.",
            position: { top: "25%", left: "10%" },
            align: "right"
        },
        {
            Icon: FileText,
            title: "File Sharing",
            description: "Easily share images and documents for clearer communication.",
            position: { top: "75%", left: "10%" },
            align: "right"
        },
        {
            Icon: Send,
            title: "Real-time Messaging",
            description: "Instant message delivery for a seamless conversation flow.",
            position: { top: "85%", right: "10%" },
            align: "left"
        }
    ]
  }
];

const FeatureHotspot = ({
  feature,
  isActive,
}: {
  feature: (typeof sliderItems)[0]["features"][0];
  isActive: boolean;
}) => {
    const { Icon, title, description, position, align } = feature;

    return (
        <div
            className={cn("absolute hidden lg:flex items-center group transition-opacity duration-700", isActive ? 'opacity-100' : 'opacity-0 pointer-events-none')}
            style={{ ...position, transitionDelay: isActive ? '1.2s' : '0s' }}
        >
            <div className={cn("relative flex items-center", align === 'left' ? 'flex-row' : 'flex-row-reverse')}>
                <div className="w-5 h-5 flex items-center justify-center">
                    <div className={cn("absolute w-3 h-3 rounded-full bg-rose-500", isActive && 'animate-pulsing-dot')} />
                </div>
                
                <div className={cn("relative w-16 h-px bg-white/30", align === 'left' ? 'ml-2' : 'mr-2')}>
                    <div className={cn("absolute top-0 h-px bg-rose-500", align === 'left' ? 'left-0' : 'right-0', isActive && 'animate-draw-line')} />
                </div>

                <div className={cn("flex items-center gap-4", align === 'left' ? 'flex-row' : 'flex-row-reverse')}>
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-rose-500 bg-white/5">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className={cn("text-white", align === 'left' ? 'text-left' : 'text-right')}>
                        <h3 className="font-bold whitespace-nowrap">{title}</h3>
                        <p className="text-sm text-white/60 max-w-[200px]">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function LandingPage() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => {
        setCurrent(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    
    const interval = setInterval(() => {
        if (api.canScrollNext()) {
            api.scrollNext();
        } else {
            api.scrollTo(0);
        }
    }, 5000); // 5-second auto-slide interval

    return () => {
        api.off("select", onSelect);
        clearInterval(interval);
    };

  }, [api]);

  return (
    <div className="w-full min-h-screen bg-[#0c0a18] text-white overflow-hidden">
        <SiteHeader />
        <main className="relative z-10 flex flex-col items-center justify-center text-center pt-32 md:pt-40">
            <Image 
                src="/images/sliderhero.jpg"
                alt="Mountain background"
                layout="fill"
                objectFit="cover"
                className="opacity-20 -z-10"
                priority
            />
            
            <div className="w-full flex-1 flex flex-col items-center justify-center">
                <Carousel setApi={setApi} className="w-full max-w-7xl">
                    <CarouselContent>
                        {sliderItems.map((slide, index) => (
                             <CarouselItem key={index} className="opacity-0 transition-opacity duration-1000" style={{ ...(current === index && { opacity: 1 })}}>
                                <div className="flex flex-col items-center justify-center h-full py-8">
                                    <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight transition-all duration-700", current === index ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0')}>{slide.title}</h1>
                                    <p className={cn("mt-4 text-white/70 transition-all duration-700 delay-200", current === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>{slide.description}</p>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white w-full sm:w-[320px] transition-all duration-700 delay-300">
                                            <Apple className="mr-2 h-5 w-5"/> AppStore
                                        </Button>
                                         <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white w-full sm:w-[320px] transition-all duration-700 delay-300">
                                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 20.5V3.5C3 2.67 3.67 2 4.5 2H19.5C20.33 2 21 2.67 21 3.5V20.5C21 21.33 20.33 22 19.5 22H4.5C3.67 22 3 21.33 3 20.5ZM8.56 12L15.44 8.03L12 12L15.44 15.97L8.56 12Z" />
                                            </svg>
                                            Google Play
                                        </Button>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-full h-full flex items-center justify-center mt-24 lg:mt-32">
                        <div className="relative w-full flex items-center justify-center h-[500px] lg:h-[600px]">
                            {sliderItems.map((slide, index) => (
                                <div key={index} className={cn("absolute w-full h-full flex items-center justify-center transition-opacity duration-1000", current === index ? 'opacity-100' : 'opacity-0')}>
                                    <Image
                                        src={slide.screen}
                                        alt={slide.alt}
                                        width={800}
                                        height={600}
                                        className={cn("w-auto h-full object-contain transition-all duration-700 delay-500", current === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')}
                                        priority={index === 0}
                                    />
                                    {slide.features.map((feature, i) => (
                                        <FeatureHotspot key={i} feature={feature} isActive={current === index} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </Carousel>
            </div>
        </main>
    </div>
  );
}
