
"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarIcon, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { db } from "@/lib/firebase/config"
import { collection, query, where, getDocs, Timestamp, doc } from "firebase/firestore"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'Deposit' | 'Withdrawal'
  amount: number
  status: 'Approved' | 'Pending' | 'Rejected'
  date: string
  userName: string
}

const profitChartConfig = {
  deposits: { label: "Deposits", color: "hsl(var(--primary))" },
  withdrawals: { label: "Withdrawals", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

export default function ProfitStatsPage() {
  const [date, setDate] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    profit: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const fetchStats = async () => {
    if (!date?.from || !date?.to) return
    setLoading(true)

    const fromDate = startOfDay(date.from)
    const toDate = endOfDay(date.to)
    
    try {
      const depositsQuery = query(
        collection(db, "deposits"),
        where("status", "==", "Approved"),
        where("createdAt", ">=", Timestamp.fromDate(fromDate)),
        where("createdAt", "<=", Timestamp.fromDate(toDate))
      )
      const withdrawalsQuery = query(
        collection(db, "withdrawals"),
        where("status", "==", "Approved"),
        where("createdAt", ">=", Timestamp.fromDate(fromDate)),
        where("createdAt", "<=", Timestamp.fromDate(toDate))
      )

      const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
        getDocs(depositsQuery),
        getDocs(withdrawalsQuery),
      ])

      const userCache = new Map();
      const getUserName = async (userId: string) => {
          if (!userId) return 'Unknown User';
          if (userCache.has(userId)) return userCache.get(userId);
          try {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                  const name = userDoc.data().fullName || 'Unknown User';
                  userCache.set(userId, name);
                  return name;
              }
          } catch (e) { console.error("Error fetching user", e); }
          userCache.set(userId, 'Unknown User');
          return 'Unknown User';
      }

      let totalDeposits = 0;
      const depositsData: Transaction[] = await Promise.all(depositsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        totalDeposits += parseFloat(data.amount);
        const userName = await getUserName(data.userId);
        return {
          id: doc.id,
          type: 'Deposit',
          amount: parseFloat(data.amount),
          status: 'Approved',
          date: format((data.createdAt as Timestamp).toDate(), 'PP'),
          userName,
        }
      }));

      let totalWithdrawals = 0;
      const withdrawalsData: Transaction[] = await Promise.all(withdrawalsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        totalWithdrawals += parseFloat(data.amount);
        const userName = await getUserName(data.userId);
        return {
          id: doc.id,
          type: 'Withdrawal',
          amount: parseFloat(data.amount),
          status: 'Approved',
          date: format((data.createdAt as Timestamp).toDate(), 'PP'),
          userName,
        }
      }));
      
      setStats({
        totalDeposits,
        totalWithdrawals,
        profit: totalDeposits - totalWithdrawals,
      })
      setTransactions([...depositsData, ...withdrawalsData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (error) {
      console.error("Error fetching profit stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Moved initial state setup into useEffect to prevent hydration error
    if (!date) {
        setDate({
            from: subDays(new Date(), 29),
            to: new Date(),
        })
    } else {
        fetchStats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const chartData = useMemo(() => {
    const dataByDate: { [key: string]: { deposits: number; withdrawals: number } } = {}
    transactions.forEach(tx => {
      if(!dataByDate[tx.date]) dataByDate[tx.date] = { deposits: 0, withdrawals: 0 };
      if(tx.type === 'Deposit') dataByDate[tx.date].deposits += tx.amount;
      if(tx.type === 'Withdrawal') dataByDate[tx.date].withdrawals += tx.amount;
    })
    return Object.entries(dataByDate).map(([date, values]) => ({ date, ...values })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);
  
  const renderTransactionHistory = () => {
     if (transactions.length === 0 && !loading) {
       return <div className="text-center text-muted-foreground p-8">No transactions found for this period.</div>
     }

     if (isMobile) {
        return (
            <div className="space-y-4">
                {transactions.map(tx => (
                    <Card key={tx.id}>
                        <CardContent className="p-4 flex flex-col gap-3">
                            <div>
                                <p className="font-semibold break-words">{tx.userName}</p>
                                <p className="text-sm text-muted-foreground">{tx.date}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'destructive'}>{tx.type}</Badge>
                                <p className="font-mono text-lg font-bold">PKR {tx.amount.toFixed(2)}</p>
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
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount (PKR)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell>{tx.userName}</TableCell>
                            <TableCell>
                                <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'destructive'}>{tx.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{tx.amount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
     )
  }

  return (
    <div className="animate-fade-in grid gap-8 max-w-7xl mx-auto">
      <Card className={isMobile ? "max-w-[400px] mx-auto" : ""}>
        <CardHeader>
          <CardTitle className="font-headline">Profit Statistics</CardTitle>
          <CardDescription>
            Analyze deposits, withdrawals, and profit over a specific period.
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
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
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

          {loading ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">PKR {stats.totalDeposits.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                   <ArrowUpRight className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">PKR {stats.totalWithdrawals.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                   <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">PKR {stats.profit.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className={isMobile ? "max-w-[300px] mx-auto" : ""}>
                <CardHeader>
                    <CardTitle>Daily Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                     <ChartContainer config={profitChartConfig} className="h-[250px] min-w-[600px] w-full">
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(val) => format(new Date(val), 'MMM d')} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h3 className="text-lg font-headline mb-4">Transaction History</h3>
                {renderTransactionHistory()}
            </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
