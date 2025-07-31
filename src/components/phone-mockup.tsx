
"use client"
import { cn } from "@/lib/utils";
import React from "react";

export const PhoneMockup = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("relative z-10 aspect-[9/19.5] w-[280px] md:w-[320px] lg:w-[350px] bg-zinc-800 rounded-[60px] border-[14px] border-zinc-900 shadow-2xl", className)}>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-4 bg-zinc-900 rounded-full z-20"></div>
            <div className="w-full h-full rounded-[46px] overflow-hidden">
                {children}
            </div>
        </div>
    );
};
