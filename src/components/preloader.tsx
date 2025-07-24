
"use client"

import { Wallet } from 'lucide-react';

interface PreloaderProps {
    loadingText?: string;
}

export default function Preloader({ loadingText = "Loading..." }: PreloaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-background`}>
      <style jsx>{`
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
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
            position: relative;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            background-image: linear-gradient(to right, hsl(var(--muted-foreground)), hsl(var(--foreground)), hsl(var(--muted-foreground)));
            animation: shimmer 4s infinite linear;
            background-size: 200% 100%;
            background-position: 200%;
            margin-top: 1.5rem;
        }

        @keyframes shimmer {
            0% {
                background-position: 200% center;
            }
            100% {
                background-position: -200% center;
            }
        }
        
        .subtitle {
            font-family: 'PT Sans', sans-serif;
            font-size: 1rem;
            font-weight: 400;
            color: hsl(var(--muted-foreground));
            margin-top: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .loading-dots {
            display: flex;
            gap: 0.25rem;
        }

        .loading-dots div {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: hsl(var(--muted-foreground));
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots .dot-1 { animation-delay: -0.32s; }
        .loading-dots .dot-2 { animation-delay: -0.16s; }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }
      `}</style>
       <div className="container">
           <div className="logo-container">
              <div className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                 <Wallet className="w-16 h-16"/>
              </div>
          </div>
           <h1 className="title">BPX Master</h1>
            <div className="subtitle">
              <span>{loadingText}</span>
              <div className="loading-dots">
                  <div className="dot-1"></div>
                  <div className="dot-2"></div>
                  <div className="dot-3"></div>
              </div>
            </div>
      </div>
    </div>
  );
}
