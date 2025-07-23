
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, MoreHorizontal, ArrowUpRight, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { format, subDays } from 'date-fns';

type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected';

interface Withdrawal {
  id: string;
  userId: string;
  userFullName: string;
  amount: string;
  date: string;
  status: WithdrawalStatus;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

const statusVariant = {
    Pending: "default",
    Approved: "secondary",
    Rejected: "destructive"
} as const;

const withdrawalChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    approved: { label: "Approved", color: "hsl(var(--accent))" },
    rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WithdrawalStatus | 'All'>('Pending');
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const withdrawalsData: Withdrawal[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let userFullName = 'Unknown User';
        if (data.userId) {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            userFullName = userDoc.data().fullName;
          }
        }
        withdrawalsData.push({
          id: docSnapshot.id,
          userFullName,
          ...data
        } as Withdrawal);
      }
      setWithdrawals(withdrawalsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredWithdrawals = useMemo(() => {
    if (activeTab === 'All') return withdrawals;
    return withdrawals.filter(d => d.status === activeTab);
  }, [withdrawals, activeTab]);

  const withdrawalChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const chartData: { date: string; pending: number; approved: number; rejected: number }[] = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        chartData.push({ date: formattedDate, pending: 0, approved: 0, rejected: 0 });
    }

    withdrawals.forEach(withdrawal => {
        const withdrawalDate = format(new Date(withdrawal.date), 'yyyy-MM-dd');
        const entry = chartData.find(d => d.date === withdrawalDate);
        if (entry) {
            if (withdrawal.status === 'Pending') entry.pending++;
            else if (withdrawal.status === 'Approved') entry.approved++;
            else if (withdrawal.status === 'Rejected') entry.rejected++;
        }
    });

    return chartData.reverse();
  }, [withdrawals, timeRange]);


  return (
    <div className="animate-fade-in grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Withdrawal Management</CardTitle>
          <CardDescription>Review and manage user withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WithdrawalStatus | 'All')}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="Pending">Pending</TabsTrigger>
                  <TabsTrigger value="Approved">Approved</TabsTrigger>
                  <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="All">All</TabsTrigger>
              </TabsList>
              <TabsContent value="Pending">
                  <WithdrawalTable data={filteredWithdrawals} loading={loading} />
              </TabsContent>
              <TabsContent value="Approved">
                  <WithdrawalTable data={filteredWithdrawals} loading={loading} />
              </TabsContent>
              <TabsContent value="Rejected">
                  <WithdrawalTable data={filteredWithdrawals} loading={loading} />
              </TabsContent>
              <TabsContent value="All">
                  <WithdrawalTable data={filteredWithdrawals} loading={loading} />
              </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="font-headline flex items-center gap-2"><ArrowUpRight className="h-5 w-5 text-red-500" />Withdrawal Activity</CardTitle>
                      <CardDescription>Withdrawal trends over a selected period.</CardDescription>
                  </div>
                   <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[180px]">
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
              <ChartContainer config={withdrawalChartConfig} className="h-[300px] w-full">
                  <BarChart data={withdrawalChartData}>
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
          </CardContent>
      </Card>
    </div>
  )
}

function WithdrawalTable({ data, loading }: { data: Withdrawal[], loading: boolean }) {
    const { toast } = useToast()

    const handleUpdateStatus = async (withdrawal: Withdrawal, newStatus: WithdrawalStatus) => {
        try {
            const withdrawalRef = doc(db, 'withdrawals', withdrawal.id);
            await updateDoc(withdrawalRef, { status: newStatus });
            
            // If rejected, refund the amount to the user's balance.
            // The amount was already deducted upon request. If approved, no balance change needed.
            if (newStatus === 'Rejected') {
                const userRef = doc(db, 'users', withdrawal.userId);
                await updateDoc(userRef, {
                    balance: increment(parseFloat(withdrawal.amount))
                });
            }

            toast({ title: `Withdrawal ${newStatus}`, description: `Withdrawal from ${withdrawal.userFullName} for PKR ${withdrawal.amount} has been ${newStatus.toLowerCase()}.` });
        } catch (error) {
            console.error("Error updating withdrawal status: ", error);
            toast({ title: "Error", description: "Could not update withdrawal status.", variant: "destructive" });
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
        return <div className="text-center text-muted-foreground p-8">No withdrawals found.</div>
    }
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                    <div className="font-medium">{item.userFullName}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                </TableCell>
                <TableCell>
                    <div className="font-mono font-bold">PKR {item.amount}</div>
                    <div className="text-xs text-muted-foreground">{item.bankName} - {item.accountNumber} ({item.accountHolder})</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    {item.status === 'Pending' && (
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="text-green-600" onClick={() => handleUpdateStatus(item, 'Approved')}>
                                <CheckCircle className="mr-2 h-4 w-4"/>Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(item, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4"/>Reject
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}
