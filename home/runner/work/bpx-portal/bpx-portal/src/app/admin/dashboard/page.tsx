
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DollarSign, Users, Landmark, Loader2, UserCheck, MessageSquare, ArrowRight, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, Timestamp, onSnapshot, DocumentData, orderBy, limit, doc } from "firebase/firestore"
import { format, formatDistanceToNow, subDays } from 'date-fns'
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface OverviewData {
    totalUsers: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    pendingUsers: number;
}

interface UnreadChat {
    id: string;
    userName: string;
    lastMessage: string;
    timestamp: string;
}

interface ProfitData {
    name: string;
    value: number;
    fill: string;
}

interface Transaction {
    id: string;
    type: "Deposit" | "Withdrawal";
    amount: number;
    status: "Approved";
    createdAt: Timestamp;
    userName: string;
}

const COLORS = {
    deposits: 'hsl(var(--primary))',
    withdrawals: 'hsl(var(--destructive))',
    profit: 'hsl(var(--accent))'
};

const statusVariant = {
    Deposit: "secondary",
    Withdrawal: "destructive",
} as const;

export default function AdminDashboardPage() {
    const router = useRouter();
    const [overviewData, setOverviewData] = useState<OverviewData>({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        pendingUsers: 0,
    });
    const [unreadChats, setUnreadChats] = useState<UnreadChat[]>([]);
    const [profitData, setProfitData] = useState<ProfitData[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [sevenDayStats, setSevenDayStats] = useState({ deposits: 0, withdrawals: 0, profit: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribes: (() => void)[] = [];

        // Correctly listen for pending users
        const pendingUsersQuery = query(collection(db, 'users'), where('status', '==', 'Pending'));
        unsubscribes.push(onSnapshot(pendingUsersQuery, (snapshot) => {
            setOverviewData(prev => ({ ...prev, pendingUsers: snapshot.size }));
        }, (error) => console.error(`Error fetching pendingUsers:`, error)));

        // Correctly listen for pending deposits
        const pendingDepositsQuery = query(collection(db, 'deposits'), where('status', '==', 'Pending'));
        unsubscribes.push(onSnapshot(pendingDepositsQuery, (snapshot) => {
            setOverviewData(prev => ({ ...prev, pendingDeposits: snapshot.size }));
        }, (error) => console.error(`Error fetching pendingDeposits:`, error)));

        // Correctly listen for pending withdrawals
        const pendingWithdrawalsQuery = query(collection(db, 'withdrawals'), where('status', '==', 'Pending'));
        unsubscribes.push(onSnapshot(pendingWithdrawalsQuery, (snapshot) => {
            setOverviewData(prev => ({ ...prev, pendingWithdrawals: snapshot.size }));
        }, (error) => console.error(`Error fetching pendingWithdrawals:`, error)));

        const chatsQuery = query(collection(db, 'chats'), where('adminRead', '==', false), orderBy('lastMessageTimestamp', 'desc'));
        unsubscribes.push(onSnapshot(chatsQuery, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                userName: doc.data().userName,
                lastMessage: doc.data().lastMessage,
                timestamp: doc.data().lastMessageTimestamp ? formatDistanceToNow(doc.data().lastMessageTimestamp.toDate(), { addSuffix: true }) : 'N/A'
            }));
            setUnreadChats(chats);
        }));

        const fetchOneTimeData = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const usersQuery = query(collection(db, "users"));
                const depositsQuery = query(collection(db, "deposits"), where("status", "==", "Approved"));
                const withdrawalsQuery = query(collection(db, "withdrawals"), where("status", "==", "Approved"));
                
                const [usersSnapshot, depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
                    getDocs(usersQuery),
                    getDocs(depositsQuery),
                    getDocs(withdrawalsQuery)
                ]);

                // Set total users count
                setOverviewData(prev => ({ ...prev, totalUsers: usersSnapshot.size }));

                // Process profit data
                const totalDeposits = depositsSnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
                const totalWithdrawals = withdrawalsSnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
                const netProfit = totalDeposits - totalWithdrawals;

                const profitChartData: ProfitData[] = [
                    { name: 'Deposits', value: totalDeposits, fill: COLORS.deposits },
                    { name: 'Withdrawals', value: totalWithdrawals, fill: COLORS.withdrawals },
                ];
                setProfitData(profitChartData.filter(d => d.value > 0));

                // Process recent transactions and 7-day stats
                const userCache = new Map<string, string>();
                const getUserName = async (userId: string): Promise<string> => {
                    if (userCache.has(userId)) return userCache.get(userId)!;
                    const userDoc = usersSnapshot.docs.find(d => d.id === userId);
                    const name = userDoc?.data().fullName || 'Unknown User';
                    userCache.set(userId, name);
                    return name;
                };
                
                const sevenDaysAgo = subDays(new Date(), 7);
                let total7DayDeposits = 0;
                let total7DayWithdrawals = 0;

                const depositsPromises = depositsSnapshot.docs.map(async docSnapshot => {
                    const data = docSnapshot.data();
                    if(data.createdAt.toDate() >= sevenDaysAgo) {
                       total7DayDeposits += parseFloat(data.amount);
                    }
                    return { id: docSnapshot.id, type: 'Deposit', userName: await getUserName(data.userId), ...data } as Transaction
                });

                const withdrawalsPromises = withdrawalsSnapshot.docs.map(async docSnapshot => {
                    const data = docSnapshot.data();
                     if(data.createdAt.toDate() >= sevenDaysAgo) {
                       total7DayWithdrawals += parseFloat(data.amount);
                    }
                    return { id: docSnapshot.id, type: 'Withdrawal', userName: await getUserName(data.userId), ...data } as Transaction
                });
                
                const combined = [...await Promise.all(depositsPromises), ...await Promise.all(withdrawalsPromises)];
                combined.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
                setRecentTransactions(combined.slice(0, 5));
                
                setSevenDayStats({
                    deposits: total7DayDeposits,
                    withdrawals: total7DayWithdrawals,
                    profit: total7DayDeposits - total7DayWithdrawals
                });

            } catch (error) {
                console.error("Error fetching one-time stats:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOneTimeData();
        
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
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-headline">Pending Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overviewData.pendingUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-headline">Pending Deposits</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overviewData.pendingDeposits}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-headline">Pending Withdrawals</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overviewData.pendingWithdrawals}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" /> Unread Messages
                            {unreadChats.length > 0 && <Badge variant="destructive">{unreadChats.length}</Badge>}
                        </CardTitle>
                        <CardDescription>New messages from users requiring a response.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {unreadChats.length > 0 ? (
                            <div className="space-y-4">
                                {unreadChats.map(chat => (
                                    <div key={chat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                        <div>
                                            <p className="font-semibold">{chat.userName}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-xs">{chat.lastMessage}</p>
                                            <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/chat/${chat.id}`)}>
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground p-8">No unread messages.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">All-Time Profit Overview</CardTitle>
                        <CardDescription>Summary of all approved deposits and withdrawals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                {payload[0].name}
                                                            </span>
                                                            <span className="font-bold text-muted-foreground">
                                                                PKR {payload[0].value?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend />
                                <Pie data={profitData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="hsl(var(--border))" labelLine={false}>
                                    {profitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                         <div className="flex justify-end mt-4">
                            <Button variant="outline" asChild>
                                <Link href="/admin/profit-stats">View Detailed Stats</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Transactions</CardTitle>
                        <CardDescription>The last 5 approved transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{tx.userName}</TableCell>
                                        <TableCell><Badge variant={statusVariant[tx.type]}>{tx.type}</Badge></TableCell>
                                        <TableCell className="font-mono">PKR {tx.amount.toLocaleString()}</TableCell>
                                        <TableCell>{format(tx.createdAt.toDate(), 'PP')}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">No recent transactions found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Last 7 Days Profit</CardTitle>
                        <CardDescription>Profit summary for the past week.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                                <ArrowDownLeft className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">PKR {sevenDayStats.deposits.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">PKR {sevenDayStats.withdrawals.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">PKR {sevenDayStats.profit.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
