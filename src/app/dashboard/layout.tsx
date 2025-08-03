
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
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
    lastSeen?: any;
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
                    
                    // Update lastSeen on initial load and if it's been a while
                    const now = Date.now();
                    const lastSeen = dbData.lastSeen?.toMillis() || 0;
                    if(now - lastSeen > 5 * 60 * 1000) { // 5 minutes
                        updateDoc(userDocRef, { lastSeen: serverTimestamp() });
                    }
                    
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

    // Update lastSeen timestamp periodically for 'online' status
    const interval = setInterval(() => {
        if(auth.currentUser){
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            updateDoc(userDocRef, { lastSeen: serverTimestamp() });
        }
    }, 2 * 60 * 1000); // every 2 minutes

    return () => {
        unsubscribeAuth();
        clearInterval(interval);
    };
  }, [router, toast, userData]);

  if (loading) {
    return <Preloader loadingText="Loading Dashboard..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <DashboardHeader user={user} userData={userData} />
      <main className="flex-1 p-4 md:p-6 pb-32">
          {children}
      </main>
      {user && <ChatWidget />}
      <BottomNav />
    </div>
  );
}
