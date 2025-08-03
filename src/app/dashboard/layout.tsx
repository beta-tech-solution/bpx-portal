
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, DollarSign, Landmark, ExternalLink, Settings, LogOut, Loader2, ArrowRightLeft } from "lucide-react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Preloader from "@/components/preloader";
import ChatWidget from "@/components/chat-widget";
import { DashboardHeader } from "@/components/dashboard-header";
import { BottomNav } from "@/components/bottom-nav";

interface UserData {
    fullName: string;
    email: string;
    balance: number;
    photoURL?: string;
    role: 'Admin' | 'User';
    emailVerified: boolean;
    bpexchUsername?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (userData === null) { // Prevent re-fetching user data on every auth state change
            const userDocRef = doc(db, "users", currentUser.uid);
            const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const dbData = doc.data() as UserData;
                     if (dbData.role !== 'Admin' && !currentUser.emailVerified) {
                        toast({
                            title: "Email Not Verified",
                            description: "Please check your inbox and verify your email address to log in.",
                            variant: "destructive"
                        });
                        signOut(auth);
                        return;
                    }
                    setUser(currentUser);
                    setUserData(dbData);
                    setLoading(false);
                } else {
                    toast({ title: "Error", description: "User profile not found.", variant: "destructive"});
                    signOut(auth);
                }
            }, (error) => {
                 toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive"});
                 console.error("Firestore snapshot error:", error);
                 signOut(auth);
            });
             return () => unsubscribeSnapshot();
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router, toast, userData]);

  if (loading) {
    return <Preloader loadingText="Loading Dashboard..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <DashboardHeader user={user} userData={userData} />
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
      </main>
      {user && <ChatWidget />}
      <BottomNav />
    </div>
  );
}
