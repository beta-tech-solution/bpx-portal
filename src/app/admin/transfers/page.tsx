
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, MoreHorizontal, MessageSquare, Send } from "lucide-react"
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


const transfers = [
  { id: 'tfr_1', user: 'John Doe', amount: '$50.00', date: '2023-11-05', status: 'Pending' },
  { id: 'tfr_2', user: 'Jane Smith', amount: '$120.00', date: '2023-11-04', status: 'Transferred' },
  { id: 'tfr_3', user: 'Sam Wilson', amount: '$75.50', date: '2023-11-03', status: 'Issue' },
  { id: 'tfr_4', user: 'Alice Johnson', amount: '$200.00', date: '2023-11-02', status: 'Transferred' },
];

const statusVariant = {
    Pending: "default",
    Transferred: "secondary",
    Issue: "destructive"
} as const;


const transferChartData = [
    { date: "2023-10-01", pending: 4, transferred: 8, issue: 0 },
    { date: "2023-10-02", pending: 6, transferred: 10, issue: 1 },
    { date: "2023-10-03", pending: 2, transferred: 7, issue: 0 },
    { date: "2023-10-04", pending: 7, transferred: 12, issue: 2 },
    { date: "2023-10-05", pending: 5, transferred: 9, issue: 1 },
    { date: "2023-10-06", pending: 8, transferred: 15, issue: 0 },
    { date: "2023-10-07", pending: 3, transferred: 6, issue: 0 },
];
  
const transferChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--primary))" },
    transferred: { label: "Transferred", color: "hsl(var(--accent))" },
    issue: { label: "Issue", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;


export default function AdminTransfersPage() {
    const filteredTransfers = (status: 'Pending' | 'Transferred' | 'Issue' | 'All') => {
        if (status === 'All') return transfers;
        return transfers.filter(d => d.status === status);
    }

  return (
    <div className="animate-fade-in grid gap-8">
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transfer Management</CardTitle>
        <CardDescription>Manage user transfers to their BPExch accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="transferred">Transferred</TabsTrigger>
                <TabsTrigger value="issue">Issue</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                <TransferTable data={filteredTransfers('Pending')} />
            </TabsContent>
            <TabsContent value="transferred">
                <TransferTable data={filteredTransfers('Transferred')} />
            </TabsContent>
            <TabsContent value="issue">
                <TransferTable data={filteredTransfers('Issue')} />
            </TabsContent>
             <TabsContent value="all">
                <TransferTable data={filteredTransfers('All')} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

     <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-muted-foreground" />Transfer Activity</CardTitle>
                    <CardDescription>Transfer trends over a selected period.</CardDescription>
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
            <ChartContainer config={transferChartConfig} className="h-[300px] w-full">
                <BarChart data={transferChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="transferred" fill="var(--color-transferred)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="issue" fill="var(--color-issue)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
    </div>
  )
}

function TransferTable({ data }: { data: typeof transfers }) {
    const { toast } = useToast()
    if (data.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No transfers found.</div>
    }
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">{transfer.user}</TableCell>
                <TableCell className="font-mono">{transfer.amount}</TableCell>
                <TableCell>{transfer.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[transfer.status as keyof typeof statusVariant]}>{transfer.status}</Badge>
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
                      <DropdownMenuItem className="text-green-600" onClick={() => toast({ title: "Transfer Marked as Transferred" })}>
                        <CheckCircle className="mr-2 h-4 w-4"/>Mark as Transferred
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-600" onClick={() => toast({ title: "Transfer Marked as Issue", variant: "destructive" })}>
                        <AlertTriangle className="mr-2 h-4 w-4"/>Mark as Issue
                      </DropdownMenuItem>
                       <DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4"/>Add Instruction</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}
