
"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Wallet, Landmark, DollarSign, Shield, TrendingUp, UploadCloud, Activity, TrendingDown, MessageSquare, KeyRound, User, FileText, Send, Lock, Zap, MessageCircle, ArrowRight, Circle, ArrowRightCircle, BarChart2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PhoneMockup } from "@/components/phone-mockup";
import Head from 'next/head';


const sliderItems = [
  {
    title: "All-in-One Dashboard",
    description: "Your complete financial overview in one place.",
    screen: "/images/dase.png",
    alt: "Dashboard Mockup",
    features: [
      {
        Icon: TrendingUp,
        title: "Member Since",
        description: "See your total journey with us at a glance.",
        position: { top: "12%", left: "5%" },
        align: "right"
      },
      {
        Icon: TrendingDown,
        title: "BPExch Credentials ",
        description: "Monitor your Login Details from your account.",
        position: { top: "37%", left: "5%" },
        align: "right"
      },
       {
        Icon: BarChart2,
        title: "Realtime Deposit History",
        description: "Your financial data is protected with robust security measures.",
        position: { top: "75%", right: "5%" },
        align: "left"
      },
    ],
  },
  {
    title: "Seamless Deposits",
    description: "Easily add funds to your account with our simple deposit system.",
    screen: "/images/depss.png",
    alt: "Deposit Page Mockup",
    features: [
      {
        Icon: DollarSign,
        title: "Enter Amount",
        description: "Quickly input the amount you wish to deposit.",
        position: { top: "15%", left: "5%" },
        align: "right"
      },
      {
        Icon: Landmark,
        title: "Bank Details",
        description: "Clear instructions and account details for your transfer.",
        position: { top: "40%", left: "5%" },
        align: "right"
      },
      {
        Icon: UploadCloud,
        title: "Proof Upload",
        description: "Securely upload your transaction proof for fast verification.",
        position: { top: "64%", right: "5%" },
        align: "left"
      },
    ],
  },
    {
    title: "Effortless Withdrawals",
    description: "Request withdrawals to your bank account with just a few clicks.",
    screen: "/images/withdd.png",
    alt: "Withdraw Page Mockup",
    features: [
      {
        Icon: Wallet,
        title: "Total Withdrawn",
        description: "Track your all-time approved withdrawals.",
        position: { top: "13%", left: "5%" },
        align: "right"
      },
      {
        Icon: Landmark,
        title: "Your Bank Info",
        description: "Fill in your bank details for a secure transfer.",
        position: { top: "55%", left: "5%" },
        align: "right"
      },
      {
        Icon: Send,
        title: "Submit Request",
        description: "Your withdrawal request is sent to admins for approval.",
        position: { top: "85%", right: "5%" },
        align: "left"
      },
    ],
  },
  {
    title: "Secure BPExch Login",
    description: "Access your BPExch account safely, with all attempts logged.",
    screen: "/images/bpexch.png",
    alt: "BPExch Login Mockup",
    features: [
        {
            Icon: KeyRound,
            title: "Your Credentials",
            description: "Admin-provided username and password for BPExch.",
            position: { top: "65%", right: "5%" },
            align: "left"
        },
        {
            Icon: Shield,
            title: "Block Suspicious IPs",
            description: "Instantly block any unrecognized IP address from your history.",
            position: { top: "20%", right: "5%" },
            align: "left"
        },
        {
            Icon: Activity,
            title: "Login History",
            description: "Review all login attempts to your account for enhanced security.",
            position: { top: "60%", left: "5%" },
            align: "right"
        }
    ]
  },
  {
    title: "Instant Support Chat",
    description: "Get your questions answered in real-time by our support team.",
    screen: "/images/chatt.png",
    alt: "Chat Mockup",
    features: [
        {
            Icon: User,
            title: "Admin Support",
            description: "Chat directly with our support staff for assistance.",
            position: { top: "25%", left: "5%" },
            align: "right"
        },
        {
            Icon: FileText,
            title: "File Sharing",
            description: "Easily share images and documents for clearer communication.",
            position: { top: "75%", left: "5%" },
            align: "right"
        },
        {
            Icon: Send,
            title: "Real-time Messaging",
            description: "Instant message delivery for a seamless conversation flow.",
            position: { top: "85%", right: "5%" },
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
            className={cn("absolute hidden lg:flex items-center group transition-opacity duration-700", isActive ? "opacity-100" : "opacity-0 pointer-events-none")}
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

const features = [
  {
    icon: Lock,
    title: "Secure Deposits",
    description: "Your funds are protected with industry-leading security protocols.",
  },
  {
    icon: Zap,
    title: "Fast Withdrawals",
    description: "Access your money quickly with our efficient withdrawal process.",
  },
  {
    icon: MessageCircle,
    title: "Live Support",
    description: "Get instant help from our dedicated support team via live chat.",
  },
  {
    icon: Shield,
    title: "Total Transparency",
    description: "Track every transaction with a clear and detailed history.",
  },
];

const DepositFeatureHotspot = ({
  feature,
}: {
  feature: {
    Icon: React.ElementType;
    title: string;
    position: React.CSSProperties;
    align: "left" | "right";
  };
}) => {
  const { Icon, title, position, align } = feature;

  return (
    <div
      className={cn(
        "absolute flex items-center group animate-fade-in",
        align === "left" ? "flex-row" : "flex-row-reverse"
      )}
      style={position}
    >
      <div className="relative flex items-center justify-center w-8 h-8">
        <div className="absolute w-full h-full rounded-full bg-primary/20 animate-ping-slow" />
        <div className="relative flex items-center justify-center rounded-full bg-primary text-primary-foreground w-8 h-8">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div
        className={cn(
          "relative w-16 h-px bg-primary/30",
          align === "left" ? "ml-2" : "mr-2"
        )}
      >
        <div
          className={cn(
            "absolute top-0 h-px bg-primary animate-draw-line",
            align === "left" ? "left-0" : "right-0"
          )}
        />
      </div>
      <div
        className={cn(
          "font-headline text-foreground",
          align === "left" ? "text-left" : "text-right"
        )}
      >
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
    </div>
  );
};

const depositFeatures = [
    {
        Icon: DollarSign,
        title: "Enter Amount",
        position: { top: '13%', left: '15%' },
        align: 'right'
    },
    {
        Icon: Landmark,
        title: "Bank Details",
        position: { top: '40%', left: '15%' },
        align: 'right'
    },
    {
        Icon: UploadCloud,
        title: "Upload Proof",
        position: { top: '57%', right: '15%' },
        align: 'left'
    }
];

const withdrawalFeatures = [
    {
        Icon: Wallet,
        title: "Total Withdrawn",
        position: { top: '25%', left: '15%' },
        align: 'right'
    },
    {
        Icon: Landmark,
        title: "Your Bank Info",
        position: { top: '55%', right: '15%' },
        align: 'left'
    },
    {
        Icon: Send,
        title: "Submit Request",
        position: { top: '85%', right: '15%' },
        align: 'left'
    },
];

const faqItems = [
    {
        question: "How secure are my transactions?",
        answer: "We prioritize your security using state-of-the-art encryption and robust authentication protocols. All transactions are monitored to prevent fraud, ensuring your funds and data are always protected."
    },
    {
        question: "How long do deposits and withdrawals take?",
        answer: "Deposits are typically credited to your account within minutes of admin confirmation. Withdrawals are processed swiftly and usually reflect in your bank account within 24-48 business hours."
    },
    {
        question: "What if I need help with a transaction?",
        answer: "Our dedicated support team is available 24/7 via live chat. You can initiate a conversation directly from your dashboard to get real-time assistance with any questions or issues."
    },
    {
        question: "Can I use BPX Master on my mobile device?",
        answer: "Absolutely! Our platform is fully responsive and designed to work seamlessly across all devices, including desktops, tablets, and smartphones. You can also download our native apps from the App Store and Google Play."
    }
];

const BpexchFeatureHotspot = ({ icon: Icon, title, description, position, align = 'left' }: { icon: React.ElementType, title: string, description: string, position: React.CSSProperties, align?: 'left' | 'right' }) => (
    <div className="absolute hidden lg:flex items-center group" style={position}>
        <div className={cn("relative flex items-center", align === 'left' ? 'flex-row' : 'flex-row-reverse')}>
            <div className="w-5 h-5 flex items-center justify-center">
                <div className="absolute w-3 h-3 rounded-full bg-rose-500 animate-pulsing-dot" />
            </div>
            
            <div className={cn("relative w-16 h-px bg-white/30", align === 'left' ? 'ml-2' : 'mr-2')}>
                <div className={cn("absolute top-0 h-px bg-rose-500 animate-draw-line", align === 'left' ? 'left-0' : 'right-0')} />
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
    }, 5000); 

    return () => {
        api.off("select", onSelect);
        clearInterval(interval);
    };

  }, [api]);

  return (
    <div className="w-full min-h-screen text-white overflow-x-hidden">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BPX Master",
            "url": "https://www.bpxmaster.com",
            "logo": "https://www.bpxmaster.com/images/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-234-567-890",
              "contactType": "Customer Service"
            },
            "sameAs": [
                // Add your social media links here if you have them
            ],
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.bpxmaster.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            },
            "description": "The ultimate portal for secure and fast financial transactions in Pakistan. Manage deposits, withdrawals, and access your BPExch account seamlessly.",
            "keywords": "BPX Master, secure deposits Pakistan, fast withdrawals Pakistan, online financial portal, BPExch login, digital wallet Pakistan"
          }) }}
        />
      </Head>
      <div className="fixed inset-0 -z-20">
          <Image
              src="/images/sliderhero.jpg"
              alt="Mountain background"
              fill
              style={{ objectFit: "cover" }}
              className="opacity-100"
              priority
              unoptimized
          />
      </div>
      <div className="fixed inset-0 bg-black/80 -z-10" />

      <SiteHeader />

      <main className="relative z-10 flex flex-col items-center justify-center text-center pt-24 min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-7xl mx-auto px-[5%]">
            <div className="flex flex-col items-center pt-10">
                {sliderItems.map((slide, index) => (
                  <div key={index} className={cn("transition-opacity duration-700 w-full", current === index ? 'opacity-100' : 'opacity-0 absolute pointer-events-none')}>
                    <div className="flex flex-col items-center">
                      <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight transition-all duration-700 delay-100", current === index ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0')}>{slide.title}</h1>
                      <p className={cn("mt-4 text-white/70 transition-all duration-700 delay-200 max-w-md", current === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>{slide.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          <div className="flex flex-col items-center">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {sliderItems.map((slide, index) => (
                  <CarouselItem key={index}>
                    <div className={cn("transition-opacity duration-700", current === index ? 'opacity-100' : 'opacity-0')}>
                      <div className="relative w-full flex items-center justify-center h-[500px] lg:h-[600px]">
                        <Image
                          src={slide.screen}
                          alt={slide.alt}
                          width={800}
                          height={600}
                          className={cn("w-auto h-full object-contain transition-all duration-700 delay-500", current === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')}
                          priority={index === 0}
                          unoptimized
                        />
                        {slide.features.map((feature, i) => (
                          <FeatureHotspot key={i} feature={feature} isActive={current === index} />
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-[30px]">
              <Link href="#" passHref>
                <Image src="/images/appstore.png" alt="Download on the App Store" width={180} height={60} className="object-contain drop-shadow-lg hover:drop-shadow-xl" unoptimized />
              </Link>
              <a href="/BPXMaster.apk" download>
                 <Image src="/images/play.png" alt="Get it on Google Play" width={180} height={60} className="object-contain drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                 </a>
            </div>
          </div>
        </div>
      </main>

       <section className="bg-muted/90 text-foreground flex items-center min-h-[290px] py-20 mt-12 md:mt-0 md:py-0 md:h-[290px]">
            <div className="container mx-auto px-[5%]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center group">
                            <div className="relative flex items-center justify-center h-24 w-24 rounded-full border border-primary/30 bg-primary/10 mb-6 transition-all duration-300">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping-slow opacity-0 group-hover:opacity-100"></span>
                                <feature.icon className="w-[26px] h-[26px] text-primary" />
                            </div>
                            <h3 className="text-[22px] font-headline font-normal mb-2">{feature.title}</h3>
                            <p className="text-base font-normal text-muted-foreground max-w-xs">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
      </section>

      <section className="bg-background text-foreground py-20 lg:py-32 px-[5%] relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-blob opacity-70"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl animate-blob animation-delay-4000 opacity-70"></div>
        
        <div className="container mx-auto grid lg:grid-cols-10 gap-12 items-center relative z-10">
            <div className="lg:col-span-3 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl font-headline font-bold text-primary animate-slide-from-top" style={{ animationDelay: '0.2s' }}>
                    <span className="font-script text-5xl block">Seamless & Secure</span> Deposits
                </h2>
                <p className="text-muted-foreground animate-slide-from-left" style={{ animationDelay: '0.4s' }}>
                    Adding funds to your account is straightforward. Follow our simple steps to deposit money, upload your proof, and see the funds reflect in your wallet upon admin confirmation. Fast, reliable, and secure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-slide-from-bottom" style={{ animationDelay: '0.6s' }}>
                    <Link href="#" passHref>
                        <Image src="/images/appstore.png" alt="Download on the App Store" width={180} height={60} className="object-contain transition-transform hover:scale-105 drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                    </Link>
                    <a href="/BPXMaster.apk" download>
                        <Image src="/images/play.png" alt="Get it on Google Play" width={180} height={60} className="object-contain transition-transform hover:scale-105 drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                        </a>
                </div>
            </div>
             <div className="lg:col-span-7 relative flex justify-center items-center">
                <Image
                    src="/images/vec.png"
                    alt="Decorative circle art"
                    width={600}
                    height={600}
                    className="absolute -z-10 opacity-5 animate-spin-slow"
                    unoptimized
                />
                <Image 
                    src="/images/deposection.png"
                    alt="Deposit Section Mockup"
                    width={228}
                    height={500}
                    style={{ width: "auto", height: "500px" }}
                    unoptimized
                    className="relative z-10 animate-fade-in object-contain"
                />

                {depositFeatures.map((feature, i) => (
                    <DepositFeatureHotspot key={i} feature={{...feature, Icon: feature.Icon }} />
                ))}
            </div>
        </div>
      </section>

      <section className="bg-muted/10 text-foreground py-20 lg:py-32 px-[5%] relative overflow-hidden">
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="lg:order-last lg:col-span-1 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl font-headline font-bold text-white animate-slide-from-top" style={{ animationDelay: '0.2s' }}>
                    <span className="font-script text-5xl block text-white">Effortless & Quick</span> Withdrawals
                </h2>
                <p className="text-white/70 animate-slide-from-left" style={{ animationDelay: '0.4s' }}>
                    Access your funds whenever you need them. Our streamlined withdrawal process ensures your money is transferred to your bank account securely and promptly after admin approval.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-slide-from-bottom" style={{ animationDelay: '0.6s' }}>
                    <Link href="#" passHref>
                        <Image src="/images/appstore.png" alt="Download on the App Store" width={180} height={60} className="object-contain transition-transform hover:scale-105 drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                    </Link>
                    <a href="/BPXMaster.apk" download>
                        <Image src="/images/play.png" alt="Get it on Google Play" width={180} height={60} className="object-contain transition-transform hover:scale-105 drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                        </a>
                </div>
            </div>
             <div className="lg:col-span-1 relative flex justify-center items-center">
                <Image
                    src="/images/neonl.png"
                    alt="Decorative circle art"
                    width={600}
                    height={600}
                    className="absolute -z-10 opacity-5 animate-spin-slow"
                    unoptimized
                />
                <Image 
                    src="/images/withddsec.png"
                    alt="Withdrawal Section Mockup"
                    width={500}
                    height={500}
                    style={{ width: "auto" }}
                    unoptimized
                    className="relative z-10 animate-fade-in object-contain"
                />
                {withdrawalFeatures.map((feature, i) => (
                    <DepositFeatureHotspot key={i} feature={{...feature, Icon: feature.Icon }} />
                ))}
            </div>
        </div>
      </section>
      
      <section className="relative py-20 lg:py-32 px-[5%] overflow-hidden">
        <Image
            src="/images/sliderhero.jpg"
            alt="Mountain background"
            fill
            className="absolute inset-0 w-full h-full object-cover -z-20"
            unoptimized
        />
        <div className="absolute inset-0 bg-black/70 -z-10" />
        <div className="container mx-auto text-center text-white relative z-10">
            <h2 className="text-4xl font-headline font-bold animate-fade-in" style={{animationDelay: '0.2s'}}>
                Secure, Monitored BPExch Access
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-white/70 animate-fade-in" style={{animationDelay: '0.4s'}}>
                Log in to your BPExch account with confidence. We provide your credentials and track all login activity, allowing you to block any suspicious IP addresses instantly for complete peace of mind.
            </p>
            
             <div className="relative mt-12 flex justify-center items-center h-[550px] lg:h-[600px] animate-fade-in" style={{animationDelay: '0.6s'}}>
                
             <Image
  src="/images/bpp.png"
  alt="BPExch Login on phone"
  width={400} // or any desired value
  height={650}
  className="w-auto h-[650px] object-cover"
  unoptimized
/>


               

                <BpexchFeatureHotspot 
                    icon={KeyRound}
                    title="Your Credentials"
                    description="Admin-provided username and password for BPExch."
                    position={{ top: '55%', right: '15%'}}
                    align="left"
                />
                <BpexchFeatureHotspot 
                    icon={Shield}
                    title="Block Suspicious IPs"
                    description="Instantly block any unrecognized IP address."
                    position={{ top: '10%', left: '15%'}}
                    align="right"
                />
                <BpexchFeatureHotspot 
                    icon={Activity}
                    title="Login History"
                    description="Review all login attempts for enhanced security."
                    position={{ top: '85%', right: '20%'}}
                    align="left"
                />
            </div>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <Link href="#" passHref>
                <Image src="/images/appstore.png" alt="Download on the App Store" width={180} height={60} className="object-contain drop-shadow-lg hover:drop-shadow-xl" unoptimized />
              </Link>
              <a href="/BPXMaster.apk" download>
                 <Image src="/images/play.png" alt="Get it on Google Play" width={180} height={60} className="object-contain drop-shadow-lg hover:drop-shadow-xl" unoptimized />
                 </a>
            </div>
        </div>
      </section>

      <section className="bg-background text-foreground py-20 lg:py-32 px-[5%] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/5 rounded-full filter blur-3xl animate-blob opacity-50"></div>
          
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6 text-center lg:text-left">
                  <h2 className="text-4xl font-headline font-bold text-primary animate-slide-from-top" style={{ animationDelay: '0.2s' }}>
                      <span className="font-script text-5xl block">Still have questions?</span>
                      Why Choose Us
                  </h2>
                  <p className="text-muted-foreground animate-slide-from-left" style={{ animationDelay: '0.4s' }}>
                      We provide a secure, fast, and user-friendly platform for all your financial needs. Explore our frequently asked questions to learn more about our commitment to excellence.
                  </p>
                  <Accordion type="single" collapsible className="w-full text-left" id="faq">
                      {faqItems.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="font-semibold text-lg hover:no-underline">{item.question}</AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                  {item.answer}
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </Accordion>
              </div>
              <div className="relative flex justify-center items-center">
                  <div className="absolute -inset-8 w-full h-full">
                      <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent/20 rounded-full filter blur-2xl animate-blob animation-delay-2000"></div>
                      <div className="absolute bottom-10 right-0 w-48 h-48 bg-primary/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
                  </div>
                   <Image 
                        src="/images/neon.png"
                        alt="Neon circle"
                        width={600}
                        height={600}
                        className="absolute -z-10 opacity-70 animate-spin-slow rounded-full"
                        unoptimized
                    />
                   
                   <Image
  src="/images/whyy.png"
  alt="App dashboard on phone"
  width={280}
  height={500}
  className="h-[500px] w-auto object-cover"
  unoptimized
/>



                 
              </div>
          </div>
      </section>
      <footer className="relative border-t text-white overflow-hidden">
        <Image
          src="/images/footer.jpg"
          alt="Footer background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 -z-20"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20 -z-10" />
        <div className="container relative z-10 py-8 px-[5%]">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
                        <AppLogo className="h-[90px] w-auto" />
                    </Link>
                    <p className="text-sm text-white/70">Your Portal to Effortless Finance.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Company</h4>
                    <Link href="/about-us" className="text-sm text-white/70 hover:text-primary" prefetch={false}>About Us</Link>
                    <Link href="/contact-us" className="text-sm text-white/70 hover:text-primary" prefetch={false}>Contact Us</Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Legal</h4>
                    <Link href="/terms-of-service" className="text-sm text-white/70 hover:text-primary" prefetch={false}>Terms of Service</Link>
                    <Link href="/privacy-policy" className="text-sm text-white/70 hover:text-primary" prefetch={false}>Privacy Policy</Link>
                    <Link href="/refund-policy" className="text-sm text-white/70 hover:text-primary" prefetch={false}>Refund Policy</Link>
                </div>
                 <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Support</h4>
                    <Link href="/#faq" className="text-sm text-white/70 hover:text-primary" prefetch={false}>FAQ</Link>
                    <Link href="/login" className="text-sm text-white/70 hover:text-primary" prefetch={false}>My Account</Link>
                </div>
            </div>
             <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-6">
                <p className="text-xs text-white/70">&copy; 2024 BPX Master. All rights reserved.</p>
                <p className="text-xs text-white/70 mt-2 md:mt-0">
                    Developed by <a href="https://beta-tech.solutions" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary underline underline-offset-4">Beta Tech Solutions</a>.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
