
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CalendarCheck, Hand, Copy, ExternalLink, Wallet, FileText, Download, Megaphone } from "lucide-react"
import { auth, db } from "@/lib/firebase/config"
import { collection, query, where, doc, orderBy, limit, Timestamp, getDocs, getDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Transaction {
    id: string;
    type: "Deposit" | "Withdrawal";
    date: string;
    amount: string;
    status: "Approved" | "Pending" | "Rejected";
    createdAt: Timestamp;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [globalAnnouncement, setGlobalAnnouncement] = useState<string | null>(null);
    
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch user data, announcement, and transactions in parallel
                const userDocRef = doc(db, "users", user.uid);
                const announcementDocRef = doc(db, "settings", "globalAnnouncement");
                const depositsQuery = query(collection(db, "deposits"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
                const withdrawalsQuery = query(collection(db, "withdrawals"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));

                const [
                    userDocSnap,
                    announcementDocSnap,
                    depositsSnap,
                    withdrawalsSnap
                ] = await Promise.all([
                    getDoc(userDocRef),
                    getDoc(announcementDocRef),
                    getDocs(depositsQuery),
                    getDocs(withdrawalsQuery)
                ]);

                // Process user data
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                }

                // Process announcement
                if (announcementDocSnap.exists() && announcementDocSnap.data().message) {
                    setGlobalAnnouncement(announcementDocSnap.data().message);
                } else {
                    setGlobalAnnouncement(null);
                }

                // Process transactions
                const deposits = depositsSnap.docs.map(doc => ({ id: doc.id, type: 'Deposit', ...doc.data() } as Transaction));
                const withdrawals = withdrawalsSnap.docs.map(doc => ({ id: doc.id, type: 'Withdrawal', ...doc.data() } as Transaction));
                
                const allTransactions = [...deposits, ...withdrawals]
                    .sort((a, b) => (b.createdAt?.toDate() ?? 0) > (a.createdAt?.toDate() ?? 0) ? 1 : -1)
                    .slice(0, 10);
                
                setRecentTransactions(allTransactions);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
    }, [user, toast]);

    const handleCopy = (text: string, label: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            toast({ title: `${label} Copied!` });
        }
    };
    
     const statusVariant = {
        Approved: "secondary",
        Pending: "default",
        Rejected: "destructive",
    } as const;

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <>
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-bold text-lg">{userData?.createdAt ? format((userData.createdAt as Timestamp).toDate(), 'PPP') : 'N/A'}</p>
                </div>
                 <Link href="/dashboard/deposit" className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-colors border border-white hover:border-transparent bg-gradient-to-r from-primary to-blue-400 hover:shadow-lg drop-shadow-lg">
                    Deposit
                 </Link>
            </CardContent>
        </Card>
        
        <Card className="bg-slate-800 text-white">
            <CardHeader className="p-4 flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">BPExch Account</CardTitle>
                <Badge variant={userData?.bpexchUsername ? "secondary" : "destructive"}>
                    {userData?.bpexchUsername ? "Active" : "Not Activated"}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {userData?.bpexchUsername ? (
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-md bg-slate-700">
                           <span className="text-sm font-mono">{userData.bpexchUsername}</span>
                           <Button size="icon" variant="ghost" onClick={() => handleCopy(userData.bpexchUsername, 'Username')}>
                               <Copy className="h-4 w-4"/>
                           </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md bg-slate-700">
                           <span className="text-sm font-mono tracking-widest">{userData.bpexchPassword}</span>
                           <Button size="icon" variant="ghost" onClick={() => handleCopy(userData.bpexchPassword, 'Password')}>
                               <Copy className="h-4 w-4"/>
                           </Button>
                        </div>
                    </div>
                ) : (
                    <Link href="/dashboard/account-activation" passHref>
                        <Button className="w-full bg-slate-600 hover:bg-slate-500 justify-center">
                            <Hand className="mr-2 h-4 w-4 animate-bounce-horizontal-right" />
                            Activate Your Account
                            <Hand className="ml-2 h-4 w-4 transform -scale-x-100 animate-bounce-horizontal-left" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>

        {globalAnnouncement && (
            <Card className="bg-amber-400 overflow-hidden">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="bg-amber-500 p-2 rounded-md flex-shrink-0">
                        <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 whitespace-nowrap overflow-hidden">
                         <div className="flex animate-marquee">
                            <p className="font-bold text-xl text-black px-4">{globalAnnouncement}</p>
                            <p className="font-bold text-xl text-black px-4">{globalAnnouncement}</p>
                         </div>
                    </div>
                </CardContent>
            </Card>
        )}

        <Card className="bg-slate-800 text-white">
             <Link href="https://bpexch.net/Users/Login" target="_blank" className="flex items-center justify-center p-3">
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="font-semibold text-sm">BPEXCH.COM</span>
            </Link>
        </Card>
        
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {recentTransactions.map(tx => (
                             <div key={tx.id} className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'Deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{tx.type}</p>
                                        <p className="text-xs text-muted-foreground">{tx.createdAt ? format(tx.createdAt.toDate(), 'PP') : 'N/A'}</p>
                                        {tx.type === 'Withdrawal' && (
                                            <p className="text-xs text-muted-foreground">{tx.bankName} - {tx.accountNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold font-mono">PKR {parseFloat(tx.amount).toFixed(2)}</p>
                                    <Badge variant={statusVariant[tx.status as keyof typeof statusVariant]}>{tx.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">No Record Found!</p>
                )}
            </CardContent>
            {recentTransactions.length > 0 && (
                <CardFooter className="p-4 pt-0 flex gap-2">
                     <Button variant="outline" className="w-full" asChild><Link href="/dashboard/deposit/history">Deposit History</Link></Button>
                     <Button variant="outline" className="w-full" asChild><Link href="/dashboard/withdraw/history">Withdrawal History</Link></Button>
                </CardFooter>
            )}
        </Card>
    </>
  )
}
