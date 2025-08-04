
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function AccountActivationPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="w-full transition-shadow hover:shadow-lg">
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

            <Card className="w-full transition-shadow hover:shadow-lg">
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
        </div>
    );
}
