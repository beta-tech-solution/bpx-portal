
"use client"
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

export const IPhoneMockup = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("relative z-10 w-[300px] h-[610px] md:w-[320px] md:h-[650px] pointer-events-none", className)}>
             <Image 
                src="/images/iphone-mockup.png"
                alt="iPhone Mockup Frame"
                layout="fill"
                objectFit="contain"
                className="z-20"
            />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
                <div className="w-[91.5%] h-[97%] mt-[1px] rounded-[48px] overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};
