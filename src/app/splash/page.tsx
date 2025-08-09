"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, CreditCard, BarChart } from "lucide-react";

export default function SplashScreen() {
  const [showScript, setShowScript] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hideScript = setTimeout(() => setShowScript(false), 2500); // Show "Starting Your Portal" for 2.5s
    const fadeTimer = setTimeout(() => setIsFading(true), 3800); // Fade after 3.8s
    const redirectTimer = setTimeout(() => router.push("/login"), 4500); // Redirect after fade

    return () => {
      clearTimeout(hideScript);
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 animate-gradient" />

      {/* Floating finance icons */}
      <div className="absolute bottom-0 w-full h-full overflow-hidden pointer-events-none">
        {[DollarSign, TrendingUp, CreditCard, BarChart].map((Icon, i) => (
          <Icon
            key={i}
            className="absolute text-white opacity-20"
            style={{
              bottom: -50,
              left: `${20 + i * 20}%`,
              animation: `floatUp 5s ease-in-out ${i * 0.8}s infinite`,
              width: 40,
              height: 40,
            }}
          />
        ))}
      </div>

      {/* Handwriting effect */}
      {showScript && (
        <h2 className="text-3xl font-[DancingScript] handwriting-animation z-10">
          Starting Your Portal
        </h2>
      )}

      {/* BPX Master Title */}
      {!showScript && (
        <h1 className="text-5xl font-bold tracking-wide fade-in-up z-10">
          BPX Master
        </h1>
      )}

      <style jsx>{`
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
          animation: gradientMove 6s ease infinite;
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          30% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-120vh) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes handwriting {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        .handwriting-animation {
          font-family: 'Dancing Script', cursive;
          white-space: nowrap;
          overflow: hidden;
          border-right: 3px solid rgba(255, 255, 255, 0.75);
          animation: handwriting 2s steps(30, end), blink 0.75s step-end infinite;
        }
        @keyframes blink {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: white;
          }
        }
        .fade-in-up {
          animation: fadeUp 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
