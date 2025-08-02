
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LanguageToggle } from '@/components/language-toggle';
import { UploadCloud, Hourglass, TrendingUp, Loader2, Landmark, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DepositChartData {
  month: string;
  amount: number;
}
  
const chartConfig = {
  amount: {
    label: "Deposits",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const CLOUDINARY_CLOUD_NAME = "datq7sbdp";
const CLOUDINARY_UPLOAD_PRESET = "bpxmaster";

interface Account {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function DepositPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [progress, setProgress] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [chartData, setChartData] = useState<DepositChartData[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [hasPendingDeposit, setHasPendingDeposit] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!user) return;

    // Check for pending deposits
    const pendingQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid), where('status', '==', 'Pending'));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
        setHasPendingDeposit(!snapshot.empty);
    });

    const approvedQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid), where('status', '==', 'Approved'));
    const unsubscribeApproved = onSnapshot(approvedQuery, (querySnapshot) => {
        const monthlyData: { [key: string]: number } = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = new Date(data.date);
            const month = format(date, 'MMM');
            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(data.amount);
        });

        const formattedChartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
        setChartData(formattedChartData);
    });

    return () => {
        unsubscribePending();
        unsubscribeApproved();
    };
  }, [user]);

  useEffect(() => {
    const fetchAccounts = async () => {
        setLoadingAccounts(true);
        const settingsDocRef = doc(db, "settings", "depositAccounts");
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            setAccounts(docSnap.data().accounts || []);
        }
        setLoadingAccounts(false);
    }
    fetchAccounts();
  }, []);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to make a deposit.", variant: "destructive" });
        return;
    }
    
    if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME" || CLOUDINARY_UPLOAD_PRESET === "YOUR_UPLOAD_PRESET") {
        toast({ title: "Configuration Needed", description: "Cloudinary is not configured. Please update the details.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    const form = event.currentTarget;
    const amountInput = form.elements.namedItem('amount') as HTMLInputElement;
    const fileInput = form.elements.namedItem('proof') as HTMLInputElement;
    
    const amount = amountInput.value;
    const file = fileInput.files?.[0];

    if (!amount || !file) {
      toast({
        title: "Error",
        description: "Please enter an amount and upload a proof of payment.",
        variant: "destructive",
      })
      setIsLoading(false);
      return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const cloudinaryData = await uploadResponse.json();
        const proofUrl = cloudinaryData.secure_url;

        await addDoc(collection(db, 'deposits'), {
            userId: user.uid,
            amount,
            proofUrl,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });
        
        setIsSubmitted(true);
        form.reset();
        toast({
            title: "Deposit Submitted",
            description: "We have received your proof and will confirm it shortly.",
        });

    } catch (error) {
        console.error("Deposit error:", error);
        toast({
            title: "Submission Failed",
            description: "There was an error submitting your deposit. Please try again.",
            variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} Copied!` });
  }

  useEffect(() => {
    if (isSubmitted) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [isSubmitted]);

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <Card className="w-full max-w-lg">
          <CardHeader className="items-center text-center">
            <Hourglass className="w-12 h-12 text-primary mb-2 animate-spin-slow" />
            <CardTitle className="font-headline">Deposit Awaiting Confirmation</CardTitle>
            <CardDescription>Your deposit is being reviewed by our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">Waiting for Admin Confirmation... ({progress}%)</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>Make Another Deposit</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid gap-8">
        {hasPendingDeposit && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Deposit Request</AlertTitle>
                <AlertDescription>
                    You already have a deposit request pending approval. Please wait for the admin to process it before submitting a new one.
                </AlertDescription>
            </Alert>
        )}
        <Card className={`w-full max-w-2xl mx-auto ${isMobile ? "max-w-[420px]" : ""}`}>
            <CardHeader>
                <CardTitle className="font-headline">Deposit Funds</CardTitle>
                <CardDescription>Follow the instructions below to add funds to your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="flex flex-col gap-8">
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="amount" className="font-semibold font-headline">Amount (PKR)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="1000.00" required step="0.01" className="mt-2 text-3xl font-bold h-auto p-2" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 font-headline">Deposit Account Details</h3>
                            {loadingAccounts ? <Loader2 className="animate-spin"/> : (
                                <Accordion type="single" collapsible className="w-full" defaultValue={accounts[0]?.id}>
                                    {accounts.map(account => (
                                        <AccordionItem value={account.id} key={account.id}>
                                            <AccordionTrigger className="font-semibold hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <Landmark className="h-5 w-5 text-primary"/>
                                                    {account.bankName}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="p-4 rounded-lg border bg-muted/50 space-y-2 text-sm">
                                                    <div className="flex justify-between items-center">
                                                        <p><span className="font-semibold">Bank Name:</span> {account.bankName}</p>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(account.bankName, 'Bank Name')}><Copy className="h-4 w-4"/></Button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p><span className="font-semibold">Account Number:</span> {account.accountNumber}</p>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(account.accountNumber, 'Account Number')}><Copy className="h-4 w-4"/></Button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p><span className="font-semibold">Account Holder:</span> {account.accountHolder}</p>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(account.accountHolder, 'Account Holder')}><Copy className="h-4 w-4"/></Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                    {accounts.length === 0 && <p className="text-sm text-muted-foreground">No deposit accounts are configured by the admin yet.</p>}
                                </Accordion>
                            )}
                        </div>
                         <div>
                            <Label htmlFor="proof" className="font-semibold font-headline">Upload Payment Proof</Label>
                            <Input id="proof" name="proof" type="file" required className="mt-2" accept="image/*,.pdf" />
                            <p className="text-xs text-muted-foreground mt-1">Please upload an image or PDF of your transaction receipt.</p>
                        </div>
                    </div>
                    <div>
                         <LanguageToggle
                            en={<p>Please ensure the deposit amount is exact. Upload a clear screenshot or PDF of the transaction. Funds will be credited to your account upon confirmation.</p>}
                            ur={<p className="leading-relaxed">براہ کرم یقینی بنائیں کہ جمع کی رقم درست ہے۔ لین دین کی واضح اسکرین شاٹ یا پی ڈی ایف اپ لوڈ کریں۔ تصدیق کے بعد فنڈز آپ کے اکاؤنٹ میں جمع کر دیے جائیں گے۔</p>}
                         />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || hasPendingDeposit}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Submit Deposit
                    </Button>
                </CardFooter>
            </form>
        </Card>
         <Card className={`w-full max-w-2xl mx-auto ${isMobile ? "max-w-[320px]" : ""}`}>
            <CardHeader className="items-center">
              <TrendingUp className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline">Your Deposit Trends</CardTitle>
              <CardDescription>
                Monthly approved deposit amounts over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }} >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area dataKey="amount" type="natural" fill="var(--color-amount)" fillOpacity={0.4} stroke="var(--color-amount)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
