
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, db } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface UserData {
    status: 'Active' | 'Pending' | 'Suspended';
    bpexchUsername?: string;
    bpexchPassword?: string;
    balance: number;
}

export default function WithdrawPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'easypaisa' | 'jazzcash'>('bank');

  useEffect(() => {
    if (!user) {
        setCheckingStatus(false);
        return;
    }
    
    setCheckingStatus(true);
    
    // Use a single async function to fetch all initial data
    const fetchInitialData = async () => {
        try {
            const pendingQuery = query(collection(db, 'withdrawals'), where('userId', '==', user.uid), where('status', '==', 'Pending'));
            const pendingSnapshot = await getDocs(pendingQuery);
            setHasPendingWithdrawal(!pendingSnapshot.empty);
        } catch (error) {
            console.error("Error checking pending withdrawals:", error);
            toast({ title: "Error", description: "Could not check withdrawal status.", variant: "destructive" });
        } finally {
            setCheckingStatus(false);
        }
    };
    
    fetchInitialData();

    // Set up listeners for real-time data
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()){
            setUserData(doc.data() as UserData);
        }
    });

    const approvedQuery = query(collection(db, 'withdrawals'), where('userId', '==', user.uid), where('status', '==', 'Approved'));
    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
        let total = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            total += parseFloat(data.amount);
        });
        setTotalWithdrawals(total);
    });

    return () => {
        unsubscribeUser();
        unsubscribeApproved();
    }
  }, [user, toast]);
  
  const isWithdrawalDisabled = 
    hasPendingWithdrawal || 
    isLoading ||
    !userData || 
    userData.status === 'Pending' || 
    !userData.bpexchUsername || 
    !userData.bpexchPassword;

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !userData) {
        toast({ title: "Not Authenticated", description: "You must be logged in to make a withdrawal.", variant: "destructive" });
        return;
    }

    const form = e.currentTarget;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const bankNameInput = form.elements.namedItem('bankName') as HTMLInputElement;
    const bankName = paymentMethod === 'bank' ? bankNameInput.value : (paymentMethod === 'easypaisa' ? 'Easypaisa' : 'Jazzcash');
    const accountNumber = (form.elements.namedItem('accountNumber') as HTMLInputElement).value;
    const accountHolder = (form.elements.namedItem('accountHolder') as HTMLInputElement).value;

    if (isNaN(amount) || amount < 500) {
        toast({ title: "Invalid Amount", description: "Please enter a valid withdrawal amount of at least PKR 500.", variant: "destructive" });
        return;
    }

   // if(amount > userData.balance) {
//     toast({ title: "Insufficient Balance", description: "You do not have enough funds to complete this withdrawal.", variant: "destructive" });
//     return;
// }


    setIsLoading(true);

    try {
        await addDoc(collection(db, 'withdrawals'), {
            userId: user.uid,
            amount: amount.toFixed(2),
            bankName,
            accountNumber,
            accountHolder,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            balance: increment(-amount)
        });

        toast({
            title: "Withdrawal Request Submitted",
            description: `Your request to withdraw PKR ${amount.toFixed(2)} has been received.`,
        });
        setHasPendingWithdrawal(true);
        form.reset();
        setPaymentMethod('bank'); // Reset to default
    } catch (error) {
        console.error("Withdrawal error:", error);
        toast({ title: "Request Failed", description: "There was an issue submitting your request. Please check your connection and try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  if (checkingStatus) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (hasPendingWithdrawal) {
    return (
      <Alert variant="destructive" className="animate-fade-in">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Pending Withdrawal Request</AlertTitle>
        <AlertDescription>
          You already have a withdrawal request pending approval. Please wait for the admin to process it before submitting a new one.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in grid gap-8 w-full">
       {userData && (userData.status === 'Pending' || !userData.bpexchUsername || !userData.bpexchPassword) && !hasPendingWithdrawal && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Account Not Active for Withdrawals</AlertTitle>
                <AlertDescription>
                    Your account must be fully activated by an admin (with BPExch credentials assigned) before you can make a withdrawal request.
                </AlertDescription>
            </Alert>
       )}
      <Card className="w-full transition-shadow hover:shadow-lg">
        <form onSubmit={handleWithdraw}>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="space-y-6">
            <div className="p-4 rounded-lg border bg-muted/50">
                <Label>Total Withdrawn (All Time)</Label>
                <p className="text-3xl font-bold text-primary">PKR {totalWithdrawals.toFixed(2)}</p>
            </div>
            <div>
              <Label htmlFor="amount" className="font-semibold text-base">Amount to Withdraw (Minimum 500)</Label>
              <Input id="amount" name="amount" type="number" placeholder="Enter Amount" required min="500" step="0.01" className="mt-2 text-lg font-bold h-12 p-3" />
            </div>
            
            <div>
                <h3 className="font-semibold text-base mb-2">Payment Method</h3>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)} className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="bank" id="bank" className="sr-only" />
                        <Label htmlFor="bank" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 font-bold cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-primary bg-primary/10' : 'border-border bg-transparent'}`}>
                            Bank
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="easypaisa" id="easypaisa" className="sr-only" />
                        <Label htmlFor="easypaisa" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 font-bold cursor-pointer transition-colors ${paymentMethod === 'easypaisa' ? 'border-primary bg-primary/10' : 'border-border bg-transparent'}`}>
                            Easypaisa
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="jazzcash" id="jazzcash" className="sr-only" />
                        <Label htmlFor="jazzcash" className={`flex flex-col items-center justify-center rounded-md border-2 p-4 font-bold cursor-pointer transition-colors ${paymentMethod === 'jazzcash' ? 'border-primary bg-primary/10' : 'border-border bg-transparent'}`}>
                            Jazzcash
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Account Details</h3>
              <div className="space-y-4">
                {paymentMethod === 'bank' && (
                    <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" name="bankName" placeholder="e.g., National Bank" required={paymentMethod === 'bank'} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input id="accountHolder" name="accountHolder" placeholder="Name as it appears on your account" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" placeholder="Your bank account number" required />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-md space-y-6 mt-6">
            <div>
                <h4 className="font-bold mb-2">Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Withdrawals are processed within 90 minutes.</li>
                    <li>Ensure all account details are correct to avoid delays.</li>
                </ul>
            </div>
            <div className="text-right">
                <h4 className="font-bold mb-2">ہدایات:</h4>
                <ul className="list-disc list-inside space-y-1 rtl font-code">
                    <li>رقم کی واپسی 90 منٹ کے اندر عمل میں لائی جاتی ہے۔</li>
                    <li>تاخیر سے بچنے کے لیے یقینی بنائیں کہ اکاؤنٹ کی تمام تفصیلات درست ہیں۔</li>
                </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button type="submit" className="w-full h-12 text-base font-bold bg-slate-800 hover:bg-slate-700 text-white" disabled={isWithdrawalDisabled}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
            WITHDRAW
          </Button>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
}
