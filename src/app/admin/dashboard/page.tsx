
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Send, AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react"

const overviewData = {
  totalUsers: 150,
  pendingDeposits: 12,
  pendingWithdrawals: 5,
  pendingTransfers: 8,
};

const depositsData = [
  { month: "Jan", pending: 5, approved: 30 },
  { month: "Feb", pending: 8, approved: 45 },
  { month: "Mar", pending: 12, approved: 60 },
  { month: "Apr", pending: 7, approved: 50 },
  { month: "May", pending: 10, approved: 70 },
  { month: "Jun", pending: 12, approved: 75 },
];

const withdrawalsData = [
  { month: "Jan", pending: 2, approved: 20 },
  { month: "Feb", pending: 3, approved: 25 },
  { month: "Mar", pending: 5, approved: 40 },
  { month: "Apr", pending: 4, approved: 30 },
  { month: "May", pending: 6, approved: 50 },
  { month: "Jun", pending: 5, approved: 45 },
];

const transfersData = [
    { month: "Jan", pending: 4, completed: 40 },
    { month: "Feb", pending: 6, completed: 55 },
    { month: "Mar", pending: 8, completed: 70 },
    { month: "Apr", pending: 5, completed: 60 },
    { month: "May", pending: 7, completed: 80 },
    { month: "Jun", pending: 8, completed: 90 },
];


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
    completed: { label: "Completed", color: "hsl(var(--accent))" },
} satisfies ChartConfig;


export default function AdminDashboardPage() {
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
                            <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--color-completed)" fill="var(--color-completed)" fillOpacity={0.4} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
