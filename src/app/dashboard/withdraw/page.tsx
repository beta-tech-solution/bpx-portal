
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from '@/components/language-toggle';
import { Landmark, TrendingDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { auth, db } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { format } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

interface WithdrawalChartData {
  month: string;
  amount: number;
}
  
const chartConfig = {
  amount: {
    label: "Withdrawals",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export default function WithdrawPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<WithdrawalChartData[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeBalance = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setBalance(doc.data().balance ?? 0);
        }
    });

    const q = query(collection(db, 'withdrawals'), where('userId', '==', user.uid), where('status', '==', 'Approved'));
    const unsubscribeChart = onSnapshot(q, (snapshot) => {
        const monthlyData: { [key: string]: number } = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.date);
            const month = format(date, 'MMM');
            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(data.amount);
        });
        const formattedChartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
        setChartData(formattedChartData);
    });

    return () => {
        unsubscribeBalance();
        unsubscribeChart();
    };
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

    if (isNaN(amount) || amount <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid withdrawal amount.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    if (amount > balance) {
        toast({ title: "Insufficient Funds", description: "You do not have enough balance for this withdrawal.", variant: "destructive" });
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
    <div className="animate-fade-in grid gap-8">
      <Card className={`w-full max-w-2xl mx-auto ${isMobile ? "max-w-[420px]" : ""}`}>
        <form onSubmit={handleWithdraw}>
        <CardHeader>
          <CardTitle className="font-headline">Request Withdrawal</CardTitle>
          <CardDescription>Withdraw funds from your wallet to your bank account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <div className="space-y-6">
            <div className="p-4 rounded-lg border bg-muted/50">
                <Label>Current Wallet Balance</Label>
                <p className="text-3xl font-bold text-primary">PKR {balance.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-headline">Amount (PKR)</Label>
              <Input id="amount" name="amount" type="number" placeholder="0.00" required step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName" className="font-headline">Bank Name</Label>
              <Input id="bankName" name="bankName" placeholder="e.g., National Bank" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="font-headline">Account Number</Label>
              <Input id="accountNumber" name="accountNumber" placeholder="Your bank account number" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="accountHolder" className="font-headline">Account Holder Name</Label>
              <Input id="accountHolder" name="accountHolder" placeholder="Name as it appears on your account" required />
            </div>
          </div>
          <div>
            <LanguageToggle
                className="mt-2"
                en={
                    <>
                        <h4 className="font-bold mb-2 font-headline">Instructions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Withdrawals are processed within 24-48 hours.</li>
                            <li>Ensure all account details are correct to avoid delays.</li>
                            <li>A small processing fee may apply.</li>
                        </ul>
                    </>
                }
                ur={
                    <>
                        <h4 className="font-bold mb-2 font-headline">ہدایات:</h4>
                        <ul className="list-disc list-inside space-y-1 rtl">
                            <li>رقم کی واپسی 24-48 گھنٹوں کے اندر عمل میں لائی جاتی ہے۔</li>
                            <li>تاخیر سے بچنے کے لیے یقینی بنائیں کہ اکاؤنٹ کی تمام تفصیلات درست ہیں۔</li>
                            <li>ایک چھوٹی پروسیسنگ فیس لاگو ہوسکتی ہے۔</li>
                        </ul>
                    </>
                }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
            Submit Withdrawal Request
          </Button>
        </CardFooter>
        </form>
      </Card>

       <Card className={`w-full max-w-2xl mx-auto ${isMobile ? "max-w-[320px]" : ""}`}>
        <CardHeader className="items-center">
            <TrendingDown className="w-8 h-8 text-destructive" />
            <CardTitle className="font-headline">Your Withdrawal History</CardTitle>
            <CardDescription>
            Monthly approved withdrawal amounts over the last 6 months.
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
