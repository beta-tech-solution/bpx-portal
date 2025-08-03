
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand } from "lucide-react";

export default function AccountActivationPage() {
    return (
        <div className="flex items-center justify-center h-full animate-fade-in">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Hand className="w-12 h-12 text-primary animate-bounce"/>
                    </div>
                    <CardTitle className="font-headline">Account Activation</CardTitle>
                    <CardDescription>This feature is coming soon!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Please contact support via the live chat widget to have your BPExch account credentials set up by an administrator.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
