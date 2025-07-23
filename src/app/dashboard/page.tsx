
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Wallet, Send, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { auth, db } from "@/lib/firebase/config"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"

interface Transaction {
    id: string;
    type: "Deposit" | "Withdrawal" | "Transfer";
    date: string;
    amount: string;
    status: "Completed" | "Pending" | "Rejected" | "Transferred" | "Issue";
}

interface ChartData {
    month: string;
    amount: number;
}

const depositsChartConfig = {
  amount: { label: "Deposits", color: "hsl(var(--primary))" },
} satisfies ChartConfig;
const withdrawalsChartConfig = {
    amount: { label: "Withdrawals", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;
const transfersChartConfig = {
    amount: { label: "Transfers", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accountSummary, setAccountSummary] = useState({
        balance: "0.00",
        totalDeposits: "0.00",
        totalWithdrawals: "0.00",
        totalTransfers: "0.00",
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [depositsData, setDepositsData] = useState<ChartData[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<ChartData[]>([]);
    const [transfersData, setTransfersData] = useState<ChartData[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch user balance
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();
                
                // Fetch transactions
                const depositsQuery = query(collection(db, "deposits"), where("userId", "==", user.uid));
                const withdrawalsQuery = query(collection(db, "withdrawals"), where("userId", "==", user.uid));
                const transfersQuery = query(collection(db, "transfers"), where("userId", "==", user.uid));

                const [depositsSnapshot, withdrawalsSnapshot, transfersSnapshot] = await Promise.all([
                    getDocs(depositsQuery),
                    getDocs(withdrawalsQuery),
                    getDocs(transfersQuery)
                ]);

                let totalDeposits = 0;
                const allDeposits = depositsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    if(data.status === 'Approved') totalDeposits += parseFloat(data.amount);
                    return { ...data, id: doc.id, type: 'Deposit' };
                });

                let totalWithdrawals = 0;
                const allWithdrawals = withdrawalsSnapshot.docs.map(doc => {
                    const data = doc.data();
                     if(data.status === 'Approved') totalWithdrawals += parseFloat(data.amount);
                    return { ...data, id: doc.id, type: 'Withdrawal' };
                });
                
                let totalTransfers = 0;
                const allTransfers = transfersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    if(data.status === 'Transferred') totalTransfers += parseFloat(data.amount);
                    return { ...data, id: doc.id, type: 'Transfer' };
                });
                
                setAccountSummary({
                    balance: userData?.balance?.toFixed(2) ?? "0.00",
                    totalDeposits: totalDeposits.toFixed(2),
                    totalWithdrawals: totalWithdrawals.toFixed(2),
                    totalTransfers: totalTransfers.toFixed(2)
                });

                const allTransactions = [...allDeposits, ...allWithdrawals, ...allTransfers]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    date: tx.date,
                    amount: `$${parseFloat(tx.amount).toFixed(2)}`,
                    status: tx.status
                } as Transaction));

                setRecentTransactions(allTransactions);

                const processChartData = (snapshot: any) => {
                    const monthlyData: { [key: string]: number } = {};
                    snapshot.docs.forEach((doc: any) => {
                        const data = doc.data();
                        const date = new Date(data.date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        if(data.status === 'Approved' || data.status === 'Completed' || data.status === 'Transferred') {
                            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(data.amount);
                        }
                    });
                    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
                };

                setDepositsData(processChartData(depositsSnapshot));
                setWithdrawalsData(processChartData(withdrawalsSnapshot));
                setTransfersData(processChartData(transfersSnapshot));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const statusVariant = {
        Completed: "secondary",
        Approved: "secondary",
        Transferred: "secondary",
        Pending: "default",
        Rejected: "destructive",
        Issue: "destructive"
    } as const;

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto grid gap-8 animate-fade-in">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.balance}</div>
            <p className="text-xs text-muted-foreground">Your current available balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Deposits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.totalDeposits}</div>
             <p className="text-xs text-muted-foreground">All time approved deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.totalWithdrawals}</div>
             <p className="text-xs text-muted-foreground">All time approved withdrawals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Transfers</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.totalTransfers}</div>
            <p className="text-xs text-muted-foreground">To BPExch account</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="grid gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Deposit History</CardTitle>
                    <CardDescription>Your deposit history over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={depositsChartConfig} className="h-[200px] w-full">
                        <AreaChart accessibilityLayer data={depositsData} margin={{left: 12, right: 12,}} >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                            <YAxis tickMargin={8} />
                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Area dataKey="amount" type="natural" fill="var(--color-amount)" fillOpacity={0.4} stroke="var(--color-amount)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><TrendingDown className="h-5 w-5 text-destructive"/>Withdrawal History</CardTitle>
                    <CardDescription>Your withdrawal history over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={withdrawalsChartConfig} className="h-[200px] w-full">
                        <AreaChart accessibilityLayer data={withdrawalsData} margin={{left: 12, right: 12,}} >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                            <YAxis tickMargin={8} />
                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Area dataKey="amount" type="natural" fill="var(--color-amount)" fillOpacity={0.4} stroke="var(--color-amount)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5"/>Transfer History</CardTitle>
                    <CardDescription>Your transfer history over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={transfersChartConfig} className="h-[200px] w-full">
                        <BarChart accessibilityLayer data={transfersData} >
                             <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
                <Link href="#">
                    View All
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">{transaction.amount}</TableCell>
                     <TableCell className="text-right">
                        <Badge variant={statusVariant[transaction.status as keyof typeof statusVariant]} className="font-normal">{transaction.status}</Badge>
                     </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No recent transactions.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

