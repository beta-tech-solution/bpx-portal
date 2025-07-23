
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCircle, XCircle, FileText, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"


const deposits = [
  { id: 'dep_1', user: 'John Doe', amount: '$100.00', date: '2023-11-05', status: 'Pending' },
  { id: 'dep_2', user: 'Jane Smith', amount: '$250.00', date: '2023-11-04', status: 'Approved' },
  { id: 'dep_3', user: 'Sam Wilson', amount: '$50.00', date: '2023-11-03', status: 'Rejected' },
  { id: 'dep_4', user: 'Alice Johnson', amount: '$500.00', date: '2023-11-02', status: 'Approved' },
  { id: 'dep_5', user: 'Mike Brown', amount: '$75.00', date: '2023-11-01', status: 'Pending' },
];

const statusVariant = {
    Pending: "default",
    Approved: "secondary",
    Rejected: "destructive"
} as const;

export default function AdminDepositsPage() {
    const filteredDeposits = (status: 'Pending' | 'Approved' | 'Rejected' | 'All') => {
        if (status === 'All') return deposits;
        return deposits.filter(d => d.status === status);
    }

  return (
    <div className="animate-fade-in">
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Deposit Management</CardTitle>
        <CardDescription>Review and manage user deposit requests.</CardDescription>
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
                <DepositTable data={filteredDeposits('Pending')} />
            </TabsContent>
            <TabsContent value="approved">
                <DepositTable data={filteredDeposits('Approved')} />
            </TabsContent>
            <TabsContent value="rejected">
                <DepositTable data={filteredDeposits('Rejected')} />
            </TabsContent>
            <TabsContent value="all">
                <DepositTable data={filteredDeposits('All')} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  )
}

function DepositTable({ data }: { data: typeof deposits }) {
    const { toast } = useToast()

    if (data.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No deposits found.</div>
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
            {data.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell className="font-medium">{deposit.user}</TableCell>
                <TableCell className="font-mono">{deposit.amount}</TableCell>
                <TableCell>{deposit.date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[deposit.status as keyof typeof statusVariant]}>{deposit.status}</Badge>
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
                      <DropdownMenuItem><FileText className="mr-2 h-4 w-4"/>View Proof</DropdownMenuItem>
                      <DropdownMenuItem className="text-green-600" onClick={() => toast({ title: "Deposit Approved", description: `Deposit from ${deposit.user} for ${deposit.amount} has been approved.`})}>
                        <CheckCircle className="mr-2 h-4 w-4"/>Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Deposit Rejected", description: `Deposit from ${deposit.user} for ${deposit.amount} has been rejected.`, variant: "destructive" })}>
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
