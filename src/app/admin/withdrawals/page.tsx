
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"


const withdrawals = [
  { id: 'wd_1', user: 'John Doe', amount: '$50.00', date: '2023-11-05', status: 'Pending', bank: 'Global Trust Bank', account: '1234567890' },
  { id: 'wd_2', user: 'Jane Smith', amount: '$100.00', date: '2023-11-04', status: 'Approved', bank: 'First National', account: '0987654321' },
  { id: 'wd_3', user: 'Sam Wilson', amount: '$25.00', date: '2023-11-03', status: 'Rejected', bank: 'Mega Bank', account: '1122334455' },
];

const statusVariant = {
    Pending: "default",
    Approved: "secondary",
    Rejected: "destructive"
} as const;

export default function AdminWithdrawalsPage() {
    const filteredWithdrawals = (status: 'Pending' | 'Approved' | 'Rejected' | 'All') => {
        if (status === 'All') return withdrawals;
        return withdrawals.filter(d => d.status === status);
    }

  return (
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
