
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

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
  createdAt: any;
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const withdrawalsData: Withdrawal[] = [];
      const userCache = new Map();
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let userFullName = 'Unknown User';
        if (data.userId) {
            if(userCache.has(data.userId)) {
                userFullName = userCache.get(data.userId);
            } else {
                try {
                    const userDoc = await getDoc(doc(db, 'users', data.userId));
                    if (userDoc.exists()) {
                        userFullName = userDoc.data().fullName;
                        userCache.set(data.userId, userFullName);
                    }
                } catch(e) {
                    console.error("Error fetching user for withdrawal:", e);
                }
            }
        }
        withdrawalsData.push({
          id: docSnapshot.id,
          userFullName,
          date: data.createdAt ? format(data.createdAt.toDate(), 'PP') : 'No Date',
          ...data
        } as Withdrawal);
      }
      setWithdrawals(withdrawalsData.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching withdrawals:", error);
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
        try {
            const withdrawalDate = format(new Date(withdrawal.date), 'yyyy-MM-dd');
            const entry = chartData.find(d => d.date === withdrawalDate);
            if (entry) {
                if (withdrawal.status === 'Pending') entry.pending++;
                else if (withdrawal.status === 'Approved') entry.approved++;
                else if (withdrawal.status === 'Rejected') entry.rejected++;
            }
        } catch(e) {
             // Ignore invalid date format errors for chart processing
        }
    });

    return chartData.reverse();
  }, [withdrawals, timeRange]);

  if (!mounted) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="animate-fade-in grid gap-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Withdrawal Management</CardTitle>
          <CardDescription>Review and manage user withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WithdrawalStatus | 'All')}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-auto sm:h-10">
                  <TabsTrigger value="Pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                  <TabsTrigger value="Approved" className="text-xs sm:text-sm">Approved</TabsTrigger>
                  <TabsTrigger value="Rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
                  <TabsTrigger value="All" className="text-xs sm:text-sm">All</TabsTrigger>
              </TabsList>
              <WithdrawalContent data={filteredWithdrawals} loading={loading} isDesktop={isDesktop} />
          </Tabs>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                      <CardTitle className="font-headline flex items-center gap-2"><ArrowUpRight className="h-5 w-5 text-red-500" />Withdrawal Activity</CardTitle>
                      <CardDescription>Withdrawal trends over a selected period.</CardDescription>
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
              <ChartContainer config={withdrawalChartConfig} className="h-[300px] min-w-[600px] w-full">
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
            </div>
          </CardContent>
      </Card>
    </div>
  )
}

function WithdrawalContent({ data, loading, isDesktop }: { data: Withdrawal[], loading: boolean, isDesktop: boolean }) {
    const { toast } = useToast()

    const handleUpdateStatus = async (withdrawal: Withdrawal, newStatus: WithdrawalStatus) => {
        try {
            const batch = writeBatch(db);
            const withdrawalRef = doc(db, 'withdrawals', withdrawal.id);
            batch.update(withdrawalRef, { status: newStatus });
            
            // If rejected, refund the amount to the user's balance.
            // The amount was already deducted upon request. If approved, no balance change needed.
            if (newStatus === 'Rejected') {
                if (!withdrawal.userId) {
                    throw new Error(`Cannot reject withdrawal ${withdrawal.id}: No user ID associated.`);
                }
                const userRef = doc(db, 'users', withdrawal.userId);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    throw new Error(`User document with ID ${withdrawal.userId} not found.`);
                }
                batch.update(userRef, { balance: increment(parseFloat(withdrawal.amount)) });
            }

            await batch.commit();

            toast({ title: `Withdrawal ${newStatus}`, description: `Withdrawal from ${withdrawal.userFullName} for PKR ${withdrawal.amount} has been ${newStatus.toLowerCase()}.` });
        } catch (error) {
            console.error("Error updating withdrawal status: ", error);
            toast({ title: "Error", description: "Could not update withdrawal status. The user may not exist in the database.", variant: "destructive" });
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

    if (!isDesktop) {
        return (
          <div className="space-y-4">
            {data.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="font-semibold break-words">{item.userFullName}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                  </div>
                  <p className="font-mono text-xl font-bold">PKR {item.amount}</p>
                   <div className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
                        <p>{item.bankName}</p>
                        <p>{item.accountNumber}</p>
                        <p>{item.accountHolder}</p>
                    </div>
                  {item.status === 'Pending' && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item, 'Approved')}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="sr-only">Approve</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item, 'Rejected')}>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Reject</span>
                    </Button>
                  </div>
                )}
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
              <TableHead>Details</TableHead>
              <TableHead>Amount</TableHead>
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
                    <div className="font-semibold">{item.bankName}</div>
                    <div className="text-xs text-muted-foreground">{item.accountNumber} ({item.accountHolder})</div>
                </TableCell>
                <TableCell className="font-mono">PKR {item.amount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    {item.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(item, 'Approved')}>
                                <CheckCircle className="mr-2 h-4 w-4"/>Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(item, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4"/>Reject
                            </Button>
                        </div>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    )
}

    