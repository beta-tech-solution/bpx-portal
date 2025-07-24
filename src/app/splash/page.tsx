
"use client"

import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
    const [isFading, setIsFading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 2000); // Start fading after 2 seconds

        const redirectTimer = setTimeout(() => {
            router.push('/login');
        }, 2500); // Redirect after 2.5 seconds (during fade)

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(redirectTimer);
        }
    }, [router]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-background transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <style jsx>{`
        .logo-container {
            animation: bounce-in 1.2s ease-out forwards;
        }
        .text-container {
            animation: fade-in-up 1s ease-out 0.5s forwards;
            opacity: 0;
        }
        @keyframes bounce-in {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in-up {
             0% { opacity: 0; transform: translateY(20px); }
             100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
       <div className="logo-container flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg">
             <Wallet className="w-16 h-16"/>
          </div>
      </div>
       <div className="text-container text-center mt-6">
            <h1 className="text-3xl font-bold font-headline text-foreground">BPX Portal</h1>
            <p className="text-muted-foreground">Your Secure Financial Gateway</p>
      </div>
    </div>
  );
}
