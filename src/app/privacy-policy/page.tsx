
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
            <div className="h-1.5 bg-primary" />
            <div className="bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between h-20">
                    <Link href="/" aria-label="Back to homepage">
                        <AppLogo className="h-10 w-auto" />
                    </Link>

                    <nav className="hidden md:flex items-end h-full">
                        <ul className="flex items-center h-full relative">
                            {navLinks.map((link) => {
                                const isActive = link.href === activeLink.href;
                                return (
                                    <li key={link.name} className="h-full">
                                        <Link href={link.href} className={cn("relative flex flex-col items-center justify-center gap-1.5 h-full px-5 text-sm font-medium transition-colors text-white/70 hover:text-white", { "text-white": isActive })}>
                                            <link.icon className="h-5 w-5" />
                                            <span>{link.name}</span>
                                            {isActive && (
                                                <div className="absolute top-0 w-full h-full">
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-16 bg-primary"
                                                        style={{
                                                            clipPath: 'path("M0,0 C3,12 15,12 20,12 L calc(100% - 20px),12 C calc(100% - 15px),12 calc(100% - 3px),0 100%,0 Z")'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="relative z-10 flex flex-col items-center justify-center gap-1.5">
                                                <link.icon className="h-5 w-5" />
                                                <span>{link.name}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                     <div className="hidden md:flex items-center gap-2">
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors">
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

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">Last updated: July 26, 2024</p>
            
            <p>
              This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your
              information when You use the Service and tells You about Your privacy rights and how the law protects You.
              We use Your Personal data to provide and improve the Service. By using the Service, You agree to the
              collection and use of information in accordance with this Privacy Policy.
            </p>

            <h2 className="font-headline">1. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service
              to you. This may include, but is not limited to, your name, email address, phone number, and transaction
              details.
            </p>

            <h2 className="font-headline">2. Log Data</h2>
            <p>
              Like many site operators, we collect information that your browser sends whenever you visit our Service
              ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP")
              address, browser type, browser version, the pages of our Service that you visit, the time and date of
              your visit, the time spent on those pages and other statistics.
            </p>
            
            <h2 className="font-headline">3. Cookies</h2>
            <p>
              Cookies are files with a small amount of data, which may include an anonymous unique identifier. We use
              cookies to collect information to improve our services for you. You can instruct your browser to refuse
              all cookies or to indicate when a cookie is being sent.
            </p>

            <h2 className="font-headline">4. Security</h2>
            <p>
              The security of your Personal Information is important to us, but remember that no method of transmission
              over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
            </p>

            <h2 className="font-headline">5. Links to Other Sites</h2>
            <p>
              Our Service may contain links to other sites that are not operated by us. If you click on a third party
              link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy
              of every site you visit.
            </p>

            <h2 className="font-headline">6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2 className="font-headline">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
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
