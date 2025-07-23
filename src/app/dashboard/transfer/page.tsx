"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const recentTransfers = [
  { id: 'tfr_1', date: '2023-10-26', amount: '$50.00', status: 'Completed' },
  { id: 'tfr_2', date: '2023-10-24', amount: '$120.00', status: 'Completed' },
  { id: 'tfr_3', date: '2023-10-21', amount: '$75.50', status: 'Completed' },
];

export default function TransferPage() {
  const { toast } = useToast();

  const handleTransfer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
    toast({
      title: "Transfer Initiated",
      description: `Your transfer of $${amount} has been successfully submitted.`,
    });
    e.currentTarget.reset();
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
            <form onSubmit={handleTransfer}>
          <CardHeader>
            <CardTitle className="font-headline">Transfer to BPExch</CardTitle>
            <CardDescription>Move funds from your wallet to your BPExch account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg border bg-muted/50">
              <Label>Current Wallet Balance</Label>
              <p className="text-3xl font-bold text-primary">$250.75</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-headline">Transfer Amount</Label>
              <Input id="amount" name="amount" type="number" placeholder="0.00" required step="0.01" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Transfer Now
            </Button>
          </CardFooter>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="font-medium">{transfer.date}</div>
                      <Badge variant="secondary" className="font-normal mt-1">
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{transfer.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
