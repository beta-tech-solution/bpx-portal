
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, ArrowDownLeft, Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

type DepositStatus = 'Pending' | 'Approved' | 'Rejected';

interface Deposit {
  id: string;
  userId: string;
  userFullName: string;
  amount: string;
  date: string;
  status: DepositStatus;
  proofUrl: string;
  createdAt: any;
}

const statusVariant = {
  Pending: "default",
  Approved: "secondary",
  Rejected: "destructive"
} as const;

const depositChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--primary))" },
  approved: { label: "Approved", color: "hsl(var(--accent))" },
  rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DepositStatus | 'All'>('Pending');
  const [timeRange, setTimeRange] = useState("7");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const q = query(collection(db, 'deposits'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const depositsData: Deposit[] = [];
      const userCache = new Map();
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let userFullName = 'Unknown User';

        if(data.userId && userCache.has(data.userId)) {
            userFullName = userCache.get(data.userId);
        } else if (data.userId) {
            try {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    userFullName = userDoc.data().fullName;
                    userCache.set(data.userId, userFullName);
                }
            } catch (e) {
                console.error("Error fetching user for deposit:", e);
            }
        }
        
        depositsData.push({
          id: docSnapshot.id,
          userFullName,
          date: data.createdAt ? format(data.createdAt.toDate(), 'PP') : 'No Date',
          ...data
        } as Deposit);
      }
      
      setDeposits(depositsData.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching deposits:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredDeposits = useMemo(() => {
    if (activeTab === 'All') return deposits;
    return deposits.filter(d => d.status === activeTab);
  }, [deposits, activeTab]);

  const depositChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const chartData: { date: string; pending: number; approved: number; rejected: number }[] = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        chartData.push({ date: formattedDate, pending: 0, approved: 0, rejected: 0 });
    }

    deposits.forEach(deposit => {
        try {
            const depositDate = format(new Date(deposit.createdAt.toDate()), 'yyyy-MM-dd');
            const entry = chartData.find(d => d.date === depositDate);
            if (entry) {
                if (deposit.status === 'Pending') entry.pending++;
                else if (deposit.status === 'Approved') entry.approved++;
                else if (deposit.status === 'Rejected') entry.rejected++;
            }
        } catch (e) {
            // Ignore invalid date format errors for chart processing
        }
    });

    return chartData.reverse();
  }, [deposits, timeRange]);

  return (
    <div className="max-w-7xl mx-auto grid gap-8 animate-fade-in">
      <Card className={isMobile ? "max-w-[400px] mx-auto" : ""}>
        <CardHeader>
          <CardTitle className="font-headline">Deposit Management</CardTitle>
          <CardDescription>Review and manage user deposit requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DepositStatus | 'All')}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-auto sm:h-10">
              <TabsTrigger value="Pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
              <TabsTrigger value="Approved" className="text-xs sm:text-sm">Approved</TabsTrigger>
              <TabsTrigger value="Rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
              <TabsTrigger value="All" className="text-xs sm:text-sm">All</TabsTrigger>
            </TabsList>
            <DepositContent data={filteredDeposits} loading={loading} />
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className={isMobile ? "max-w-[300px] mx-auto" : ""}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-headline flex items-center gap-2"><ArrowDownLeft className="h-5 w-5 text-green-500" />Deposit Activity</CardTitle>
              <CardDescription>Deposit trends over a selected period.</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <ChartContainer config={depositChartConfig} className="h-[300px] min-w-[600px] w-full">
              <BarChart data={depositChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(val) => format(new Date(val), 'MMM d')} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DepositContent({ data, loading }: { data: Deposit[], loading: boolean }) {
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleUpdateStatus = async (deposit: Deposit, newStatus: DepositStatus) => {
    try {
      const batch = writeBatch(db);
      
      const depositRef = doc(db, 'deposits', deposit.id);
      batch.update(depositRef, { status: newStatus });

      if (newStatus === 'Approved') {
          if (!deposit.userId) {
              throw new Error(`Cannot approve deposit ${deposit.id}: No user ID associated.`);
          }
          const userRef = doc(db, 'users', deposit.userId);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
              throw new Error(`User document with ID ${deposit.userId} not found.`);
          }
          batch.update(userRef, { balance: increment(parseFloat(deposit.amount)) });
      }

      await batch.commit();

      toast({ title: `Deposit ${newStatus}`, description: `Deposit from ${deposit.userFullName} for PKR ${deposit.amount} has been ${newStatus.toLowerCase()}.` });
    } catch (error) {
      console.error("Error updating deposit status: ", error);
      toast({ title: "Error", description: "Could not update deposit status. The user may not exist in the database.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (data.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No deposits found.</div>;
  }

  if (!isDesktop) {
    return (
      <div className="space-y-4">
        {data.map((deposit) => (
          <Card key={deposit.id}>
            <CardContent className="p-4 flex flex-col gap-3">
              <div>
                  <p className="font-semibold break-words">{deposit.userFullName}</p>
                  <p className="text-sm text-muted-foreground">{deposit.date}</p>
              </div>
              <p className="font-mono text-xl font-bold">PKR {deposit.amount}</p>
              <div className="flex items-center justify-between gap-2 mt-2">
                 <Badge variant={statusVariant[deposit.status]}>{deposit.status}</Badge>
                 <div className="flex items-center gap-2">
                    <ProofDialog proofUrl={deposit.proofUrl} />
                    {deposit.status === 'Pending' && (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(deposit, 'Approved')}>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(deposit, 'Rejected')}>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell className="font-medium">{deposit.userFullName}</TableCell>
              <TableCell className="font-mono">PKR {deposit.amount}</TableCell>
              <TableCell>{deposit.date}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[deposit.status]}>{deposit.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                 <div className="flex items-center justify-end gap-2">
                    <ProofDialog proofUrl={deposit.proofUrl} />
                    {deposit.status === 'Pending' && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(deposit, 'Approved')}>
                          <CheckCircle className="mr-2 h-4 w-4" />Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(deposit, 'Rejected')}>
                          <XCircle className="mr-2 h-4 w-4" />Reject
                        </Button>
                      </>
                    )}
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProofDialog({ proofUrl }: { proofUrl: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={useMediaQuery("(min-width: 768px)") ? 'sm' : 'icon'}>
          <Eye className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">View Proof</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle>Payment Proof</DialogTitle>
          <DialogDescription>Review the payment proof uploaded by the user.</DialogDescription>
        </DialogHeader>
        <div className="relative mt-4 h-[60vh] w-full">
            {proofUrl ? (
                <Image src={proofUrl} alt="Payment Proof" layout="fill" objectFit="contain" />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No proof available</div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

    