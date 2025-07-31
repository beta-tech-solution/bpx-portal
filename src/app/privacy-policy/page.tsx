
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppLogo from "@/components/app-logo";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
            <AppLogo className="w-8 h-8 text-primary" />
            <span className="font-headline text-lg">BPX Master</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login" prefetch={false}>
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup" prefetch={false}>
                Sign Up
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 BPX Master. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/about-us" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            About Us
          </Link>
          <Link href="/contact-us" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Contact Us
          </Link>
          <Link href="/terms-of-service" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
           <Link href="/refund-policy" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Refund Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
