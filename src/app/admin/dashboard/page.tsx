
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Send, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, Timestamp, onSnapshot } from "firebase/firestore"
import { subMonths, format, addMonths } from 'date-fns'


const depositsChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--primary))" },
  approved: { label: "Approved", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const withdrawalsChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    approved: { label: "Approved", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const transfersChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    transferred: { label: "Transferred", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

interface MonthlyData {
    month: string;
    [key: string]: any;
}

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        pendingTransfers: 0,
    });
    const [depositsData, setDepositsData] = useState<MonthlyData[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<MonthlyData[]>([]);
    const [transfersData, setTransfersData] = useState<MonthlyData[]>([]);

     useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                 setOverviewData(prev => ({ ...prev, totalUsers: usersSnapshot.size }));
            } catch (error) {
                 console.error("Error fetching users count: ", error);
            }

            const setupListener = (collectionName: string, statusField: 'pendingDeposits' | 'pendingWithdrawals' | 'pendingTransfers') => {
                const q = query(collection(db, collectionName), where('status', '==', 'Pending'));
                return onSnapshot(q, (snapshot) => {
                    setOverviewData(prev => ({ ...prev, [statusField]: snapshot.size }));
                }, (error) => console.error(`Error fetching ${collectionName}:`, error));
            };

            const unsubDeposits = setupListener('deposits', 'pendingDeposits');
            const unsubWithdrawals = setupListener('withdrawals', 'pendingWithdrawals');
            const unsubTransfers = setupListener('transfers', 'pendingTransfers');

            const processChartData = (snapshot: any, statuses: string[]): MonthlyData[] => {
                const monthlyTotals: { [key: string]: { [key: string]: number } } = {};
                const sixMonthsAgo = subMonths(new Date(), 5);
                
                for (let i = 0; i < 6; i++) {
                    const monthDate = addMonths(sixMonthsAgo, i);
                    const month = format(monthDate, 'MMM');
                    monthlyTotals[month] = {};
                    statuses.forEach(status => monthlyTotals[month][status.toLowerCase()] = 0);
                }

                snapshot.forEach((doc: any) => {
                    const data = doc.data();
                    const date = (data.createdAt as Timestamp)?.toDate() || new Date(data.date);
                     if (date >= sixMonthsAgo) {
                        const month = format(date, 'MMM');
                        const status = data.status.toLowerCase();
                        if (monthlyTotals[month] && statuses.includes(status)) {
                             monthlyTotals[month][status] = (monthlyTotals[month][status] || 0) + 1;
                        }
                    }
                });

                 return Object.entries(monthlyTotals).map(([month, values]) => ({
                    month,
                    ...values
                }));
            };
            
            const allDepositsSnap = await getDocs(collection(db, "deposits"));
            const allWithdrawalsSnap = await getDocs(collection(db, "withdrawals"));
            const allTransfersSnap = await getDocs(collection(db, "transfers"));

            setDepositsData(processChartData(allDepositsSnap.docs, ['pending', 'approved']));
            setWithdrawalsData(processChartData(allWithdrawalsSnap.docs, ['pending', 'approved']));
            setTransfersData(processChartData(allTransfersSnap.docs, ['pending', 'transferred']));
            
            setLoading(false);

            return () => {
                unsubDeposits();
                unsubWithdrawals();
                unsubTransfers();
            };

        };

        fetchData();
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <CardTitle className="text-sm font-medium font-headline">Pending Transfers</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{overviewData.pendingTransfers}</div>
                    <p className="text-xs text-muted-foreground">Require processing</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ArrowDownLeft className="h-5 w-5 text-green-500" />Deposit Trends</CardTitle>
                    <CardDescription>Pending vs. Approved deposits over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={depositsChartConfig} className="h-[250px] w-full">
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
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline flex items-center gap-2"><ArrowUpRight className="h-5 w-5 text-red-500" />Withdrawal Trends</CardTitle>
                    <CardDescription>Pending vs. Approved withdrawals over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={withdrawalsChartConfig} className="h-[250px] w-full">
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
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-muted-foreground" />Transfer Trends</CardTitle>
                    <CardDescription>Pending vs. Completed transfers over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={transfersChartConfig} className="h-[250px] w-full">
                         <AreaChart data={transfersData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickMargin={8} />
                            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                            <Area type="monotone" dataKey="pending" stackId="1" stroke="var(--color-pending)" fill="var(--color-pending)" fillOpacity={0.4} />
                            <Area type="monotone" dataKey="transferred" stackId="1" stroke="var(--color-transferred)" fill="var(--color-transferred)" fillOpacity={0.4} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

    