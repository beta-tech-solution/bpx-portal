"use client"

import * as React from "react"
import { useState, useEffect, useMemo, Suspense } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarIcon, Eye, ArrowLeft, ArrowRight, User, Phone, Mail, Copy } from "lucide-react"
import { db, auth } from "@/lib/firebase/config"
import { collection, query, where, Timestamp, onSnapshot, doc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Withdrawal {
  id: string
  amount: string
  status: "Approved" | "Pending" | "Rejected"
  date: string
  createdAt: Timestamp
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  adminProofUrl?: string;
}

const statusVariant = {
  Pending: "default",
  Approved: "secondary",
  Rejected: "destructive"
} as const;

const ITEMS_PER_PAGE = 15;

function WithdrawalHistoryContent() {
  const [user] = useAuthState(auth);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [date, setDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() })
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);

    const q = query(collection(db, "withdrawals"), where("userId", "==", user.uid));
    const unsubscribeWithdrawals = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Withdrawal));
        data.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        setWithdrawals(data);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching withdrawals:", error);
        toast({ title: "Error", description: "Could not fetch withdrawal history.", variant: "destructive" });
        setLoading(false);
    });

    return () => {
        unsubscribeWithdrawals();
    }
  }, [user, toast]);

  const filteredWithdrawals = useMemo(() => {
    let filtered = withdrawals;
    if (date?.from && date?.to) {
        const fromDate = startOfDay(date.from);
        const toDate = endOfDay(date.to);
        filtered = filtered.filter(d => {
            const withdrawalDate = d.createdAt.toDate();
            return withdrawalDate >= fromDate && withdrawalDate <= toDate;
        });
    }
    return filtered;
  }, [withdrawals, date]);

  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredWithdrawals.slice(startIndex, endIndex);
  }, [filteredWithdrawals, currentPage]);

  const totalPages = Math.ceil(filteredWithdrawals.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (paginatedWithdrawals.length === 0) {
      return <div className="text-center text-muted-foreground p-8">No withdrawals found for this period.</div>
    }

    return (
      <div className="space-y-4">
        {paginatedWithdrawals.map(item => (
          <Card key={item.id} className="w-full transition-shadow hover:shadow-md">
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-mono text-xl font-bold">PKR {item.amount}</p>
                        <p className="text-sm text-muted-foreground">{format(item.createdAt.toDate(), 'PPpp')}</p>
                    </div>
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground border-l-2 border-primary pl-2 space-y-1">
                    <p><span className="font-semibold">Bank:</span> {item.bankName}</p>
                    <p><span className="font-semibold">Account #:</span> {item.accountNumber}</p>
                    <p><span className="font-semibold">Holder:</span> {item.accountHolder}</p>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-fade-in grid gap-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Withdrawal History</CardTitle>
          <CardDescription>
            Review all your past withdrawal records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("w-full md:w-[300px] justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={isMobile ? 1 : 2}
                />
              </PopoverContent>
            </Popover>
          </div>
          {renderContent()}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProofDialog({ proofUrl }: { proofUrl: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Admin Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle>Admin's Proof of Transfer</DialogTitle>
          <DialogDescription>This is the proof of payment uploaded by the administrator.</DialogDescription>
        </DialogHeader>
        <div className="relative mt-4 h-[60vh] w-full">
            {proofUrl ? (
                <Image src={proofUrl} alt="Admin Proof of Transfer" layout="fill" objectFit="contain" />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No proof available</div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function WithdrawalHistoryPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <WithdrawalHistoryContent />
        </Suspense>
    );
}
