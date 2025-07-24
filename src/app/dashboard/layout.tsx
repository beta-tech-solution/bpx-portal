
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
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DollarSign, Send, Landmark, LogOut, Wallet, ExternalLink, LayoutDashboard, Loader2, Settings, MoreVertical } from "lucide-react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Preloader from "@/components/preloader";

const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/deposit", label: "Deposit", icon: DollarSign },
    { href: "/dashboard/transfer", label: "Transfer", icon: Send },
    { href: "/dashboard/withdraw", label: "Withdrawal", icon: Landmark },
];

const mobileHeaderItems = [
     { href: "/dashboard/bpexch-login", label: "BPExch Login", icon: ExternalLink },
     { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const allNavItems = [...mainNavItems, ...mobileHeaderItems];


interface UserData {
    fullName: string;
    email: string;
    balance: number;
    photoURL?: string;
    role: 'Admin' | 'User';
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
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(true);
  
  const getPageTitle = () => {
    const currentItem = allNavItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.label;
    const parts = pathname.split('/').pop()?.replace(/-/g, ' ').split(' ') ?? [];
    return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  React.useEffect(() => {
    // Show preloader for a moment on initial load
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
        setIsNavigating(true);
        router.push(href);
    }
  }

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data()?.role === 'Admin' && !pathname.startsWith('/admin')) {
             // Admin on user dashboard, allow for now or redirect
        } else if (userDoc.exists() && userDoc.data()?.role === 'User') {
            // Standard user flow
        } else if (userDoc.exists() && userDoc.data()?.role === 'Admin' && pathname.startsWith('/admin')) {
            // Admin on admin dashboard, this layout shouldn't even be active.
        }
        else {
            router.push("/login");
            return;
        }

        setUser(currentUser);
        await updateDoc(userDocRef, { lastSeen: serverTimestamp() });
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          toast({ title: "Error", description: "Could not fetch user details.", variant: "destructive" });
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        router.push("/login");
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, [router, toast, pathname]);

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

  const getInitials = (name: string | undefined | null): string => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadingText = `Loading My ${getPageTitle()}`;

  if (loading || pageLoading || isNavigating) {
    return <Preloader loadingText={loadingText} />;
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
            <SidebarGroup>
                <SidebarGroupLabel>Wallet Balance</SidebarGroupLabel>
                <div className="p-2 font-bold text-2xl font-mono text-sidebar-foreground">
                    PKR {userData?.balance?.toFixed(2) ?? '0.00'}
                </div>
            </SidebarGroup>
          <SidebarMenu>
            {allNavItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                   onClick={() => handleNavigation(item.href)}
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
                    <AvatarImage src={userData?.photoURL} data-ai-hint="person avatar" alt={userData?.fullName} />
                    <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
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
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
                 <h2 className="text-2xl font-bold font-headline md:hidden">
                    {getPageTitle()}
                </h2>
            </div>
            <h2 className="text-2xl font-bold font-headline text-center hidden md:block flex-1 md:flex-none">
                {getPageTitle()}
            </h2>
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {mobileHeaderItems.map((item) => (
                            <DropdownMenuItem key={item.href} onClick={() => handleNavigation(item.href)}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 mb-20 md:mb-0">
            {children}
        </main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-10">
            <div className="flex justify-around items-center h-16">
                {mainNavItems.map((item) => (
                    <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="w-5 h-5"/>
                        <span className="text-[10px]">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}

    