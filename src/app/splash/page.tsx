"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const [step, setStep] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800), // Show welcome text
      setTimeout(() => setStep(2), 2200), // Show getting ready text
      setTimeout(() => setIsFading(true), 3200), // Fade out
      setTimeout(() => router.push("/login"), 4000), // Redirect
    ];

    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen text-white overflow-hidden relative transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background with shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1d3b] via-[#102c54] to-[#0a1d3b] animate-gradient"></div>

      {/* Logo with shimmer + glow */}
      <div className="relative z-10 animate-logo">
        <div className="absolute inset-0 rounded-full blur-xl bg-blue-400 opacity-40 animate-pulse"></div>
        <img
          src="/images/logo.png" // Replace with your logo link
          alt="App Logo"
          className="w-28 h-28 object-contain relative z-10 shimmer-mask rounded-full"
        />
      </div>

      {/* Welcome text in Dancing Script */}
      {step >= 1 && (
        <h1
          className="mt-6 text-3xl font-[DancingScript] z-10 animate-fadein"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Welcome to Your Portal
          <span className="inline-block loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </h1>
      )}

      {/* Getting ready text in Raleway 400 */}
      {step >= 2 && (
        <p
          className="mt-3 text-sm font-[Raleway] font-normal opacity-80 z-10 animate-fadein-slow"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          Getting things ready...
        </p>
      )}

      <style jsx>{`
        /* Background shimmer animation */
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
        }

        /* Logo zoom-in animation */
        @keyframes logoZoom {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-logo {
          animation: logoZoom 0.8s ease-out forwards;
        }

        /* Logo shimmer mask effect */
        .shimmer-mask {
          position: relative;
          overflow: hidden;
        }
        .shimmer-mask::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Fade-in effects */
        .animate-fadein {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-fadein-slow {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading dots animation */
        .loading-dots span {
          animation: bounce 1.2s infinite;
          display: inline-block;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.8);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
