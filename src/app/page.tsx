
"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, CheckCircle, ChevronDown, DollarSign, Send, Landmark, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground animate-fade-in">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline">BPX Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center overflow-hidden">
             <div
                className="absolute inset-0 -z-10 h-full w-full bg-background"
                style={{
                backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.1), transparent 2px)',
                backgroundSize: '32px 32px',
                }}
            />
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
              Seamless Financial Management, <br />
              <span className="text-primary">All in One Place.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              BPX Portal is your secure gateway to manage deposits, transfers, and withdrawals with ease and confidence.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Features <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 space-y-24">
            
            {/* Deposit Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-base py-1 px-3">
                  <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                  Effortless Deposits
                </Badge>
                <h2 className="text-3xl font-bold font-headline">Fund Your Account Securely</h2>
                <p className="text-muted-foreground">
                  Quickly add funds to your wallet using our straightforward deposit process. Upload your proof of payment, and we'll handle the rest, ensuring your balance is updated promptly upon confirmation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Multiple deposit accounts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Secure proof upload</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Fast confirmation times</li>
                </ul>
              </div>
              <div className="relative h-[450px]">
                <Image src="https://placehold.co/400x600.png" data-ai-hint="deposit screen" alt="Deposit Screen" width={300} height={550} className="rounded-2xl shadow-2xl mx-auto border-4 border-foreground z-10 relative animate-fade-in" />
              </div>
            </div>

            {/* Transfer Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[450px] hidden md:block">
                 <Image src="https://placehold.co/400x600.png" data-ai-hint="transfer screen" alt="Transfer Screen" width={300} height={550} className="rounded-2xl shadow-2xl mx-auto border-4 border-foreground z-10 relative animate-fade-in" />
              </div>
              <div className="space-y-4">
                 <Badge variant="secondary" className="text-base py-1 px-3">
                  <Send className="mr-2 h-5 w-5 text-blue-500" />
                  Instant Transfers
                </Badge>
                <h2 className="text-3xl font-bold font-headline">Move Funds to BPExch</h2>
                <p className="text-muted-foreground">
                  Need to fund your BPExch account? Transfer your balance from the portal instantly. Our system ensures your funds are moved swiftly and securely, ready for you to use.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> From wallet to BPExch</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Real-time balance deduction</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Full transaction history</li>
                </ul>
              </div>
               <div className="relative h-[450px] md:hidden">
                 <Image src="https://placehold.co/400x600.png" data-ai-hint="transfer screen" alt="Transfer Screen" width={300} height={550} className="rounded-2xl shadow-2xl mx-auto border-4 border-foreground z-10 relative animate-fade-in" />
              </div>
            </div>
            
            {/* Withdrawal Feature */}
             <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-base py-1 px-3">
                  <Landmark className="mr-2 h-5 w-5 text-red-500" />
                  Flexible Withdrawals
                </Badge>
                <h2 className="text-3xl font-bold font-headline">Access Your Funds Easily</h2>
                <p className="text-muted-foreground">
                  Withdraw your funds directly to your bank account. Submit a request with your details, and our team will process it, ensuring you get your money when you need it.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Secure bank account details</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Admin approval for security</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Clear status tracking</li>
                </ul>
              </div>
              <div className="relative h-[450px]">
                <Image src="https://placehold.co/400x600.png" data-ai-hint="withdrawal screen" alt="Withdrawal Screen" width={300} height={550} className="rounded-2xl shadow-2xl mx-auto border-4 border-foreground z-10 relative animate-fade-in" />
              </div>
            </div>

          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-2">Find answers to common questions about the BPX Portal.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is the BPX Portal secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, security is our top priority. We use industry-standard encryption, secure authentication, and admin approvals for critical transactions like withdrawals to protect your account and data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How long do deposits and withdrawals take?</AccordionTrigger>
                <AccordionContent>
                  Deposits are typically confirmed within a few hours after you upload your proof of payment. Withdrawals are processed within 24-48 hours after your request is submitted and approved.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I manage my account on mobile?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. The BPX Portal is fully responsive and designed to work seamlessly across all devices, including desktops, tablets, and smartphones.
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-4">
                <AccordionTrigger>What is the relationship between the portal and BPExch?</AccordionTrigger>
                <AccordionContent>
                  The BPX Portal is the official platform for managing the funds associated with your BPExch account. You use the portal to deposit money into your wallet and then transfer it to BPExch for use.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold font-headline">Ready to Get Started?</h2>
                <p className="mt-2 text-muted-foreground">Create your free account today and take control of your finances.</p>
                <Button size="lg" asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between py-6 px-4 md:px-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BPX Portal. All rights reserved.</p>
          <div className="flex gap-4">
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
