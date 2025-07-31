
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
import { Wallet, Landmark, Smartphone, Apple, Star, Send, Headphones, DollarSign, ShieldCheck, TrendingUp, UploadCloud, Eye, Activity, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { IPhoneMockup } from "@/components/iphone-mockup";
import { SiteHeader } from "@/components/site-header";

const sliderItems = [
  {
    title: "All-in-One Dashboard",
    description: "Your complete financial overview in one place.",
    screen: "/images/dashboard.png",
    alt: "Dashboard Screenshot",
    features: [
      {
        Icon: Wallet,
        title: "Live Balance",
        description: "See your current account balance updated in real-time.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: TrendingUp,
        title: "Deposit Trends",
        description: "Track your deposit history with our intuitive charts.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
      {
        Icon: TrendingDown,
        title: "Withdrawal History",
        description: "Monitor your withdrawal patterns and history.",
        position: { top: "75%", left: "15%" },
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
    title: "Effortless Deposits",
    description: "Fund your account quickly and securely.",
    screen: "/images/deposit_guide.png",
    alt: "Deposit Page Screenshot",
    features: [
       {
        Icon: Landmark,
        title: "Multiple Banks",
        description: "Deposit using various trusted local bank accounts.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: UploadCloud,
        title: "Easy Proof Upload",
        description: "Upload your payment proof with a single tap.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
       {
        Icon: Eye,
        title: "Track Your Status",
        description: "Know exactly when your funds are approved and available.",
        position: { top: "45%", right: "15%" },
        align: "left"
      },
       {
        Icon: Send,
        title: "Fast Processing",
        description: "Our admin team reviews and approves deposits quickly.",
        position: { top: "65%", right: "15%" },
        align: "left"
      },
    ],
  },
  {
    title: "Simple Withdrawals",
    description: "Access your funds whenever you need them.",
    screen: "/images/withdraw_guide.png",
    alt: "Withdrawal Page Screenshot",
    features: [
      {
        Icon: DollarSign,
        title: "Quick Request Form",
        description: "Easily request funds to be sent to your bank account.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: Headphones,
        title: "Multi-language Instructions",
        description: "Clear instructions in both English and Urdu.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
       {
        Icon: Send,
        title: "Direct to Bank",
        description: "Your funds are sent directly to your provided account details.",
        position: { top: "45%", right: "15%" },
        align: "left"
      },
       {
        Icon: ShieldCheck,
        title: "Reliable & Secure",
        description: "All withdrawal requests are handled with security as a priority.",
        position: { top: "65%", right: "15%" },
        align: "left"
      },
    ],
  },
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
            className={cn("absolute hidden lg:flex items-center group", isActive ? 'animate-fade-in' : 'opacity-0')}
            style={{ ...position, animationDelay: '0.5s' }}
        >
            <div className={cn("relative flex items-center", align === 'left' ? 'flex-row' : 'flex-row-reverse')}>
                {/* Dot */}
                <div className="w-5 h-5 flex items-center justify-center">
                    <div className={cn("absolute w-3 h-3 rounded-full bg-rose-500", isActive && 'animate-pulsing-dot')} />
                </div>
                
                {/* Line */}
                <div className={cn("relative w-16 h-px bg-white/30", align === 'left' ? 'ml-2' : 'mr-2')}>
                    <div className={cn("absolute top-0 h-px bg-rose-500", align === 'left' ? 'left-0' : 'right-0', isActive && 'animate-draw-line')} />
                </div>

                {/* Content */}
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
    
    // Autoplay functionality
    const interval = setInterval(() => {
        if (api.canScrollNext()) {
            api.scrollNext();
        } else {
            api.scrollTo(0);
        }
    }, 5000); // Change slide every 5 seconds

    return () => {
        api.off("select", onSelect);
        clearInterval(interval);
    };

  }, [api]);

  return (
    <div className="w-full min-h-screen bg-[#0c0a18] text-white overflow-x-hidden">
        <SiteHeader />
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center pt-32 md:pt-40">
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
                             <CarouselItem key={index}>
                                <div className="flex flex-col items-center justify-center h-full py-8">
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in-up">{slide.title}</h1>
                                    <p className="mt-4 text-white/70 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>{slide.description}</p>
                                    <div className="mt-8 flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white w-36">
                                            <Apple className="mr-2 h-5 w-5"/> AppStore
                                        </Button>
                                         <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white w-36">
                                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 20.5V3.5C3 2.67 3.67 2 4.5 2H19.5C20.33 2 21 2.67 21 3.5V20.5C21 21.33 20.33 22 19.5 22H4.5C3.67 22 3 21.33 3 20.5ZM8.56 12L15.44 8.03L12 12L15.44 15.97L8.56 12Z" />
                                            </svg>
                                            Google Play
                                        </Button>
                                    </div>

                                     <div className="relative w-full flex items-center justify-center mt-8 h-[500px] lg:h-[600px]">
                                        <IPhoneMockup>
                                            <Image
                                                src={slide.screen}
                                                alt={slide.alt}
                                                width={380}
                                                height={823}
                                                className={cn("w-full h-full object-cover transition-opacity duration-700", current === index ? 'opacity-100' : 'opacity-0')}
                                                priority={index === 0}
                                            />
                                        </IPhoneMockup>
                                        
                                        {/* Feature Hotspots */}
                                        {slide.features.map((feature, i) => (
                                            <FeatureHotspot key={i} feature={feature} isActive={current === index} />
                                        ))}
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </main>
    </div>
  );
}
