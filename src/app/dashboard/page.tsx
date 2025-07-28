
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, TrendingDown, Loader2, Activity, CalendarCheck } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { auth, db } from "@/lib/firebase/config"
import { collection, query, where, getDocs, onSnapshot, doc, orderBy, limit, Timestamp } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import { format } from 'date-fns';

interface Transaction {
    id: string;
    type: "Deposit" | "Withdrawal";
    date: string;
    amount: string;
    status: "Approved" | "Pending" | "Rejected";
}

interface LoginActivity {
    id: string;
    date: string;
    ip: string;
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

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accountSummary, setAccountSummary] = useState({
        balance: "0.00",
        totalDeposits: "0.00",
        totalWithdrawals: "0.00",
        memberSince: ""
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [recentLogins, setRecentLogins] = useState<LoginActivity[]>([]);
    const [depositsData, setDepositsData] = useState<ChartData[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<ChartData[]>([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        const unsubscribes: (() => void)[] = [];

        // Fetch user balance and join date
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setAccountSummary(prev => ({ 
                    ...prev, 
                    balance: (userData.balance ?? 0).toFixed(2),
                    memberSince: userData.createdAt ? format((userData.createdAt as Timestamp).toDate(), 'PPP') : 'N/A'
                }));
            }
        });
        unsubscribes.push(unsubscribeUser);

        // Recent Logins
        const loginsQuery = query(collection(db, 'bpexch_logins'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(3));
        const unsubscribeLogins = onSnapshot(loginsQuery, (snapshot) => {
            const logins = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: format((data.timestamp as any).toDate(), 'PPpp'),
                    ip: data.ip
                }
            })
            setRecentLogins(logins);
        });
        unsubscribes.push(unsubscribeLogins);


        const processTransactions = async () => {
            try {
                // Fetch transactions
                const depositsQuery = query(collection(db, "deposits"), where("userId", "==", user.uid));
                const withdrawalsQuery = query(collection(db, "withdrawals"), where("userId", "==", user.uid));

                const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
                    getDocs(depositsQuery),
                    getDocs(withdrawalsQuery)
                ]);

                let totalDeposits = 0;
                const allDeposits = depositsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.status === 'Approved') totalDeposits += parseFloat(data.amount);
                    return { ...data, id: doc.id, type: 'Deposit' };
                });

                let totalWithdrawals = 0;
                const allWithdrawals = withdrawalsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    if (data.status === 'Approved') totalWithdrawals += parseFloat(data.amount);
                    return { ...data, id: doc.id, type: 'Withdrawal' };
                });
                
                setAccountSummary(prev => ({
                    ...prev,
                    totalDeposits: totalDeposits.toFixed(2),
                    totalWithdrawals: totalWithdrawals.toFixed(2),
                }));

                const allTransactions = [...allDeposits, ...allWithdrawals]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    date: tx.date,
                    amount: `PKR ${parseFloat(tx.amount).toFixed(2)}`,
                    status: tx.status
                } as Transaction));

                setRecentTransactions(allTransactions);

                const processChartData = (snapshotDocs: any[], validStatus: string) => {
                    const monthlyData: { [key: string]: number } = {};
                    snapshotDocs.forEach((docData: any) => {
                        const data = docData;
                        const date = new Date(data.date);
                        const month = format(date, 'MMM');
                        if(data.status === validStatus) {
                            monthlyData[month] = (monthlyData[month] || 0) + parseFloat(data.amount);
                        }
                    });
                    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
                };

                setDepositsData(processChartData(allDeposits, 'Approved'));
                setWithdrawalsData(processChartData(allWithdrawals, 'Approved'));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        processTransactions();
        
        const depositsQuery = query(collection(db, "deposits"), where("userId", "==", user.uid));
        const unsubscribeDeposits = onSnapshot(depositsQuery, () => processTransactions());
        unsubscribes.push(unsubscribeDeposits);
        
        const withdrawalsQuery = query(collection(db, "withdrawals"), where("userId", "==", user.uid));
        const unsubscribeWithdrawals = onSnapshot(withdrawalsQuery, () => processTransactions());
        unsubscribes.push(unsubscribeWithdrawals);

        return () => unsubscribes.forEach(unsub => unsub());

    }, [user]);

    const statusVariant = {
        Approved: "secondary",
        Pending: "default",
        Rejected: "destructive",
    } as const;

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto grid gap-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Member Since</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{accountSummary.memberSince}</div>
            <p className="text-xs text-muted-foreground">Your journey with us</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Deposits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">PKR {accountSummary.totalDeposits}</div>
             <p className="text-xs text-muted-foreground">All time approved deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">PKR {accountSummary.totalWithdrawals}</div>
             <p className="text-xs text-muted-foreground">All time approved withdrawals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid gap-6">
            <Card className="sm:max-w-[calc(100vw-2rem)] md:max-w-full md:mx-0">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Deposit History</CardTitle>
                    <CardDescription>Your deposit history over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <ChartContainer config={depositsChartConfig} className="h-[200px] w-full">
                            <AreaChart accessibilityLayer data={depositsData} margin={{left: -20, right: 20, top: 5, bottom: 0}} >
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                <YAxis tickMargin={8} width={80} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Area dataKey="amount" type="natural" fill="var(--color-amount)" fillOpacity={0.4} stroke="var(--color-amount)" />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
             <Card className="sm:max-w-[calc(100vw-2rem)] md:max-w-full md:mx-0">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><TrendingDown className="h-5 w-5 text-destructive"/>Withdrawal History</CardTitle>
                    <CardDescription>Your withdrawal history over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <ChartContainer config={withdrawalsChartConfig} className="h-[200px] w-full">
                            <AreaChart accessibilityLayer data={withdrawalsData} margin={{left: -20, right: 20, top: 5, bottom: 0}} >
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                <YAxis tickMargin={8} width={80} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Area dataKey="amount" type="natural" fill="var(--color-amount)" fillOpacity={0.4} stroke="var(--color-amount)" />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6">
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
                <div className="overflow-x-auto">
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
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline flex items-center gap-2"><Activity className="h-5 w-5"/>Login Activity</CardTitle>
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/bpexch-login">
                        View All
                    </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead className="text-right">IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentLogins.length > 0 ? recentLogins.map((login) => (
                        <TableRow key={login.id}>
                            <TableCell>
                            <div className="font-medium">{login.date}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono">{login.ip}</TableCell>
                        </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">No recent logins.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
