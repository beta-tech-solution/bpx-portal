
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, FileText, MoreHorizontal, ArrowDownLeft, Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const q = query(collection(db, 'deposits'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const depositsData: Deposit[] = [];
      const userPromises = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        if (!data.userId) {
          depositsData.push({ id: docSnapshot.id, userFullName: 'Unknown User', ...data } as Deposit);
          return null;
        }
        return getDoc(doc(db, 'users', data.userId)).then(userDoc => {
          const userFullName = userDoc.exists() ? userDoc.data().fullName : 'Unknown User';
          depositsData.push({ id: docSnapshot.id, userFullName, ...data } as Deposit);
        });
      });
      
      await Promise.all(userPromises.filter(p => p !== null));
      
      setDeposits(depositsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
        const depositDate = format(new Date(deposit.date), 'yyyy-MM-dd');
        const entry = chartData.find(d => d.date === depositDate);
        if (entry) {
            if (deposit.status === 'Pending') entry.pending++;
            else if (deposit.status === 'Approved') entry.approved++;
            else if (deposit.status === 'Rejected') entry.rejected++;
        }
    });

    return chartData.reverse();
  }, [deposits, timeRange]);

  return (
    <div className="animate-fade-in grid gap-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Deposit Management</CardTitle>
          <CardDescription>Review and manage user deposit requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DepositStatus | 'All')}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
            <DepositContent data={filteredDeposits} loading={loading} isDesktop={isDesktop} />
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
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

function DepositContent({ data, loading, isDesktop }: { data: Deposit[], loading: boolean, isDesktop: boolean }) {
  const { toast } = useToast();

  const handleUpdateStatus = async (deposit: Deposit, newStatus: DepositStatus) => {
    try {
      const batch = writeBatch(db);
      
      const depositRef = doc(db, 'deposits', deposit.id);
      batch.update(depositRef, { status: newStatus });

      if (newStatus === 'Approved') {
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
              <div className="flex justify-between items-start">
                  <div>
                      <p className="font-semibold">{deposit.userFullName}</p>
                      <p className="text-sm text-muted-foreground">{deposit.date}</p>
                  </div>
                  <Badge variant={statusVariant[deposit.status]}>{deposit.status}</Badge>
              </div>
              <p className="font-mono text-xl font-bold">PKR {deposit.amount}</p>
              <div className="flex items-center gap-2 mt-2">
                 <ProofDialog proofUrl={deposit.proofUrl} />
                {deposit.status === 'Pending' && (
                  <ManageDepositDialog deposit={deposit} onUpdateStatus={handleUpdateStatus} />
                )}
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
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />View Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment Proof</DialogTitle>
          <DialogDescription>Review the payment proof uploaded by the user.</DialogDescription>
        </DialogHeader>
        <div className="relative mt-4 min-h-[50vh] w-full">
            <Image src={proofUrl} alt="Payment Proof" layout="fill" objectFit="contain" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ManageDepositDialog({ deposit, onUpdateStatus }: { deposit: Deposit, onUpdateStatus: (deposit: Deposit, status: DepositStatus) => void }) {
  return (
      <Dialog>
          <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex-1">Manage</Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Manage Deposit</DialogTitle>
                  <DialogDescription>
                      Approve or reject the deposit request from {deposit.userFullName}.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <p><strong>User:</strong> {deposit.userFullName}</p>
                  <p><strong>Amount:</strong> PKR {deposit.amount}</p>
                  <p><strong>Date:</strong> {deposit.date}</p>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                      <Button variant="destructive" onClick={() => onUpdateStatus(deposit, 'Rejected')}>
                          <XCircle className="mr-2 h-4 w-4" />Reject
                      </Button>
                  </DialogClose>
                  <DialogClose asChild>
                      <Button variant="secondary" onClick={() => onUpdateStatus(deposit, 'Approved')}>
                          <CheckCircle className="mr-2 h-4 w-4" />Approve
                      </Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  )
}
