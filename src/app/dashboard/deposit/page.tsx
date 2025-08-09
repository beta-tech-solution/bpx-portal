
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Hourglass, Loader2, AlertCircle, Copy, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [hasPendingDeposit, setHasPendingDeposit] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true); // New loading state
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
        setCheckingStatus(false);
        return;
    }

    // Check for pending deposits
    const pendingQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid), where('status', '==', 'Pending'));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
        setHasPendingDeposit(!snapshot.empty);
        setCheckingStatus(false); // Status checked, turn off loading
    });

    return () => {
        unsubscribePending();
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
    
    if (parseFloat(amount) < 500) {
      toast({
        title: "Invalid Amount",
        description: "The minimum deposit amount is PKR 500.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);

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
        setFileName(null);
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
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFileName(file.name);
    } else {
        setFileName(null);
    }
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
      <div className="flex items-center justify-center h-full animate-fade-in w-full">
        <Card className="w-full">
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

  if (checkingStatus) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="animate-fade-in grid gap-8 w-full">
        {hasPendingDeposit && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Deposit Request</AlertTitle>
                <AlertDescription>
                    You already have a deposit request pending approval. Please wait for the admin to process it before submitting a new one.
                </AlertDescription>
            </Alert>
        )}
        <Card className="w-full transition-shadow hover:shadow-lg">
            <form onSubmit={handleSubmit}>
                <CardContent className="p-6 flex flex-col gap-6">
                    <div>
                        <Label htmlFor="amount" className="font-semibold text-base">Minimum Amount is Rs. 500</Label>
                        <Input id="amount" name="amount" type="number" placeholder="Enter Amount" required min="500" step="0.01" className="mt-2 text-lg font-bold h-12 p-3" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-base">Select Deposit Method</h3>
                        {loadingAccounts ? <Loader2 className="animate-spin"/> : (
                            <Accordion type="single" collapsible className="w-full" defaultValue={accounts[0]?.id}>
                                {accounts.map(account => (
                                    <AccordionItem value={account.id} key={account.id} className="border-0">
                                        <AccordionTrigger className="font-semibold hover:no-underline border rounded-md p-4 bg-muted/30">
                                            <div className="flex items-center gap-4">
                                                <Image src="https://placehold.co/40x40.png" alt="bank logo" width={40} height={40} className="rounded-full" data-ai-hint="payment app" />
                                                <span className="font-bold text-lg">{account.bankName}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <div className="p-4 rounded-b-md border border-t-0 bg-muted/50 space-y-3 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <p><span className="font-semibold text-muted-foreground">Ac #:</span> {account.accountNumber}</p>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(account.accountNumber)}><Copy className="h-4 w-4"/></Button>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p><span className="font-semibold text-muted-foreground">Ac Title#:</span> {account.accountHolder}</p>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(account.accountHolder)}><Copy className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                                {accounts.length === 0 && <p className="text-sm text-muted-foreground p-4 border rounded-md">No deposit accounts are configured by the admin yet.</p>}
                            </Accordion>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="proof" className="font-semibold text-base">Payment Proof</Label>
                        <div className="mt-2">
                            <label htmlFor="proof" className="relative flex items-center justify-center w-full h-12 px-4 border-2 border-dashed rounded-md cursor-pointer bg-muted/30 hover:border-primary">
                               <FileUp className="h-5 w-5 text-muted-foreground mr-2"/>
                               <span className="text-muted-foreground text-sm">{fileName || "Choose File"}</span>
                               <Input id="proof" name="proof" type="file" required className="sr-only" accept="image/*,.pdf" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                     <div className="p-4 border rounded-md space-y-6">
                        <div>
                            <h4 className="font-bold mb-2">Instructions (English):</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
  <li>Transfer the payment to the account mentioned above.</li>
  <li>Upload the payment proof and submit it for verification.</li>
  <li>Payments are typically approved within 30 minutes.</li>
  <li>Ensure you enter the exact amount to prevent any delays.</li>
</ol>


                        </div>
                        <div className="text-right">
  <h4 className="font-bold mb-2">ہدایات (Urdu):</h4>
  <ol dir="rtl" className="list-decimal pr-6 space-y-2 text-sm text-muted-foreground font-code">
  <li>ادائیگی اوپر دیے گئے اکاؤنٹ میں منتقل کریں</li>
  <li>ادائیگی کا ثبوت اپ لوڈ کریں اور جمع کروائیں</li>
  <li>ادائیگی کی منظوری تقریباً 90 منٹ میں دی جائے گی</li>
  <li>ادائیگی میں تاخیر سے بچنے کے لیے درست رقم درج کریں</li>
</ol>

</div>


                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                    <Button type="submit" className="w-full h-12 text-base font-bold bg-slate-800 hover:bg-slate-700 text-white" disabled={isLoading || hasPendingDeposit}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        DEPOSIT
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
