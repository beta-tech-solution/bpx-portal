
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Wallet, Send, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartConfig } from "@/components/ui/chart"

const accountSummary = {
  balance: "550.75",
  totalDeposits: "1200.00",
  totalWithdrawals: "450.00",
  totalTransfers: "200.00",
};

const recentTransactions = [
  { id: "txn_1", type: "Deposit", date: "2023-11-05", amount: "$100.00", status: "Completed" },
  { id: "txn_2", type: "Withdrawal", date: "2023-11-04", amount: "$50.00", status: "Completed" },
  { id: "txn_3", type: "Transfer", date: "2023-11-03", amount: "$75.00", status: "Completed" },
  { id: "txn_4", type: "Deposit", date: "2023-11-01", amount: "$200.00", status: "Pending" },
  { id: "txn_5", type: "Withdrawal", date: "2023-10-30", amount: "$25.50", status: "Rejected" },
];

const depositsData = [
  { month: "Jan", amount: 400 },
  { month: "Feb", amount: 300 },
  { month: "Mar", amount: 200 },
  { month: "Apr", amount: 278 },
  { month: "May", amount: 189 },
  { month: "Jun", amount: 239 },
];
const withdrawalsData = [
  { month: "Jan", amount: 240 },
  { month: "Feb", amount: 139 },
  { month: "Mar", amount: 980 },
  { month: "Apr", amount: 390 },
  { month: "May", amount: 480 },
  { month: "Jun", amount: 380 },
];
const transfersData = [
  { month: "Jan", amount: 100 },
  { month: "Feb", amount: 120 },
  { month: "Mar", amount: 50 },
  { month: "Apr", amount: 200 },
  { month: "May", amount: 150 },
  { month: "Jun", amount: 80 },
];

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
  const statusVariant = {
    Completed: "secondary",
    Pending: "default",
    Rejected: "destructive"
  } as const;

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
             <p className="text-xs text-muted-foreground">All time deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.totalWithdrawals}</div>
             <p className="text-xs text-muted-foreground">All time withdrawals</p>
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
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-muted-foreground">{transaction.date}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">{transaction.amount}</TableCell>
                     <TableCell className="text-right">
                        <Badge variant={statusVariant[transaction.status as keyof typeof statusVariant]} className="font-normal">{transaction.status}</Badge>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
