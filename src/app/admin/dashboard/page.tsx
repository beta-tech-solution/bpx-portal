
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Loader2, UserCheck, MessageSquare, ArrowRight } from "lucide-react"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, Timestamp, onSnapshot, DocumentData, orderBy } from "firebase/firestore"
import { formatDistanceToNow } from 'date-fns'
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
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

const COLORS = {
    deposits: 'hsl(var(--primary))',
    withdrawals: 'hsl(var(--destructive))',
    profit: 'hsl(var(--accent))'
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState<OverviewData>({
        totalUsers: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        pendingUsers: 0,
    });
    const [unreadChats, setUnreadChats] = useState<UnreadChat[]>([]);
    const [profitData, setProfitData] = useState<ProfitData[]>([]);

    useEffect(() => {
        setLoading(true);
        const unsubscribes: (() => void)[] = [];

        // --- Overview Cards Listeners ---
        const setupListener = (
            collectionName: string, 
            stateKey: keyof OverviewData,
            conditions: [string, any, any][] = []
        ) => {
            let q = query(collection(db, collectionName));
            conditions.forEach(cond => {
                q = query(q, where(cond[0], cond[1], cond[2]));
            });
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setOverviewData(prev => ({ ...prev, [stateKey]: snapshot.size }));
            }, (error) => console.error(`Error fetching ${stateKey}:`, error));
            unsubscribes.push(unsubscribe);
        };
        
        setupListener('users', 'totalUsers');
        setupListener('users', 'pendingUsers', [['emailVerified', '==', false]]);
        setupListener('deposits', 'pendingDeposits', [['status', '==', 'Pending']]);
        setupListener('withdrawals', 'pendingWithdrawals', [['status', '==', 'Pending']]);


        // --- Unread Chats Listener ---
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

        // --- Profit Pie Chart Data Fetch ---
        const fetchProfitData = async () => {
            const depositsQuery = query(collection(db, "deposits"), where("status", "==", "Approved"));
            const withdrawalsQuery = query(collection(db, "withdrawals"), where("status", "==", "Approved"));

            const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
                getDocs(depositsQuery),
                getDocs(withdrawalsQuery),
            ]);

            const totalDeposits = depositsSnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
            const totalWithdrawals = withdrawalsSnapshot.docs.reduce((sum, doc) => sum + parseFloat(doc.data().amount), 0);
            const netProfit = totalDeposits - totalWithdrawals;

            const data: ProfitData[] = [
                { name: 'Total Deposits', value: totalDeposits, fill: COLORS.deposits },
                { name: 'Total Withdrawals', value: totalWithdrawals, fill: COLORS.withdrawals },
                { name: 'Net Profit', value: netProfit, fill: COLORS.profit },
            ];
            
            setProfitData(data.filter(d => d.value > 0)); // Only show positive values in pie chart
        };

        fetchProfitData();
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
                        <CardTitle className="font-headline">Profit Overview</CardTitle>
                        <CardDescription>Summary of approved deposits and withdrawals.</CardDescription>
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
        </div>
    )
}
