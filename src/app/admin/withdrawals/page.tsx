
"use client"

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, ArrowUpRight, Loader2, Upload, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, doc, getDoc, updateDoc, increment, writeBatch, orderBy } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
  adminProofUrl?: string;
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
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const userCache = new Map();
            const withdrawalsData: Withdrawal[] = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
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
                    return {
                        id: docSnapshot.id,
                        userFullName,
                        date: data.createdAt ? format(data.createdAt.toDate(), 'PP') : 'No Date',
                        ...data
                    } as Withdrawal;
                })
            );
            
            setWithdrawals(withdrawalsData);
        } catch (error) {
            console.error("Error fetching withdrawals:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchWithdrawals();
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
            const withdrawalDate = format(new Date(withdrawal.createdAt.toDate()), 'yyyy-MM-dd');
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

  return (
    <div className="max-w-7xl mx-auto grid gap-8 animate-fade-in">
      <Card className={isMobile ? "max-w-[400px] mx-auto" : ""}>
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
              <WithdrawalContent data={filteredWithdrawals} loading={loading} />
          </Tabs>
        </CardContent>
      </Card>

      <Card className={isMobile ? "max-w-[300px] mx-auto" : ""}>
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

function WithdrawalContent({ data, loading }: { data: Withdrawal[], loading: boolean }) {
    const { toast } = useToast()
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);

    const handleUpdateStatus = async (withdrawal: Withdrawal, newStatus: WithdrawalStatus) => {
        try {
            const batch = writeBatch(db);
            const withdrawalRef = doc(db, 'withdrawals', withdrawal.id);
            batch.update(withdrawalRef, { status: newStatus });
            
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
    
    const handleProofUploadClick = (withdrawalId: string) => {
        setSelectedWithdrawalId(withdrawalId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedWithdrawalId) return;

        const file = e.target.files[0];
        toast({ title: "Uploading...", description: "Your proof is being uploaded." });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST', body: formData,
            });

            if (!uploadResponse.ok) throw new Error('Upload to Cloudinary failed.');

            const data = await uploadResponse.json();
            const adminProofUrl = data.secure_url;

            const withdrawalRef = doc(db, 'withdrawals', selectedWithdrawalId);
            await updateDoc(withdrawalRef, { adminProofUrl });

            toast({ title: "Upload Complete", description: "Admin proof has been saved." });
        } catch (error) {
            console.error("Error uploading proof:", error);
            toast({ title: "Upload Failed", description: "Could not upload the proof.", variant: "destructive" });
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = "";
            setSelectedWithdrawalId(null);
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
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
            {data.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div>
                      <p className="font-semibold break-words">{item.userFullName}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <p className="font-mono text-xl font-bold">PKR {item.amount}</p>
                   <div className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
                        <p>{item.bankName}</p>
                        <p>{item.accountNumber}</p>
                        <p>{item.accountHolder}</p>
                    </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    <div className="flex items-center gap-2">
                        {item.adminProofUrl && <ProofDialog proofUrl={item.adminProofUrl} />}
                        <Button variant="outline" size="icon" title="Upload Proof" onClick={() => handleProofUploadClick(item.id)}>
                            <Upload className="h-4 w-4" />
                        </Button>
                        {item.status === 'Pending' && (
                        <>
                            <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item, 'Approved')}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item, 'Rejected')}>
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
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
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
                     <div className="flex items-center justify-end gap-2">
                        {item.adminProofUrl && <ProofDialog proofUrl={item.adminProofUrl} />}
                        <Button variant="outline" size="icon" title="Upload Proof" onClick={() => handleProofUploadClick(item.id)}>
                            <Upload className="h-4 w-4" />
                        </Button>
                        {item.status === 'Pending' && (
                        <>
                            <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(item, 'Approved')}>
                                <CheckCircle className="mr-2 h-4 w-4"/>Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(item, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4"/>Reject
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
    )
}

function ProofDialog({ proofUrl }: { proofUrl: string }) {
  const handleDownload = () => {
    // This creates a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = proofUrl;
    link.target = "_blank" // Open in new tab to let browser handle download
    link.download = `proof-${Date.now()}`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="View Proof">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View Proof</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle>Admin Proof of Transfer</DialogTitle>
          <DialogDescription>Proof of transfer uploaded by an administrator.</DialogDescription>
        </DialogHeader>
        <div className="relative mt-4 h-[60vh] w-full">
            {proofUrl ? (
                <Image src={proofUrl} alt="Admin Proof of Transfer" layout="fill" objectFit="contain" />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No proof available</div>
            )}
        </div>
         <Button onClick={handleDownload} variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Download Proof
        </Button>
      </DialogContent>
    </Dialog>
  )
}
