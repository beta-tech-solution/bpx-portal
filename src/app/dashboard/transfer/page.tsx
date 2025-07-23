
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Send, TrendingUp, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { auth, db } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface Transfer {
  id: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Transferred' | 'Issue';
  instruction?: string;
}

interface TransferChartData {
  month: string;
  amount: number;
}
  
const chartConfig = {
    amount: {
      label: "Transfers",
      color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export default function TransferPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);
  const [chartData, setChartData] = useState<TransferChartData[]>([]);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeBalance = onSnapshot(userDocRef, (doc) => {
        if(doc.exists()) {
            setBalance(doc.data().balance ?? 0);
        }
    });

    const transfersQuery = query(
        collection(db, 'transfers'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
    );
    const unsubscribeTransfers = onSnapshot(transfersQuery, (snapshot) => {
        const transfers: Transfer[] = [];
        const monthlyData: { [key: string]: number } = {};
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            transfers.push({
                id: doc.id,
                date: data.date,
                amount: data.amount,
                status: data.status,
                instruction: data.instruction
            });

             if (data.status === 'Transferred' || data.status === 'Completed') {
                const date = new Date(data.date);
                const month = format(date, 'MMM');
                monthlyData[month] = (monthlyData[month] || 0) + parseFloat(data.amount);
            }
        });

        // Get all transfers for chart data
        const allTransfersQuery = query(collection(db, 'transfers'), where('userId', '==', user.uid));
        onSnapshot(allTransfersQuery, (allDocsSnapshot) => {
            const allMonthlyData: { [key: string]: number } = {};
            allDocsSnapshot.forEach(doc => {
                 const data = doc.data();
                 if (data.status === 'Transferred' || data.status === 'Completed') {
                    const date = new Date(data.date);
                    const month = format(date, 'MMM');
                    allMonthlyData[month] = (allMonthlyData[month] || 0) + parseFloat(data.amount);
                }
            });
            const formattedChartData = Object.entries(allMonthlyData).map(([month, amount]) => ({ month, amount }));
            setChartData(formattedChartData);
        });

        setRecentTransfers(transfers);
    });

    return () => {
        unsubscribeBalance();
        unsubscribeTransfers();
    };
  }, [user]);

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to make a transfer.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    const amountInput = e.currentTarget.elements.namedItem('amount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid transfer amount.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    if (amount > balance) {
        toast({ title: "Insufficient Funds", description: "You do not have enough balance to make this transfer.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
        await addDoc(collection(db, 'transfers'), {
            userId: user.uid,
            amount: amount.toFixed(2),
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            balance: increment(-amount)
        });

        toast({
            title: "Transfer Initiated",
            description: `Your transfer of PKR ${amount.toFixed(2)} has been successfully submitted.`,
        });
        amountInput.value = '';
    } catch (error) {
        console.error("Transfer error:", error);
        toast({ title: "Transfer Failed", description: "There was an issue submitting your transfer.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const statusVariant = {
      Pending: "default",
      Transferred: "secondary",
      Issue: "destructive"
  } as const;

  return (
    <div className="max-w-4xl mx-auto grid gap-8 animate-fade-in">
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <Card>
                <form onSubmit={handleTransfer}>
                <CardHeader>
                    <CardTitle className="font-headline">Transfer to BPExch</CardTitle>
                    <CardDescription>Move funds from your wallet to your BPExch account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg border bg-muted/50">
                    <Label>Current Wallet Balance</Label>
                    <p className="text-3xl font-bold text-primary">PKR {balance.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="amount" className="font-headline">Transfer Amount (PKR)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="0.00" required step="0.01" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Transfer Now
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Transfers</CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                            <TableCell>
                            <div className="font-medium">{transfer.date}</div>
                             <div className="flex items-center gap-2 mt-1">
                                <Badge variant={statusVariant[transfer.status]} className="font-normal">
                                    {transfer.status}
                                </Badge>
                                {transfer.status === 'Issue' && transfer.instruction && (
                                     <UiTooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{transfer.instruction}</p>
                                        </TooltipContent>
                                    </UiTooltip>
                                )}
                             </div>
                            </TableCell>
                            <TableCell className="text-right font-medium font-mono">PKR {transfer.amount}</TableCell>
                        </TableRow>
                        ))}
                         {recentTransfers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">No recent transfers.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </TooltipProvider>
            </CardContent>
            </Card>
        </div>
      </div>

       <Card>
        <CardHeader className="items-center">
            <TrendingUp className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline">Your Transfer Activity</CardTitle>
            <CardDescription>
            Monthly transfer amounts over the last 6 months.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
            </BarChart>
            </ChartContainer>
        </CardContent>
        </Card>
    </div>
  );
}

    