
"use client"

import { useState, useEffect } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"
import { ExternalLink, Loader2, ShieldOff, ShieldCheck, User, Lock, MessageSquare } from "lucide-react"
import { db, auth } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LoginActivity {
    id: string;
    date: string;
    time: string;
    ip: string;
    status: "Success";
}

interface UserData {
    blockedIps: string[];
    bpexchUsername?: string;
    bpexchPassword?: string;
    adminMessage?: string;
}

interface ChartData {
    day: string;
    logins: number;
}

const chartConfig = {
  logins: {
    label: "Logins",
    color: "hsl(var(--accent))",
  },
}

export default function BpexchLoginPage() {
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLogging, setIsLogging] = useState(false);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            setUserData(doc.data() as UserData);
        });

        const q = query(
            collection(db, 'bpexch_logins'), 
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activity: LoginActivity[] = [];
            const loginsPerDay: { [key: string]: number } = {};

            const last7Days = eachDayOfInterval({
                start: subDays(new Date(), 6),
                end: new Date()
            });

            last7Days.forEach(day => {
                loginsPerDay[format(day, 'yyyy-MM-dd')] = 0;
            });
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if(!data.timestamp) return;
                const timestamp = (data.timestamp as any).toDate();
                
                activity.push({
                    id: doc.id,
                    date: format(timestamp, 'yyyy-MM-dd'),
                    time: format(timestamp, 'p'),
                    ip: data.ip,
                    status: 'Success'
                });

                const dayKey = format(timestamp, 'yyyy-MM-dd');
                if(dayKey in loginsPerDay) {
                    loginsPerDay[dayKey]++;
                }
            });

            setLoginActivity(activity.slice(0, 5));

            const formattedChartData = Object.entries(loginsPerDay).map(([date, count]) => ({
                day: format(new Date(date), 'E'),
                logins: count
            }));
            
            setChartData(formattedChartData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching login activity:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribe();
        }
    }, [user]);

    const handleLoginClick = async () => {
        if(!user) return;
        setIsLogging(true);

        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if(!ipResponse.ok) throw new Error('Failed to fetch IP');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;

            const currentBlockedIps = userData?.blockedIps || [];
            if(currentBlockedIps.includes(ip)){
                toast({ title: "Login Blocked", description: "This IP address has been blocked from accessing your account.", variant: "destructive" });
                setIsLogging(false);
                return;
            }
            
            await addDoc(collection(db, 'bpexch_logins'), {
                userId: user.uid,
                ip: ip,
                timestamp: serverTimestamp(),
            });

            window.open('https://bpexch.net/Users/Login', '_blank');

        } catch (error) {
            console.error("Error logging activity:", error);
            toast({ title: "Error", description: "Could not log activity. Please check your connection.", variant: "destructive" });
        } finally {
            setIsLogging(false);
        }
    }

    const toggleIpBlock = async (ip: string) => {
        if(!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        const isBlocked = userData?.blockedIps?.includes(ip);

        try {
             if (isBlocked) {
                await updateDoc(userDocRef, { blockedIps: arrayRemove(ip) });
                toast({ title: "IP Unblocked", description: `${ip} can now access your account.` });
            } else {
                await updateDoc(userDocRef, { blockedIps: arrayUnion(ip) });
                toast({ title: "IP Blocked", description: `${ip} can no longer access your account.` });
            }
        } catch (error) {
            console.error("Error updating IP block status:", error);
            toast({ title: "Error", description: "Could not update IP status.", variant: "destructive" });
        }
    }


  return (
    <div className="max-w-4xl mx-auto grid gap-8 animate-fade-in">
        
        {userData?.adminMessage && (
            <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertTitle>A Message from Admin</AlertTitle>
                <AlertDescription>
                    {userData.adminMessage}
                </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">BPExch Account Access</CardTitle>
                    <CardDescription>Login to your BPExch account. Your access attempts will be logged for security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLoginClick} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLogging}>
                        {isLogging ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ExternalLink className="mr-2 h-4 w-4"/>}
                        Login to BPExch
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your BPExch Details</CardTitle>
                    <CardDescription>These are your account details provided by the administrator.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-md border bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-xs font-semibold">Username/Email</p>
                            <p className="font-mono text-sm">{userData?.bpexchUsername || 'Not set'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-3 rounded-md border bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                             <p className="text-xs font-semibold">Password</p>
                            <p className="font-mono text-sm">{userData?.bpexchPassword || 'Not set'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div> : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loginActivity.length > 0 ? loginActivity.map((activity) => {
                    const isBlocked = userData?.blockedIps?.includes(activity.ip);
                    return (
                    <TableRow key={activity.id}>
                        <TableCell>
                        <div className="font-medium">{activity.date}</div>
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                        </TableCell>
                        <TableCell className="font-mono">{activity.ip}</TableCell>
                        <TableCell className="text-right">
                            <Button variant={isBlocked ? "secondary" : "destructive"} size="sm" onClick={() => toggleIpBlock(activity.ip)}>
                            {isBlocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                            {isBlocked ? "Unblock" : "Block"}
                            </Button>
                        </TableCell>
                    </TableRow>
                    )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No recent activity.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Weekly Access Chart</CardTitle>
            <CardDescription>Your BPExch account access over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div> : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="logins" stroke="var(--color-logins)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
