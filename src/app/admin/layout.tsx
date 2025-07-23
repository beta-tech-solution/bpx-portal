
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Send,
  Landmark,
  LogOut,
  Users,
  Settings,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, countKey: null },
    { href: "/admin/users", label: "Users", icon: Users, countKey: null },
    { href: "/admin/deposits", label: "Deposits", icon: DollarSign, countKey: 'deposits' },
    { href: "/admin/transfers", label: "Transfers", icon: Send, countKey: 'transfers' },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Landmark, countKey: 'withdrawals' },
    { href: "/admin/settings", label: "Settings", icon: Settings, countKey: null },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCounts, setPendingCounts] = React.useState({
      deposits: 0,
      transfers: 0,
      withdrawals: 0
  });

  React.useEffect(() => {
      const collections = {
          deposits: collection(db, 'deposits'),
          transfers: collection(db, 'transfers'),
          withdrawals: collection(db, 'withdrawals')
      };

      const unsubscribes = Object.entries(collections).map(([key, coll]) => {
          const q = query(coll, where('status', '==', 'Pending'));
          return onSnapshot(q, (snapshot) => {
              setPendingCounts(prev => ({ ...prev, [key]: snapshot.size }));
          });
      });
      
      return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const isActive = (path: string) => pathname.startsWith(path);

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.label;
    if (pathname.includes('/admin/users/')) return "User Details";
    const parts = pathname.split('/').pop()?.replace(/-/g, ' ').split(' ') ?? [];
    return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
            {navItems.map((item) => {
                const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
                return (
                 <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                   onClick={() => router.push(item.href)}
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
                    <AvatarImage src="https://placehold.co/40x40" data-ai-hint="admin avatar" alt="Admin" />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-sidebar-foreground">Admin User</p>
                    <p className="text-xs text-sidebar-foreground/70">admin@bpx.com</p>
                </div>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => router.push('/login')}>
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
                {navItems.map((item) => {
                     const count = item.countKey ? pendingCounts[item.countKey as keyof typeof pendingCounts] : 0;
                     return (
                    <Link href={item.href} key={item.href} className={`relative flex flex-col items-center justify-center gap-1 w-full h-full ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="w-6 h-6"/>
                        <span className="text-xs text-center">{item.label}</span>
                        {count > 0 && (
                            <div className="absolute top-1 right-4 text-xs bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center">
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

    