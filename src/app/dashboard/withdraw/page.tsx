
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
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

export default function WithdrawPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check for pending withdrawals
    const pendingQuery = query(collection(db, 'withdrawals'), where('userId', '==', user.uid), where('status', '==', 'Pending'));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
        setHasPendingWithdrawal(!snapshot.empty);
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
        unsubscribePending();
        unsubscribeApproved();
    }
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to make a withdrawal.", variant: "destructive" });
        return;
    }
    setIsLoading(true);

    const form = e.currentTarget;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const bankName = (form.elements.namedItem('bankName') as HTMLInputElement).value;
    const accountNumber = (form.elements.namedItem('accountNumber') as HTMLInputElement).value;
    const accountHolder = (form.elements.namedItem('accountHolder') as HTMLInputElement).value;

    if (isNaN(amount) || amount < 100) {
        toast({ title: "Invalid Amount", description: "Please enter a valid withdrawal amount of at least PKR 100.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
        // Create withdrawal request
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

        // Deduct amount from user's balance
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            balance: increment(-amount)
        });

        toast({
            title: "Withdrawal Request Submitted",
            description: `Your request to withdraw PKR ${amount.toFixed(2)} has been received.`,
        });
        form.reset();
    } catch (error) {
        console.error("Withdrawal error:", error);
        toast({ title: "Request Failed", description: "There was an issue submitting your request.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-in grid gap-8 w-full">
       {hasPendingWithdrawal && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Withdrawal Request</AlertTitle>
                <AlertDescription>
                    You already have a withdrawal request pending approval. Please wait for the admin to process it before submitting a new one.
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
              <Label htmlFor="amount" className="font-semibold text-base">Amount to Withdraw (Minimum 100)</Label>
              <Input id="amount" name="amount" type="number" placeholder="Enter Amount" required min="100" step="0.01" className="mt-2 text-lg font-bold h-12 p-3" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">Account Details</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" placeholder="e.g., National Bank" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" placeholder="Your bank account number" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input id="accountHolder" name="accountHolder" placeholder="Name as it appears on your account" required />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-md space-y-6">
            <div>
                <h4 className="font-bold mb-2">Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Withdrawals are processed within 24-48 hours.</li>
                    <li>Ensure all account details are correct to avoid delays.</li>
                    <li>A small processing fee may apply.</li>
                </ul>
            </div>
            <div className="text-right">
                <h4 className="font-bold mb-2">ہدایات:</h4>
                <ul className="list-disc list-inside space-y-1 rtl font-code">
                    <li>رقم کی واپسی 24-48 گھنٹوں کے اندر عمل میں لائی جاتی ہے۔</li>
                    <li>تاخیر سے بچنے کے لیے یقینی بنائیں کہ اکاؤنٹ کی تمام تفصیلات درست ہیں۔</li>
                    <li>ایک چھوٹی پروسیسنگ فیس لاگو ہوسکتی ہے۔</li>
                </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button type="submit" className="w-full h-12 text-base font-bold bg-slate-800 hover:bg-slate-700 text-white" disabled={isLoading || hasPendingWithdrawal}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
            WITHDRAW
          </Button>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
}
