
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
                                        <Link href={link.href} className={cn("relative flex items-center justify-end flex-col h-full px-5 text-sm font-medium transition-colors text-white/70 hover:text-white", { "text-white": isActive })}>
                                            
                                            {isActive && (
                                                <div className="absolute top-0 w-full h-full">
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-16 bg-primary"
                                                        style={{
                                                            clipPath: 'path("M0,0 C3,12 15,12 20,12 L calc(100% - 20px),12 C calc(100% - 15px),12 calc(100% - 3px),0 100%,0 Z")'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 pb-2">
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


export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <article className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl font-bold">Refund Policy</h1>
            <p className="text-muted-foreground text-lg">Last updated: July 27, 2024</p>
            
            <p>
              Thank you for using BPX Master. Our platform facilitates financial transactions, including deposits and withdrawals. This policy outlines the terms under which refunds may be processed. Please read it carefully.
            </p>

            <h2 className="font-headline">1. General Policy</h2>
            <p>
              Due to the nature of our services, which involve the transfer of funds to and from external exchange platforms and personal bank accounts, all transactions are generally considered final once they have been successfully processed and confirmed.
            </p>

            <h2 className="font-headline">2. Deposit Transactions</h2>
            <p>
              When you deposit funds, they are held in your BPX Master wallet. These funds are available for transfer to your linked exchange account or for withdrawal. Since these are direct deposits of your own funds, the concept of a "refund" in the traditional sense does not apply. If you wish to retrieve your deposited funds, you must initiate a withdrawal request.
            </p>

            <h2 className="font-headline">3. Withdrawal Transactions</h2>
            <p>
                A withdrawal transaction moves funds from your BPX Master wallet to your designated bank account. Once a withdrawal has been marked as "Approved" and the funds have been disbursed from our system, it cannot be reversed or refunded. It is the user's responsibility to ensure that all withdrawal information, including bank account details, is accurate before submitting a request.
            </p>

            <h2 className="font-headline">4. Disputed or Failed Transactions</h2>
            <p>
             If a deposit is not credited to your account after approval, or if a withdrawal fails to appear in your bank account after being marked as "Approved" within the standard processing time, please contact our support team immediately. We will launch an investigation to trace the transaction.
            </p>
            <p>
             If our investigation determines that a transaction failed due to an error on our part or within our banking partners' systems, a full credit or refund of the transaction amount will be issued to your BPX Master wallet or resent to your bank account.
            </p>

            <h2 className="font-headline">5. Incorrect User Information</h2>
            <p>
              We are not liable for losses incurred due to incorrect information provided by the user. This includes, but is not limited to, incorrect bank account numbers, account holder names, or deposit references. Please double-check all information before confirming any transaction. Transactions sent to incorrect accounts due to user error are generally irreversible.
            </p>

            <h2 className="font-headline">6. How to Request a Transaction Review</h2>
            <p>
             To report a problem with a transaction, please navigate to our <Link href="/contact-us">Contact Us</Link> page and provide the following information:
              <ul className="list-disc pl-6">
                <li>Your full name and registered email address.</li>
                <li>The transaction ID, date, and amount.</li>
                <li>A clear description of the issue.</li>
                <li>Any relevant supporting documents (e.g., bank statements showing the missing transaction).</li>
              </ul>
            </p>
            <h2 className="font-headline">Contact Us</h2>
            <p>If you have any questions about our Refund Policy, please do not hesitate to contact us through our official support channels.</p>
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
