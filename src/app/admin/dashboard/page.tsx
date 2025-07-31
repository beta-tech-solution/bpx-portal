
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Send, Loader2, ArrowDownLeft, ArrowUpRight, TrendingUp, Database, UserCheck } from "lucide-react"
import { db, auth } from "@/lib/firebase/config"
import { collection, getDocs, query, where, Timestamp, onSnapshot, DocumentData, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { subMonths, format, addMonths, startOfDay, subDays, endOfDay } from 'date-fns'
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"


const depositsChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--primary))" },
  approved: { label: "Approved", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const withdrawalsChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    approved: { label: "Approved", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

interface MonthlyData {
    month: string;
    [key: string]: any;
}

interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  date: string;
  userName: string;
}

interface DailyProfit {
    date: string;
    profit: number;
}

export default function AdminDashboardPage() {
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [overviewData, setOverviewData] = useState({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
    });
    const [depositsData, setDepositsData] = useState<MonthlyData[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<MonthlyData[]>([]);
    const [profitTransactions, setProfitTransactions] = useState<Transaction[]>([]);
    const [dailyProfitData, setDailyProfitData] = useState<DailyProfit[]>([]);

    const randomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    const handleSeedData = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to seed data.", variant: "destructive"});
            return;
        }
        setSeeding(true);
        try {
            const depositsCollection = collection(db, 'deposits');
            const withdrawalsCollection = collection(db, 'withdrawals');
            
            const startDate = new Date(new Date().getFullYear(), 5, 1); // June 1st of current year
            const endDate = new Date();

            // Seed 5 deposits totaling 50000
            for (let i = 0; i < 5; i++) {
                const randomTimestamp = randomDate(startDate, endDate);
                await addDoc(depositsCollection, {
                    userId: user.uid,
                    amount: "10000",
                    proofUrl: "https://placehold.co/600x400.png",
                    status: 'Approved',
                    date: randomTimestamp.toISOString().split('T')[0],
                    createdAt: Timestamp.fromDate(randomTimestamp)
                });
            }

            // Seed 4 withdrawals totaling 80000
            for (let i = 0; i < 4; i++) {
                 const randomTimestamp = randomDate(startDate, endDate);
                await addDoc(withdrawalsCollection, {
                    userId: user.uid,
                    amount: "20000",
                    bankName: "Seeded Bank",
                    accountNumber: "0000-0000-0000",
                    accountHolder: "Seeded Holder",
                    status: 'Approved',
                    date: randomTimestamp.toISOString().split('T')[0],
                    createdAt: Timestamp.fromDate(randomTimestamp)
                });
            }

            toast({ title: "Data Seeded", description: "Sample deposits and withdrawals have been created." });

        } catch (error) {
            console.error("Error seeding data:", error);
            toast({ title: "Seeding Failed", description: "Could not create sample data.", variant: "destructive" });
        } finally {
            setSeeding(false);
        }
    }
    
    const handleUpdateJoinDate = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
            return;
        }
        setUpdating(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            // Note: The year is 2025 as requested.
            const joinDate = new Date(2025, 4, 28); // Month is 0-indexed, so 4 is May
            await updateDoc(userDocRef, {
                createdAt: Timestamp.fromDate(joinDate)
            });
            toast({ title: "User Updated", description: `Your join date has been set to ${format(joinDate, 'PP')}.` });
        } catch (error) {
            console.error("Error updating join date:", error);
            toast({ title: "Update Failed", description: "Could not update your join date.", variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    }

     useEffect(() => {
        setLoading(true);

        const processChartData = (docs: DocumentData[], statuses: string[]): MonthlyData[] => {
            const monthlyTotals: { [key: string]: { [key: string]: number } } = {};
            const sixMonthsAgo = subMonths(new Date(), 5);
            
            for (let i = 0; i < 6; i++) {
                const monthDate = addMonths(sixMonthsAgo, i);
                const month = format(monthDate, 'MMM');
                monthlyTotals[month] = {};
                statuses.forEach(status => monthlyTotals[month][status.toLowerCase()] = 0);
            }

            docs.forEach((doc) => {
                const data = doc.data();
                const date = (data.createdAt as Timestamp)?.toDate() || new Date(data.date);
                 if (date >= sixMonthsAgo) {
                    const month = format(date, 'MMM');
                    const status = data.status.toLowerCase();
                    if (monthlyTotals[month] && statuses.map(s => s.toLowerCase()).includes(status)) {
                         monthlyTotals[month][status] = (monthlyTotals[month][status] || 0) + 1;
                    }
                }
            });

             return Object.entries(monthlyTotals).map(([month, values]) => ({
                month,
                ...values
            }));
        };

        const setupProfitListener = () => {
             const depositsQuery = query(
                collection(db, 'deposits'),
                where('status', '==', 'Approved'),
                orderBy('createdAt', 'desc'),
                limit(3)
            );
            const withdrawalsQuery = query(
                collection(db, 'withdrawals'),
                where('status', '==', 'Approved'),
                orderBy('createdAt', 'desc'),
                limit(3)
            );

            const userCache = new Map<string, string>();
            const getUserName = async (userId: string) => {
                if (userCache.has(userId)) return userCache.get(userId);
                try {
                    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
                    if (!userDoc.empty) {
                        const name = userDoc.docs[0].data().fullName;
                        userCache.set(userId, name);
                        return name;
                    }
                } catch (e) { console.error(e); }
                return 'Unknown User';
            };

            const processTransactions = async (
                depositsSnapshot: DocumentData,
                withdrawalsSnapshot: DocumentData
            ) => {
                const deposits = await Promise.all(depositsSnapshot.docs.map(async (doc: DocumentData) => ({
                    id: doc.id,
                    type: 'Deposit' as const,
                    amount: parseFloat(doc.data().amount),
                    date: format((doc.data().createdAt as Timestamp).toDate(), 'PP'),
                    userName: await getUserName(doc.data().userId),
                })));
                const withdrawals = await Promise.all(withdrawalsSnapshot.docs.map(async (doc: DocumentData) => ({
                    id: doc.id,
                    type: 'Withdrawal' as const,
                    amount: parseFloat(doc.data().amount),
                    date: format((doc.data().createdAt as Timestamp).toDate(), 'PP'),
                    userName: await getUserName(doc.data().userId),
                })));

                setProfitTransactions([...deposits, ...withdrawals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,3));
            }

            const unsubDeposits = onSnapshot(depositsQuery, (depositsSnapshot) => {
                getDocs(withdrawalsQuery).then(withdrawalsSnapshot => processTransactions(depositsSnapshot, withdrawalsSnapshot));
            });
            const unsubWithdrawals = onSnapshot(withdrawalsQuery, (withdrawalsSnapshot) => {
                getDocs(depositsQuery).then(depositsSnapshot => processTransactions(depositsSnapshot, withdrawalsSnapshot));
            });

            return [unsubDeposits, unsubWithdrawals];
        }

        const unsubscribes: (() => void)[] = [];

        // Profit Listener
        const [unsubDeposits, unsubWithdrawals] = setupProfitListener();
        unsubscribes.push(unsubDeposits, unsubWithdrawals);
        
        // 7-day profit
        const fetchSevenDayProfit = async () => {
            const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
            
            const depositsQuery = query(
                collection(db, "deposits"),
                where("status", "==", "Approved"),
                where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
            );
            const withdrawalsQuery = query(
                collection(db, "withdrawals"),
                where("status", "==", "Approved"),
                where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
            );

            const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
                getDocs(depositsQuery),
                getDocs(withdrawalsQuery),
            ]);

            const dailyData: { [key: string]: { deposits: number, withdrawals: number } } = {};

            for (let i = 0; i < 7; i++) {
                const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
                dailyData[date] = { deposits: 0, withdrawals: 0 };
            }

            depositsSnapshot.forEach(doc => {
                const data = doc.data();
                const date = format((data.createdAt as Timestamp).toDate(), 'yyyy-MM-dd');
                if (dailyData[date]) {
                    dailyData[date].deposits += parseFloat(data.amount);
                }
            });
            
            withdrawalsSnapshot.forEach(doc => {
                const data = doc.data();
                const date = format((data.createdAt as Timestamp).toDate(), 'yyyy-MM-dd');
                if (dailyData[date]) {
                    dailyData[date].withdrawals += parseFloat(data.amount);
                }
            });

            const profitData = Object.entries(dailyData)
                .map(([date, {deposits, withdrawals}]) => ({
                    date: format(new Date(date), 'MMM d'),
                    profit: deposits - withdrawals,
                }))
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setDailyProfitData(profitData);
        }
        
        fetchSevenDayProfit();


        // Total Users
        const usersQuery = query(collection(db, "users"));
        unsubscribes.push(onSnapshot(usersQuery, (snapshot) => {
            setOverviewData(prev => ({ ...prev, totalUsers: snapshot.size }));
        }, (error) => console.error("Error fetching users count:", error)));

        // Pending counts
        const setupPendingListener = (collectionName: string, statusField: 'pendingDeposits' | 'pendingWithdrawals') => {
            const q = query(collection(db, collectionName), where('status', '==', 'Pending'));
            return onSnapshot(q, (snapshot) => {
                setOverviewData(prev => ({ ...prev, [statusField]: snapshot.size }));
            }, (error) => console.error(`Error fetching pending ${collectionName}:`, error));
        };
        unsubscribes.push(setupPendingListener('deposits', 'pendingDeposits'));
        unsubscribes.push(setupPendingListener('withdrawals', 'pendingWithdrawals'));
        
        // Chart Data Listeners
        const setupChartListener = (
            collectionName: string, 
            setData: React.Dispatch<React.SetStateAction<MonthlyData[]>>,
            statuses: string[]
        ) => {
            const q = query(collection(db, collectionName));
            return onSnapshot(q, (snapshot) => {
                setData(processChartData(snapshot.docs, statuses));
            }, (error) => console.error(`Error fetching chart data for ${collectionName}:`, error));
        };

        unsubscribes.push(setupChartListener('deposits', setDepositsData, ['Pending', 'Approved']));
        unsubscribes.push(setupChartListener('withdrawals', setWithdrawalsData, ['Pending', 'Approved']));

        setLoading(false);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }


  return (
    <div className="max-w-7xl mx-auto grid gap-8 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-headline">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{overviewData.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Registered users in the system</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-headline">Pending Deposits</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{overviewData.pendingDeposits}</div>
                    <p className="text-xs text-muted-foreground">Require approval</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-headline">Pending Withdrawals</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{overviewData.pendingWithdrawals}</div>
                    <p className="text-xs text-muted-foreground">Require approval</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-headline">Test Data</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 items-start">
                    <Button size="sm" onClick={handleSeedData} disabled={seeding}>
                        {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}
                         Seed Transactions
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleUpdateJoinDate} disabled={updating}>
                        {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserCheck className="mr-2 h-4 w-4"/>}
                        Update Join Date
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Add sample data for testing.</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ArrowDownLeft className="h-5 w-5 text-green-500" />Deposit Trends</CardTitle>
                    <CardDescription>Pending vs. Approved deposits over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="w-full overflow-x-auto">
                    <ChartContainer config={depositsChartConfig} className="h-[250px] min-w-[600px] w-full">
                        <BarChart data={depositsData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                   </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2"><ArrowUpRight className="h-5 w-5 text-red-500" />Withdrawal Trends</CardTitle>
                    <CardDescription>Pending vs. Approved withdrawals over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <ChartContainer config={withdrawalsChartConfig} className="h-[250px] min-w-[600px] w-full">
                        <BarChart data={withdrawalsData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Last 7 Days Profit</CardTitle>
                    <CardDescription>Daily net profit from the last week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Profit (PKR)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dailyProfitData.map(item => (
                                <TableRow key={item.date}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell className="text-right font-mono">{item.profit.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/profit-stats">View All Stats</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Recent Transactions</CardTitle>
                    <CardDescription>Recent approved deposits and withdrawals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {profitTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="font-medium">{tx.userName}</div>
                                        <div className="text-sm text-muted-foreground">{tx.date}</div>
                                    </TableCell>
                                    <TableCell>
                                         <Badge variant={tx.type === 'Deposit' ? 'secondary' : 'destructive'}>{tx.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        PKR {tx.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {profitTransactions.length === 0 && (
                        <p className="text-center text-muted-foreground p-4">No recent approved transactions.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

    
