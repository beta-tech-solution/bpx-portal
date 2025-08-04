
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function AccountActivationPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Don't have a BPExch Account?</CardTitle>
                    <CardDescription>
                        Tap Deposit Now to Create your account.
                        <br />
                        (You will receive username and password within 30 minutes)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/deposit" passHref>
                        <Button className="w-full h-12 text-base font-bold bg-slate-800 hover:bg-slate-700 text-white">
                            DEPOSIT NOW
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <h3 className="font-bold text-destructive">Note:</h3>
                        <p className="text-sm text-muted-foreground">
                            First deposit then you will receive username and password within 30 minutes.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            pehly ap deposit karange uske bad 30 minutes ke andar apka username and password yahi per show hoga
                        </p>
                         <p className="text-sm text-muted-foreground">
                            jo Raqam ap deposit krwaenge wo isi wallet me ajaigi
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-destructive">Warning:</h3>
                        <p className="text-sm text-destructive font-semibold">
                            Agr ap 24 Hours ke andar Pehli deposit nahi krwaige to apka account ban kar diya jaiga
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md relative overflow-hidden text-white bg-gradient-to-tr from-cyan-400 to-blue-600">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 animate-shine" />
                 <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="p-3 bg-white/20 rounded-2xl mb-4">
                        <Image src="/images/logo.png" width={40} height={40} alt="App Logo" className="rounded-lg" unoptimized />
                     </div>
                     <h3 className="font-bold text-xl">Download Our App</h3>
                     <p className="text-sm text-white/80 mt-1 mb-6 max-w-xs">Get the fastest and safest payment experience right from your phone.</p>
                     <Link href="#" passHref>
                        <Image src="/images/play.png" alt="Get it on Google Play" width={250} height={80} className="object-contain" unoptimized/>
                    </Link>
                 </CardContent>
             </Card>
        </div>
    );
}
