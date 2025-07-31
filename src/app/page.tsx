
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
import { HardDrive, Smartphone, Apple, Star, Send, Headphones } from 'lucide-react';
import { cn } from "@/lib/utils";
import { IPhoneMockup } from "@/components/iphone-mockup";

const sliderItems = [
  {
    screen: "/images/dashboard.png",
    alt: "Dashboard Screenshot",
    features: [
      {
        Icon: HardDrive,
        title: "Pure CSS Devices",
        description: "All showcase devices are made by pure CSS and 100% Retina ready.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: Smartphone,
        title: "Full Responsive",
        description: "Build on Bootstrap with powerful Responsiveness.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
      {
        Icon: Apple,
        title: "Retina Ready",
        description: "Retina ready with Pure CSS devices and Font icons.",
        position: { top: "75%", left: "15%" },
        align: "right"
      },
      {
        Icon: Star,
        title: "Many Showcase Styles",
        description: "4 Awesome Showcase styles, you can do unlimited showcase.",
        position: { top: "35%", right: "15%" },
        align: "left"
      },
      {
        Icon: Send,
        title: "Unlimited Purposes",
        description: "Show your apps, your team, your store... It's unlimited.",
        position: { top: "55%", right: "15%" },
        align: "left"
      },
      {
        Icon: Headphones,
        title: "Premium Support",
        description: "Ask us everything and you will get the best answers.",
        position: { top: "75%", right: "15%" },
        align: "left"
      },
    ],
  },
  {
    screen: "/images/deposit_guide.png",
    alt: "Deposit Page Screenshot",
    features: [
       {
        Icon: HardDrive,
        title: "Secure Deposits",
        description: "Fund your account with confidence using our secure system.",
        position: { top: "35%", left: "15%" },
        align: "right"
      },
      {
        Icon: Smartphone,
        title: "Easy Proof Upload",
        description: "Upload your payment proof with a single tap.",
        position: { top: "55%", left: "15%" },
        align: "right"
      },
       {
        Icon: Star,
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
    screen: "/images/withdraw_guide.png",
    alt: "Withdrawal Page Screenshot",
    features: [
      {
        Icon: Apple,
        title: "Simple Withdrawal Form",
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
        Icon: Star,
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
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
     <main className="w-full min-h-screen bg-[#0c0a18] text-white overflow-hidden">
        <Image 
            src="/images/sliderhero.jpg"
            alt="Mountain background"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            priority
        />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center py-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-in-up">AWESOME MOBILE APP</h1>
            <p className="mt-4 text-white/70 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>An awesome theme for App landing and App Store site</p>
            <div className="mt-8 flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    <Apple className="mr-2 h-5 w-5"/> AppStore
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 20.5V3.5C3 2.67 3.67 2 4.5 2H19.5C20.33 2 21 2.67 21 3.5V20.5C21 21.33 20.33 22 19.5 22H4.5C3.67 22 3 21.33 3 20.5ZM8.56 12L15.44 8.03L12 12L15.44 15.97L8.56 12Z" />
                    </svg>
                    Google Play
                </Button>
            </div>
            
            <div className="relative w-full flex-1 flex items-center justify-center mt-8">
                <Carousel setApi={setApi} className="w-full max-w-7xl">
                    <CarouselContent>
                        {sliderItems.map((slide, index) => (
                            <CarouselItem key={index}>
                                <div className="relative flex justify-center items-center h-[500px] lg:h-[600px]">
                                    <IPhoneMockup>
                                        <Image
                                            src={slide.screen}
                                            alt={slide.alt}
                                            width={380}
                                            height={823}
                                            className={cn("w-full h-full object-cover transition-opacity duration-700", current === index ? 'opacity-100' : 'opacity-20')}
                                        />
                                    </IPhoneMockup>
                                    
                                    {/* Feature Hotspots */}
                                    {slide.features.map((feature, i) => (
                                        <FeatureHotspot key={i} feature={feature} isActive={current === index} />
                                    ))}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
     </main>
  );
}
