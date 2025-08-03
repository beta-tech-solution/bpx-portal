
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CalendarCheck, Hand, Copy, ExternalLink, Wallet, FileText, Download, Megaphone } from "lucide-react"
import { auth, db } from "@/lib/firebase/config"
import { collection, query, where, onSnapshot, doc, orderBy, limit, Timestamp } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
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
    // Optional fields for withdrawal details
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [depositsData, setDepositsData] = useState<Transaction[]>([]);
    const [withdrawalsData, setWithdrawalsData] = useState<Transaction[]>([]);
    const [globalAnnouncement, setGlobalAnnouncement] = useState<string | null>(null);
    
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setLoading(false);
            }
        });
        
        const announcementDocRef = doc(db, "settings", "globalAnnouncement");
        const unsubscribeAnnouncement = onSnapshot(announcementDocRef, (docSnap) => {
            if(docSnap.exists() && docSnap.data().message) {
                setGlobalAnnouncement(docSnap.data().message);
            } else {
                setGlobalAnnouncement(null);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeAnnouncement();
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
            }
            setLoading(false);
        });
        
        const depositsQuery = query(collection(db, "deposits"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
        const unsubDeposits = onSnapshot(depositsQuery, (snapshot) => {
            const deposits = snapshot.docs.map(doc => ({ id: doc.id, type: 'Deposit', ...doc.data() } as Transaction));
            setDepositsData(deposits);
        });

        const withdrawalsQuery = query(collection(db, "withdrawals"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
        const unsubWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
            const withdrawals = snapshot.docs.map(doc => ({ id: doc.id, type: 'Withdrawal', ...doc.data() } as Transaction));
            setWithdrawalsData(withdrawals);
        });

        return () => { 
            unsubscribeUser();
            unsubDeposits();
            unsubWithdrawals();
        };

    }, [user]);

    useEffect(() => {
        const allTransactions = [...depositsData, ...withdrawalsData]
            .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        setRecentTransactions(allTransactions);
    }, [depositsData, withdrawalsData]);
    
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
    <div className="space-y-4 md:space-y-6">
        {/* Member Since Card */}
        <Card className="shadow-md">
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
        
        {/* BPExch Account Card */}
        <Card className="shadow-md bg-slate-800 text-white">
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

        {/* Global Announcement Card */}
        {globalAnnouncement && (
            <Card className="shadow-md bg-amber-400 overflow-hidden">
                <CardContent className="p-3 flex items-center gap-4">
                    <div className="bg-amber-500 p-2 rounded-md">
                        <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 whitespace-nowrap overflow-hidden">
                        <p className="font-bold text-xl text-black inline-block animate-marquee">{globalAnnouncement}</p>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* BPEXCH.COM Link Card */}
        <Card className="shadow-md bg-slate-800 text-white">
             <Link href="https://bpexch.net/Users/Login" target="_blank" className="flex items-center justify-center p-3">
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="font-semibold text-sm">BPEXCH.COM</span>
            </Link>
        </Card>
        
        {/* Recent Transactions Card */}
        <Card className="shadow-md">
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
        
         {/* Download App Card */}
         <Card className="shadow-md relative overflow-hidden text-white bg-gradient-to-tr from-cyan-400 to-blue-600">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 animate-shine" />
             <CardContent className="p-6 flex flex-col items-center text-center">
                 <div className="p-3 bg-white/20 rounded-2xl mb-4">
                    <Image src="/images/logo.png" width={40} height={40} alt="App Logo" className="rounded-lg" unoptimized />
                 </div>
                 <h3 className="font-bold text-xl">Download Our App</h3>
                 <p className="text-sm text-white/80 mt-1 mb-6 max-w-xs">Get the fastest and safest payment experience right from your phone.</p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="#" passHref>
                        <Image src="/images/appstore.png" alt="Download on the App Store" width={150} height={50} className="object-contain" unoptimized/>
                    </Link>
                    <Link href="#" passHref>
                        <Image src="/images/play.png" alt="Get it on Google Play" width={150} height={50} className="object-contain" unoptimized/>
                    </Link>
                 </div>
             </CardContent>
         </Card>
    </div>
  )
}
