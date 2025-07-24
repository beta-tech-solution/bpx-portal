
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
        }, 3500); // Start fading after 3.5 seconds

        const redirectTimer = setTimeout(() => {
            router.push('/login');
        }, 4000); // Redirect after 4 seconds (during fade)

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(redirectTimer);
        }
    }, [router]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-background transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <style jsx>{`
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .logo-container {
            animation: pop-in 1s ease-out forwards;
        }

        @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .title {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: hsl(var(--foreground));
            margin-top: 1.5rem;
            animation: fade-in-up 1s ease-out 0.5s forwards;
            opacity: 0;
        }

        @keyframes fade-in-up {
             0% { opacity: 0; transform: translateY(20px); }
             100% { opacity: 1; transform: translateY(0); }
        }

        .loading-dots {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
            animation: fade-in-up 1s ease-out 1s forwards;
            opacity: 0;
        }

        .loading-dots div {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: hsl(var(--primary));
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots .dot-1 {
            animation-delay: -0.32s;
        }

        .loading-dots .dot-2 {
            animation-delay: -0.16s;
        }

        @keyframes bounce {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1.0);
            }
        }
      `}</style>
       <div className="container">
           <div className="logo-container">
              <div className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                 <Wallet className="w-16 h-16"/>
              </div>
          </div>
           <h1 className="title">BPX Master</h1>
            <div className="loading-dots">
                <div className="dot-1"></div>
                <div className="dot-2"></div>
                <div className="dot-3"></div>
            </div>
      </div>
    </div>
  );
}

    