
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { Home, Users, Phone, HelpCircle, LogIn, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", name: "Home", icon: Home },
    { href: "/about-us", name: "About Us", icon: Users },
    { href: "/contact-us", name: "Contact", icon: Phone },
    { href: "/#faq", name: "FAQs", icon: HelpCircle },
];

const SiteHeader = () => {
    const pathname = usePathname();
    const activeLink = navLinks.find(link => pathname.startsWith(link.href)) || navLinks[0];

    return (
        <header className="absolute top-0 left-0 w-full z-50 animate-fade-in">
            <div className="h-[20px] bg-primary animate-shine" />
            <div className="bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between h-20 px-[5%]">
                    <Link href="/" aria-label="Back to homepage">
                        <AppLogo className="h-10 w-auto" />
                    </Link>

                    <nav className="hidden md:flex items-center h-full">
                        <ul className="flex items-center h-full gap-8">
                            {navLinks.map((link) => {
                                const isActive = link.href === activeLink?.href;
                                return (
                                    <li key={link.name} className="h-full">
                                        <Link href={link.href} className="group relative flex flex-col items-center justify-center h-full px-2 text-sm font-medium transition-colors text-white/70 hover:text-white">
                                            <div className="relative flex flex-col items-center justify-center gap-1.5 pb-2">
                                                {isActive && (
                                                    <div
                                                        className="absolute -top-7 w-20 h-16 bg-primary"
                                                        style={{
                                                            clipPath: 'path("M0 0 H80 V40 C65 55, 15 55, 0 40Z")'
                                                        }}
                                                    />
                                                )}
                                                <div className="relative z-10">
                                                    <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                                                </div>
                                                <span className={cn("relative z-10", { "text-white": isActive })}>{link.name}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                     <div className="hidden md:flex items-center gap-2">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-colors border border-white hover:border-transparent hover:bg-gradient-to-r from-primary to-blue-400">
                           <LogIn className="h-4 w-4" /> Login
                        </Link>
                        <Link href="/signup" className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                           <UserPlus className="h-4 w-4" /> Register
                        </Link>
                    </div>

                    <div className="md:hidden">
                       <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">
                           Login
                       </Link>
                   </div>
                </div>
            </div>
        </header>
    );
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">Last updated: July 26, 2024</p>
            
            <p>
              Welcome to BPX Master. These terms and conditions outline the rules and regulations for the use of
              our website and services. By accessing this website, we assume you accept these terms and conditions. Do not
              continue to use BPX Master if you do not agree to all of the terms and conditions stated on this page.
            </p>

            <h2 className="font-headline">1. Definitions</h2>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all
              Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the
              Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company.
            </p>

            <h2 className="font-headline">2. Use of Service</h2>
            <p>
              You agree to use our services for lawful purposes only. You are prohibited from any use of the services that would
              constitute a violation of any applicable law, regulation, rule or ordinance of any nationality, state, or
              locality or of any international law or treaty.
            </p>

            <h2 className="font-headline">3. Accounts</h2>
            <p>
              When you create an account with us, you must provide us with information that is accurate, complete, and
              current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate
              termination of your account on our service.
            </p>
            
            <h2 className="font-headline">4. Intellectual Property</h2>
            <p>
                The Service and its original content, features and functionality are and will remain the exclusive property of BPX Master and its licensors.
            </p>

            <h2 className="font-headline">5. Limitation Of Liability</h2>
            <p>
              In no event shall BPX Master, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Service.
            </p>

            <h2 className="font-headline">6. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of our operating jurisdiction, without regard
              to its conflict of law provisions.
            </p>

            <h2 className="font-headline">7. Changes To These Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole discretion.
            </p>
            
            <h2 className="font-headline">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us through our support channels.</p>
          </article>
        </div>
      </main>
      <footer className="border-t">
        <div className="container py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
                        <AppLogo className="h-10 w-auto" />
                    </Link>
                    <p className="text-sm text-muted-foreground">Your Portal to Effortless Finance.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Company</h4>
                    <Link href="/about-us" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>About Us</Link>
                    <Link href="/contact-us" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Contact Us</Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Legal</h4>
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Terms of Service</Link>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Privacy Policy</Link>
                    <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Refund Policy</Link>
                </div>
                 <div className="flex flex-col gap-2">
                    <h4 className="font-semibold font-headline">Support</h4>
                    <Link href="/#faq" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>FAQ</Link>
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>My Account</Link>
                </div>
            </div>
             <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t pt-6">
                <p className="text-xs text-muted-foreground">&copy; 2024 BPX Master. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-2 md:mt-0">
                    Developed by <a href="https://beta-tech.solutions" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary underline underline-offset-4">Beta Tech Solutions</a>.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
