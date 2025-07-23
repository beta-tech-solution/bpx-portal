
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from '@/components/language-toggle';
import { Landmark, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"

const chartData = [
    { month: "January", desktop: 120 },
    { month: "February", desktop: 150 },
    { month: "March", desktop: 100 },
    { month: "April", desktop: 180 },
    { month: "May", desktop: 90 },
    { month: "June", desktop: 200 },
  ]
  
  const chartConfig = {
    desktop: {
      label: "Withdrawals",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig

export default function WithdrawPage() {
  const { toast } = useToast();

  const handleWithdraw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = (e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value;
    toast({
        title: "Withdrawal Request Submitted",
        description: `Your request to withdraw PKR ${amount} has been received.`,
    });
    e.currentTarget.reset();
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-8 animate-fade-in">
      <Card>
        <form onSubmit={handleWithdraw}>
        <CardHeader>
          <CardTitle className="font-headline">Request Withdrawal</CardTitle>
          <CardDescription>Withdraw funds from your wallet to your bank account.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-headline">Amount (PKR)</Label>
              <Input id="amount" name="amount" type="number" placeholder="0.00" required step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName" className="font-headline">Bank Name</Label>
              <Input id="bankName" placeholder="e.g., National Bank" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="font-headline">Account Number</Label>
              <Input id="accountNumber" placeholder="Your bank account number" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="accountHolder" className="font-headline">Account Holder Name</Label>
              <Input id="accountHolder" placeholder="Name as it appears on your account" required />
            </div>
          </div>
          <div>
            <LanguageToggle
                className="mt-2"
                en={
                    <>
                        <h4 className="font-bold mb-2 font-headline">Instructions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Withdrawals are processed within 24-48 hours.</li>
                            <li>Ensure all account details are correct to avoid delays.</li>
                            <li>A small processing fee may apply.</li>
                        </ul>
                    </>
                }
                ur={
                    <>
                        <h4 className="font-bold mb-2 font-headline">ہدایات:</h4>
                        <ul className="list-disc list-inside space-y-1 rtl">
                            <li>رقم کی واپسی 24-48 گھنٹوں کے اندر عمل میں لائی جاتی ہے۔</li>
                            <li>تاخیر سے بچنے کے لیے یقینی بنائیں کہ اکاؤنٹ کی تمام تفصیلات درست ہیں۔</li>
                            <li>ایک چھوٹی پروسیسنگ فیس لاگو ہوسکتی ہے۔</li>
                        </ul>
                    </>
                }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">
            <Landmark className="mr-2 h-4 w-4" />
            Submit Withdrawal Request
          </Button>
        </CardFooter>
        </form>
      </Card>

       <Card>
        <CardHeader className="items-center">
            <TrendingDown className="w-8 h-8 text-destructive" />
            <CardTitle className="font-headline">Your Withdrawal History</CardTitle>
            <CardDescription>
            Monthly withdrawal amounts over the last 6 months.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                left: 12,
                right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                />
            </AreaChart>
            </ChartContainer>
        </CardContent>
        </Card>
    </div>
  );
}

    