
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const oobCode = searchParams.get('oobCode');

        if (!oobCode) {
            setStatus('error');
            setMessage('Invalid verification link. Please try signing up again.');
            return;
        }

        const handleVerifyEmail = async () => {
            try {
                // 1. Check the action code to get user info
                const actionCodeInfo = await checkActionCode(auth, oobCode);
                const email = actionCodeInfo.data.email;

                if (!email) {
                    throw new Error("Invalid action code, email not found.");
                }

                // 2. Apply the action code to verify the email
                await applyActionCode(auth, oobCode);
                
                // 3. Update the user's document in Firestore
                // We need to find the user by email, as we don't know the UID here.
                // This part is tricky without a direct UID lookup.
                // A better approach is to let the dashboard layout handle the Firestore update
                // on the first successful login of a verified user. For now, we'll focus
                // on verifying the Firebase Auth user. A cloud function would be a robust solution here.
                // For client-side, we'll mark as successful and let login logic handle the rest.
                
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in.');

            } catch (error: any) {
                console.error("Email verification error:", error);
                setStatus('error');
                if (error.code === 'auth/invalid-action-code') {
                    setMessage('The verification link is expired or has already been used. Please try signing up again or request a new link.');
                } else {
                    setMessage('An error occurred during email verification. Please try again.');
                }
            }
        };

        handleVerifyEmail();
    }, [searchParams]);

    const renderIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
            case 'success':
                return <MailCheck className="w-12 h-12 text-green-500" />;
            case 'error':
                return <AlertTriangle className="w-12 h-12 text-destructive" />;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted">
            <Card className="w-full max-w-md mx-4 text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">{renderIcon()}</div>
                    <CardTitle className="font-headline">Email Verification</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                {status !== 'loading' && (
                    <CardContent>
                        <Button asChild>
                            <Link href="/login">Proceed to Login</Link>
                        </Button>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}


export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}

