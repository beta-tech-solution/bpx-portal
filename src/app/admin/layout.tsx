
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
  SidebarMenuBadge
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Landmark,
  LogOut,
  Settings,
  Shield,
  LayoutDashboard,
  Activity,
  Loader2,
  MessageSquare,
  BarChart2
} from "lucide-react";
import { db, auth } from "@/lib/firebase/config";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Preloader from "@/components/preloader";
import { Badge } from "@/components/ui/badge";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, countKey: null },
    { href: "/admin/deposits", label: "Deposits", icon: DollarSign, countKey: 'deposits' },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Landmark, countKey: 'withdrawals' },
    { href: "/admin/profit-stats", label: "Profit Stats", icon: BarChart2, countKey: null },
];

const mobileHeaderItems = [
    { href: "/admin/bpexch-activity", label: "Login Activity", icon: Activity, countKey: null },
    { href: "/admin/settings", label: "Settings", icon: Settings, countKey: null },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, loadingUser, error] = useAuthState(auth);
  const [adminProfile, setAdminProfile] = React.useState({ name: 'Admin User', email: 'admin@bpx.com', photoURL: ''});
  const [isAuthorizing, setIsAuthorizing] = React.useState(true);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(false);

  const [pendingCounts, setPendingCounts] = React.useState({
      deposits: 0,
      withdrawals: 0,
      chats: 0,
  });

  const fullNavItems = [ ...navItems, { href: "/admin/chat", label: "Support Chat", icon: MessageSquare, countKey: 'chats' }, { href: "/admin/bpexch-activity", label: "Login Activity", icon: Activity, countKey: null }, { href: "/admin/settings", label: "Settings", icon: Settings, countKey: null }];
  const getPageTitle = () => {
    const currentItem = fullNavItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.label;
    if (pathname.includes('/admin/users/')) return "User Details";
    if (pathname.includes('/admin/chat/')) return "Support Chat";
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
    if (pathname === '/admin/login') {
        setIsAuthorizing(false);
        return;
    }

    if (loadingUser) return;
    if (error) {
        console.error("Auth error:", error);
        router.push('/admin/login');
        return;
    }
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === 'Admin') {
          setAdminProfile({
            name: userData.fullName || 'Admin User',
            email: userData.email || '',
            photoURL: userData.photoURL || ''
          });
          setIsAuthorizing(false);
        } else {
          toast({ title: "Access Denied", description: "You are not authorized to access this panel.", variant: "destructive" });
          router.push('/dashboard');
        }
      } else {
         toast({ title: "Access Denied", description: "User profile not found.", variant: "destructive" });
         signOut(auth);
         router.push('/admin/login');
      }
    }, (err) => {
        console.error("Firestore snapshot error:", err);
        toast({ title: "Error", description: "Could not verify admin status.", variant: "destructive" });
        signOut(auth);
        router.push('/admin/login');
    });

    return () => unsubscribe();
  }, [user, loadingUser, router, error, toast, pathname]);

  React.useEffect(() => {
      if (pathname === '/admin/login' || !user) return;
      
      const collections = {
          deposits: collection(db, 'deposits'),
          withdrawals: collection(db, 'withdrawals'),
          chats: collection(db, 'chats')
      };

      const unsubscribes = Object.entries(collections).map(([key, coll]) => {
          let q;
          if (key === 'chats') {
              q = query(coll, where('adminRead', '==', false));
          } else {
              q = query(coll, where('status', '==', 'Pending'));
          }
          return onSnapshot(q, (snapshot) => {
              setPendingCounts(prev => ({ ...prev, [key]: snapshot.size }));
          });
      });
      
      return () => unsubscribes.forEach(unsub => unsub());
  }, [pathname, user]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/admin/login');
    } catch (error) {
        console.error("Logout error:", error);
        toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  }

  const isActive = (path: string) => pathname.startsWith(path);
  
  const getInitials = (name: string | undefined | null): string => {
    if (!name) return 'A';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadingText = `Loading ${getPageTitle()}`;

  if (pageLoading || isNavigating) {
      return <Preloader loadingText={loadingText} />
  }
  
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isAuthorizing || loadingUser) {
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
                    <Shield className="w-6 h-6"/>
                </div>
                <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">
                    Admin Panel
                </h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {fullNavItems.map((item) => {
                const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
                return (
                 <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                   onClick={() => handleNavigation(item.href)}
                   isActive={isActive(item.href)}
                   tooltip={item.label}
                 >
                   <item.icon />
                   <span>{item.label}</span>
                   {count > 0 && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
                 </SidebarMenuButton>
               </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 bg-sidebar-accent/10 p-2 rounded-lg">
                <Avatar>
                    <AvatarImage src={adminProfile.photoURL || undefined} data-ai-hint="admin avatar" alt="Admin" />
                    <AvatarFallback>{getInitials(adminProfile.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">{adminProfile.name}</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">{adminProfile.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                    <LogOut className="w-4 h-4"/>
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:p-6 bg-card md:bg-transparent">
            <div className="flex-1">
                 <SidebarTrigger className="md:hidden" />
            </div>
            <h2 className="text-2xl font-bold font-headline text-center hidden md:block">
                {getPageTitle()}
            </h2>
            <div className="flex-1 justify-end items-center flex md:hidden gap-2">
                 {mobileHeaderItems.map((item) => (
                    <Button key={item.href} variant="ghost" size="icon" onClick={() => handleNavigation(item.href)}>
                        <item.icon />
                        <span className="sr-only">{item.label}</span>
                    </Button>
                ))}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 mb-20 md:mb-0 overflow-hidden">
            {children}
        </main>
        
        {/* Floating Chat Button for Mobile */}
        <div className="md:hidden fixed bottom-20 right-4 z-50">
            <Button onClick={() => handleNavigation('/admin/chat')} size="icon" className="rounded-full w-14 h-14 shadow-lg relative">
                <MessageSquare />
                {pendingCounts.chats > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{pendingCounts.chats}</Badge>}
            </Button>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-10">
            <div className="flex justify-center items-center h-16 gap-2">
                {navItems.map((item) => {
                     const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
                     return (
                    <Link href={item.href} key={item.href} className={`relative flex flex-col items-center justify-center gap-1 w-full h-full ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="w-6 h-6"/>
                        <span className="text-xs text-center">{item.label}</span>
                        {count > 0 && (
                            <div className="absolute top-1 right-1/4 text-xs bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center">
                                {count}
                            </div>
                        )}
                    </Link>
                )})}
            </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
