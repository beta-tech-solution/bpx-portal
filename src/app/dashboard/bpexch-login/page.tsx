"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"
import { ExternalLink } from "lucide-react"

const loginActivity = [
  { date: "2023-11-01", time: "10:00 AM", ip: "192.168.1.1", status: "Success" },
  { date: "2023-10-30", time: "02:15 PM", ip: "10.0.0.5", status: "Success" },
  { date: "2023-10-29", time: "09:30 AM", ip: "172.16.0.10", status: "Failed" },
  { date: "2023-10-28", time: "05:45 PM", ip: "192.168.1.1", status: "Success" },
]

const chartData = [
  { day: "Mon", logins: 4 },
  { day: "Tue", logins: 3 },
  { day: "Wed", logins: 5 },
  { day: "Thu", logins: 2 },
  { day: "Fri", logins: 6 },
  { day: "Sat", logins: 8 },
  { day: "Sun", logins: 7 },
]

const chartConfig = {
  logins: {
    label: "Logins",
    color: "hsl(var(--accent))",
  },
}

export default function BpexchLoginPage() {
  return (
    <div className="max-w-4xl mx-auto grid gap-8 animate-fade-in">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">BPExch Account Access</CardTitle>
                <CardDescription>Login to your BPExch account and view activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="https://bpexch.net/Users/Login" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4"/>
                        Login to BPExch
                    </Link>
                </Button>
            </CardContent>
        </Card>
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{activity.date}</div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </TableCell>
                    <TableCell>{activity.ip}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={activity.status === 'Success' ? 'secondary' : 'destructive'}>{activity.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Weekly Access Chart</CardTitle>
            <CardDescription>Your BPExch account access over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="logins" stroke="var(--color-logins)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
