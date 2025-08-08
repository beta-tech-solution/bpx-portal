
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from 'react';
import SplashScreen from './splash/page';

export const metadata: Metadata = {
  title: 'BPX Portal',
  description: 'Your portal for BPX services.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/images/fav32.png',
      },
       {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/images/fav16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/images/android.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/images/android12.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
  searchParams
}: Readonly<{
  children: React.ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}>) {

  if (searchParams?.splash === 'true') {
    return <SplashScreen />;
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BPX Portal" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={null}>
            {children}
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
