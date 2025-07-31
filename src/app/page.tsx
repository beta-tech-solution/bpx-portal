
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import React from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
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
