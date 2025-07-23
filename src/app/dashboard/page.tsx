
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, DollarSign, Send, Users, Wallet } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
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
];

const chartData = [
  { month: "Jan", deposits: 400, withdrawals: 240 },
  { month: "Feb", deposits: 300, withdrawals: 139 },
  { month: "Mar", deposits: 200, withdrawals: 980 },
  { month: "Apr", deposits: 278, withdrawals: 390 },
  { month: "May", deposits: 189, withdrawals: 480 },
  { month: "Jun", deposits: 239, withdrawals: 380 },
];

const chartConfig = {
  deposits: {
    label: "Deposits",
    color: "hsl(var(--primary))",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;


export default function DashboardPage() {
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
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${accountSummary.totalDeposits}</div>
             <p className="text-xs text-muted-foreground">All time deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground text-red-500" />
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

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Account Activity</CardTitle>
            <CardDescription>Your deposits and withdrawals over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-muted-foreground">{transaction.date}</div>
                      <Badge variant={transaction.status === 'Completed' ? 'secondary' : 'destructive'} className="mt-1 font-normal">{transaction.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{transaction.amount}</TableCell>
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

    