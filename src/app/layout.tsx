// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import SplashScreen from "./splash/page";

export const metadata: Metadata = {
  title: "BPX Portal",
  description: "Your portal for BPX services.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/images/fav32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/images/fav16.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/images/android.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", url: "/images/android12.png" },
    ],
  },
};

export default function RootLayout({
  children,
  searchParams,
}: Readonly<{
  children: React.ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}>) {
  // keep your existing quick server-side check for manual testing:
  if (searchParams?.splash === "true") {
    // return shell with only splash to prevent unnecessary hydration
    return (
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
          <meta name="theme-color" content="#FFFFFF" />
        </head>
        <body className="font-body antialiased">
          <SplashScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="BPX Master" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BPX Portal" />

        {/* redirect to /splash when launched as a PWA/TWA (client-side) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
                                   || window.navigator.standalone === true;
                if (!isStandalone) return;
                var loc = window.location;
                // already on splash => do nothing
                if (loc.pathname && loc.pathname.startsWith('/splash')) return;
                // avoid loop if we already marked from=pwa
                if (loc.search && loc.search.indexOf('from=pwa') !== -1) return;
                // redirect to splash and mark so we don't loop
                var target = '/splash?from=pwa';
                window.location.replace(target + (loc.hash || ''));
              } catch(e){ console && console.error(e); }
            })();`,
          }}
        />

        {/* service worker registration (keeps your current code) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }).catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        <meta name="google-site-verification" content="uSmzlonhsJHQVRYiZeWS7-VLBA0GZj6Z3an1USl48Vo" />
      </head>

      <body className="font-body antialiased">
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
