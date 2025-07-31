
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

export const FeatureHotspot = ({ top, left, title }: { top: string, left: string, title: string }) => {
    const isRightSide = parseInt(left) > 50;

    return (
        <div
            className="absolute group"
            style={{ top, left }}
        >
            <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                <div className="w-full h-full rounded-full bg-primary animate-pulse-slow"></div>
                <div className="absolute inset-0 w-full h-full rounded-full bg-primary/50 animate-ping-slow"></div>
            </div>
            <div className={cn("absolute top-1/2 -translate-y-1/2 whitespace-nowrap flex items-center gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
                isRightSide ? "right-full mr-6" : "left-full ml-6"
            )}>
                 <p className={cn(
                    "px-3 py-1 rounded-full text-sm font-semibold bg-background/80 backdrop-blur-sm shadow-md",
                     isRightSide ? "order-2" : "order-1"
                )}>
                    {title}
                </p>
                <div className={cn("h-px w-8 bg-foreground/50", isRightSide ? "order-1" : "order-2")}></div>
            </div>
        </div>
    );
};

    