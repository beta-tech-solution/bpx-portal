
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { DollarSign, Users, Landmark, Send, AlertTriangle } from "lucide-react"

const overviewData = {
  totalUsers: 150,
  pendingDeposits: 12,
  pendingWithdrawals: 5,
  pendingTransfers: 8,
};

const activityData = [
  { name: 'Deposits', pending: 12, completed: 150, rejected: 10 },
  { name: 'Withdrawals', pending: 5, completed: 80, rejected: 3 },
  { name: 'Transfers', pending: 8, completed: 120, rejected: 1 },
];

const chartConfig = {
  pending: { label: "Pending", color: "hsl(var(--primary))" },
  completed: { label: "Completed", color: "hsl(var(--accent))" },
  rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
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

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Transaction Overview</CardTitle>
                <CardDescription>Current status of all transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={activityData} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" />
                        <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={[4, 0, 0, 4]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}
