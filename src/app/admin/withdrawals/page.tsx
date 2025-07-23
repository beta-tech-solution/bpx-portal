
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCircle, XCircle, MoreHorizontal, ArrowUpRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const withdrawals = [
  { id: 'wd_1', user: 'John Doe', amount: 'PKR 50.00', date: '2023-11-05', status: 'Pending', bank: 'Global Trust Bank', account: '1234567890' },
  { id: 'wd_2', user: 'Jane Smith', amount: 'PKR 100.00', date: '2023-11-04', status: 'Approved', bank: 'First National', account: '0987654321' },
  { id: 'wd_3', user: 'Sam Wilson', amount: 'PKR 25.00', date: '2023-11-03', status: 'Rejected', bank: 'Mega Bank', account: '1122334455' },
];

const statusVariant = {
    Pending: "default",
    Approved: "secondary",
    Rejected: "destructive"
} as const;


const withdrawalChartData = [
    { date: "2023-10-01", pending: 3, approved: 5, rejected: 0 },
    { date: "2023-10-02", pending: 5, approved: 7, rejected: 1 },
    { date: "2023-10-03", pending: 2, approved: 4, rejected: 0 },
    { date: "2023-10-04", pending: 6, approved: 9, rejected: 2 },
    { date: "2023-10-05", pending: 4, approved: 6, rejected: 1 },
    { date: "2023-10-06", pending: 7, approved: 11, rejected: 0 },
    { date: "2023-10-07", pending: 3, approved: 5, rejected: 1 },
];
  
const withdrawalChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    approved: { label: "Approved", color: "hsl(var(--accent))" },
    rejected: { label: "Rejected", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export default function AdminWithdrawalsPage() {
    const filteredWithdrawals = (status: 'Pending' | 'Approved' | 'Rejected' | 'All') => {
        if (status === 'All') return withdrawals;
        return withdrawals.filter(d => d.status === status);
    }

  return (
    <div className="animate-fade-in grid gap-8">
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Withdrawal Management</CardTitle>
        <CardDescription>Review and manage user withdrawal requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                <WithdrawalTable data={filteredWithdrawals('Pending')} />
            </TabsContent>
            <TabsContent value="approved">
                <WithdrawalTable data={filteredWithdrawals('Approved')} />
            </TabsContent>
            <TabsContent value="rejected">
                <WithdrawalTable data={filteredWithdrawals('Rejected')} />
            </TabsContent>
            <TabsContent value="all">
                <WithdrawalTable data={filteredWithdrawals('All')} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><ArrowUpRight className="h-5 w-5 text-red-500" />Withdrawal Activity</CardTitle>
                    <CardDescription>Withdrawal trends over a selected period.</CardDescription>
                </div>
                 <Select defaultValue="7">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="180">Last 6 months</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={withdrawalChartConfig} className="h-[300px] w-full">
                <BarChart data={withdrawalChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
    </div>
  )
}

function WithdrawalTable({ data }: { data: typeof withdrawals }) {
    const { toast } = useToast()

    if (data.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No withdrawals found.</div>
    }
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                    <div className="font-medium">{item.user}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                </TableCell>
                <TableCell>
                    <div className="font-mono font-bold">{item.amount}</div>
                    <div className="text-xs text-muted-foreground">{item.bank} - {item.account}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[item.status as keyof typeof statusVariant]}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-green-600" onClick={() => toast({ title: "Withdrawal Approved" })}>
                        <CheckCircle className="mr-2 h-4 w-4"/>Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Withdrawal Rejected", variant: "destructive"})}>
                        <XCircle className="mr-2 h-4 w-4"/>Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}

    