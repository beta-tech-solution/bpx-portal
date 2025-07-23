
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, MoreHorizontal, Send, Loader2, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { collection, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { format, subDays } from 'date-fns';

type TransferStatus = 'Pending' | 'Transferred' | 'Issue';

interface Transfer {
  id: string;
  userId: string;
  userFullName: string;
  amount: string;
  date: string;
  status: TransferStatus;
  instruction?: string;
}

const statusVariant = {
  Pending: "default",
  Transferred: "secondary",
  Issue: "destructive"
} as const;

const transferChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--primary))" },
  transferred: { label: "Transferred", color: "hsl(var(--accent))" },
  issue: { label: "Issue", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TransferStatus | 'All'>('Pending');
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    const q = query(collection(db, 'transfers'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const transfersData: Transfer[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let userFullName = 'Unknown User';
        if (data.userId) {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            userFullName = userDoc.data().fullName;
          }
        }
        transfersData.push({
          id: docSnapshot.id,
          userFullName,
          ...data
        } as Transfer);
      }
      setTransfers(transfersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredTransfers = useMemo(() => {
    if (activeTab === 'All') return transfers;
    return transfers.filter(d => d.status === activeTab);
  }, [transfers, activeTab]);
  
  const transferChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const chartData: { date: string; pending: number; transferred: number; issue: number }[] = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        chartData.push({ date: formattedDate, pending: 0, transferred: 0, issue: 0 });
    }

    transfers.forEach(transfer => {
        const transferDate = format(new Date(transfer.date), 'yyyy-MM-dd');
        const entry = chartData.find(d => d.date === transferDate);
        if (entry) {
            if (transfer.status === 'Pending') entry.pending++;
            else if (transfer.status === 'Transferred') entry.transferred++;
            else if (transfer.status === 'Issue') entry.issue++;
        }
    });

    return chartData.reverse();
  }, [transfers, timeRange]);

  return (
    <div className="animate-fade-in grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Transfer Management</CardTitle>
          <CardDescription>Manage user transfers to their BPExch accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransferStatus | 'All')}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Transferred">Transferred</TabsTrigger>
              <TabsTrigger value="Issue">Issue</TabsTrigger>
              <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
            <TabsContent value="Pending">
              <TransferTable data={filteredTransfers} loading={loading} />
            </TabsContent>
            <TabsContent value="Transferred">
              <TransferTable data={filteredTransfers} loading={loading} />
            </TabsContent>
            <TabsContent value="Issue">
              <TransferTable data={filteredTransfers} loading={loading} />
            </TabsContent>
            <TabsContent value="All">
              <TransferTable data={filteredTransfers} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-muted-foreground" />Transfer Activity</CardTitle>
              <CardDescription>Transfer trends over a selected period.</CardDescription>
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
          <ChartContainer config={transferChartConfig} className="h-[300px] w-full">
            <BarChart data={transferChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(val) => format(new Date(val), 'MMM d')} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="transferred" fill="var(--color-transferred)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="issue" fill="var(--color-issue)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function TransferTable({ data, loading }: { data: Transfer[], loading: boolean }) {
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [instruction, setInstruction] = useState("");
  const [isInstructionSaving, setIsInstructionSaving] = useState(false);

  const handleUpdateStatus = async (transfer: Transfer, newStatus: TransferStatus) => {
    try {
      const transferRef = doc(db, 'transfers', transfer.id);
      await updateDoc(transferRef, { status: newStatus });
      toast({ title: `Transfer status updated to ${newStatus}` });
    } catch (error) {
      console.error("Error updating transfer status: ", error);
      toast({ title: "Error", description: "Could not update transfer status.", variant: "destructive" });
    }
  };

  const handleOpenInstructionDialog = (transfer: Transfer) => {
      setSelectedTransfer(transfer);
      setInstruction(transfer.instruction || "");
  }

  const handleSaveInstruction = async () => {
      if (!selectedTransfer) return;
      setIsInstructionSaving(true);
      try {
          const transferRef = doc(db, 'transfers', selectedTransfer.id);
          await updateDoc(transferRef, { instruction: instruction });
          toast({ title: "Instruction Saved", description: "The instruction has been saved for the user."});
          setSelectedTransfer(null);
          setInstruction("");
      } catch (error) {
          console.error("Error saving instruction:", error);
          toast({ title: "Error", description: "Could not save instruction.", variant: "destructive"});
      } finally {
          setIsInstructionSaving(false);
      }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No transfers found.</div>
  }

  return (
    <>
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
        {data.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">{transfer.userFullName}</TableCell>
            <TableCell className="font-mono">PKR {transfer.amount}</TableCell>
            <TableCell>{transfer.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[transfer.status]}>{transfer.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {transfer.status === 'Pending' && (
                    <>
                      <DropdownMenuItem className="text-green-600" onClick={() => handleUpdateStatus(transfer, 'Transferred')}>
                        <CheckCircle className="mr-2 h-4 w-4" />Mark as Transferred
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-600" onClick={() => handleUpdateStatus(transfer, 'Issue')}>
                        <AlertTriangle className="mr-2 h-4 w-4" />Mark as Issue
                      </DropdownMenuItem>
                    </>
                  )}
                  {transfer.status === 'Issue' && (
                  <DropdownMenuItem onClick={() => handleOpenInstructionDialog(transfer)}>
                    <MessageSquare className="mr-2 h-4 w-4" />Add/Edit Instruction
                  </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Dialog open={!!selectedTransfer} onOpenChange={(isOpen) => !isOpen && setSelectedTransfer(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Instruction for Transfer</DialogTitle>
                <DialogDescription>
                    Provide instructions for the user regarding the issue with their transfer of PKR {selectedTransfer?.amount} for {selectedTransfer?.userFullName}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                    placeholder="Type your instruction here..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setSelectedTransfer(null)}>Cancel</Button>
                <Button onClick={handleSaveInstruction} disabled={isInstructionSaving}>
                    {isInstructionSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Instruction
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

    