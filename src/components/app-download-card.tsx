
"use client"

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AppDownloadCard() {
    return (
        <Card className="shadow-lg relative overflow-hidden text-white bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-spin-slow -z-0" />
            <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
                    <Image src="/images/logo.png" width={40} height={40} alt="App Logo" className="rounded-lg" unoptimized />
                </div>
                <h3 className="font-bold text-xl">Get the BPX Master App</h3>
                <p className="text-sm text-white/70 mt-1 mb-6 max-w-xs">Experience seamless and secure transactions on the go. Download now!</p>
                <div className="flex items-center justify-center">
                    <Link href="#" passHref>
                        <Image src="/images/play.png" alt="Get it on Google Play" width={180} height={70} className="object-contain transition-transform hover:scale-105" unoptimized/>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
