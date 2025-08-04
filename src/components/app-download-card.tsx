
"use client"

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AppDownloadCard() {
    return (
        <Card className="shadow-md relative overflow-hidden text-white bg-gradient-to-tr from-cyan-400 to-blue-600">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 animate-shine" />
            <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-3 bg-white/20 rounded-2xl mb-4">
                <Image src="/images/logo.png" width={40} height={40} alt="App Logo" className="rounded-lg" unoptimized />
                </div>
                <h3 className="font-bold text-xl">Download Our App</h3>
                <p className="text-sm text-white/80 mt-1 mb-6 max-w-xs">Get the fastest and safest payment experience right from your phone.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="#" passHref>
                    <Image src="/images/appstore.png" alt="Download on the App Store" width={150} height={50} className="object-contain" unoptimized/>
                </Link>
                <Link href="#" passHref>
                    <Image src="/images/play.png" alt="Get it on Google Play" width={150} height={50} className="object-contain" unoptimized/>
                </Link>
                </div>
            </CardContent>
        </Card>
    );
}
