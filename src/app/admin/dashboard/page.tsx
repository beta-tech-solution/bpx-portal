
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Send, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, Timestamp, onSnapshot, DocumentData } from "firebase/firestore"
import { subMonths, format, addMonths } from 'date-fns'


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

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
    });
    const [depositsData, setDepositsData] = useState<MonthlyData[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<MonthlyData[]>([]);

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

        const unsubscribes: (() => void)[] = [];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </div>
    </div>
  )
}
