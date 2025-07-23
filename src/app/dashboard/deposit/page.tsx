"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LanguageToggle } from '@/components/language-toggle';
import { UploadCloud, Hourglass, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"

const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
  ]
  
  const chartConfig = {
    desktop: {
      label: "Deposits",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

export default function DepositPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [progress, setProgress] = useState(10);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = (event.target as HTMLFormElement).elements.namedItem('proof') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      setIsSubmitted(true);
      toast({
        title: "Deposit Submitted",
        description: "We have received your proof and will confirm it shortly.",
      })
    } else {
      toast({
        title: "Error",
        description: "Please upload a proof of payment.",
        variant: "destructive",
      })
    }
  };

  useEffect(() => {
    if (isSubmitted) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [isSubmitted]);

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <Card className="w-full max-w-lg">
          <CardHeader className="items-center text-center">
            <Hourglass className="w-12 h-12 text-primary mb-2 animate-spin-slow" />
            <CardTitle className="font-headline">Deposit Awaiting Confirmation</CardTitle>
            <CardDescription>Your deposit is being reviewed by our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">Waiting for Admin Confirmation... ({progress}%)</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>Make Another Deposit</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-8 animate-fade-in">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Deposit Funds</CardTitle>
                <CardDescription>Follow the instructions below to add funds to your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 font-headline">Required Amount</h3>
                            <p className="text-3xl font-bold text-accent">$100.00 USD</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 font-headline">Deposit Account Details</h3>
                            <div className="p-4 rounded-lg border bg-muted/50 space-y-2 text-sm">
                                <p><span className="font-semibold">Bank Name:</span> Global Trust Bank</p>
                                <p><span className="font-semibold">Account Number:</span> 1234567890</p>
                                <p><span className="font-semibold">Account Holder:</span> BPX Services</p>
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="proof" className="font-semibold font-headline">Upload Payment Proof</Label>
                            <Input id="proof" name="proof" type="file" required className="mt-2" accept="image/*,.pdf" />
                            <p className="text-xs text-muted-foreground mt-1">Please upload an image or PDF of your transaction receipt.</p>
                        </div>
                    </div>
                    <div>
                         <LanguageToggle
                            en={<p>Please ensure the deposit amount is exact. Upload a clear screenshot or PDF of the transaction. Funds will be credited to your account upon confirmation.</p>}
                            ur={<p className="leading-relaxed">براہ کرم یقینی بنائیں کہ جمع کی رقم درست ہے۔ لین دین کی واضح اسکرین شاٹ یا پی ڈی ایف اپ لوڈ کریں۔ تصدیق کے بعد فنڈز آپ کے اکاؤنٹ میں جمع کر دیے جائیں گے۔</p>}
                         />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Submit Deposit
                    </Button>
                </CardFooter>
            </form>
        </Card>
         <Card>
            <CardHeader className="items-center">
              <TrendingUp className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline">Your Deposit Trends</CardTitle>
              <CardDescription>
                Monthly deposit amounts over the last 6 months.
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
                  <ChartTooltip
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
