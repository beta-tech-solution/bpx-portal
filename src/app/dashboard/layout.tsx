
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DollarSign, Send, Landmark, LogOut, Wallet, ExternalLink, LayoutDashboard, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/deposit", label: "Deposit", icon: DollarSign },
    { href: "/dashboard/transfer", label: "Transfer", icon: Send },
    { href: "/dashboard/withdraw", label: "Withdrawal", icon: Landmark },
    { href: "/dashboard/bpexch-login", label: "BPExch Login", icon: ExternalLink },
]

interface UserData {
    fullName: string;
    email: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast({ title: "Error", description: "Could not fetch user details.", variant: "destructive" });
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleLogout = async () => {
      try {
          await signOut(auth);
          toast({ title: "Logged Out", description: "You have been successfully logged out." });
          router.push('/login');
      } catch (error) {
          console.error("Logout error:", error);
          toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
      }
  }

  const isActive = (path: string) => pathname === path;

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.label;
    const parts = pathname.split('/').pop()?.replace(/-/g, ' ').split(' ') ?? [];
    return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Wallet className="w-6 h-6"/>
                </div>
                <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">
                    BPX Portal
                </h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                   onClick={() => router.push(item.href)}
                   isActive={isActive(item.href)}
                   tooltip={item.label}
                 >
                   <item.icon />
                   <span>{item.label}</span>
                 </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 bg-sidebar-accent/10 p-2 rounded-lg">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" data-ai-hint="person avatar" alt={userData?.fullName} />
                    <AvatarFallback>{userData?.fullName?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">{userData?.fullName ?? 'User'}</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">{userData?.email ?? 'user@bpx.com'}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                    <LogOut className="w-4 h-4"/>
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:p-6 bg-card md:bg-transparent">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <h2 className="text-2xl font-bold font-headline text-center md:text-left flex-1 md:flex-none">
                {getPageTitle()}
            </h2>
        </header>
        <main className="flex-1 p-4 md:p-6 mb-20 md:mb-0">
            {children}
        </main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-10">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="w-6 h-6"/>
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}

    
