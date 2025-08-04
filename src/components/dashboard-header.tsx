
"use client"

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Wallet, ChevronRight, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AppLogo } from './app-logo';

const navLinks = [
    { href: "/dashboard/settings", label: "My Profile", icon: Settings },
];

export const DashboardHeader = ({ user, userData }: { user: any, userData: any }) => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const [greeting, setGreeting] = useState("Welcome");

    useEffect(() => {
        const hours = new Date().getHours();
        if (hours < 12) setGreeting("Good morning");
        else if (hours < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    const getPageTitle = () => {
        if (pathname === '/dashboard') {
            return `${greeting},`;
        }
        const parts = pathname.split('/').pop()?.replace(/-/g, ' ') ?? [];
        return parts.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    
    const getInitials = (name: string | undefined | null): string => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1 && names[0] && names[names.length - 1]) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: "Logged Out" });
            router.push('/login');
        } catch (error) {
            toast({ title: "Logout Failed", variant: "destructive" });
        }
    }

    return (
        <header className="bg-slate-800 text-white rounded-b-3xl shadow-lg p-4 md:px-6 sticky top-0 z-40">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">{getPageTitle()}</h1>
                    {pathname === '/dashboard' && <p className="text-base font-semibold">{userData?.fullName}</p>}
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                         <Avatar className="cursor-pointer h-10 w-10 border-2 border-white/50">
                            <AvatarImage src={userData?.photoURL} alt={userData?.fullName} />
                            <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                        </Avatar>
                    </SheetTrigger>
                    <SheetContent className="bg-muted/95 p-0 flex flex-col">
                        <SheetHeader className="p-4 bg-slate-800 text-white text-left">
                             <div className="flex items-center gap-3">
                                 <Avatar className="h-12 w-12 border-2 border-white/50">
                                    <AvatarImage src={userData?.photoURL} alt={userData?.fullName} />
                                    <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg">{userData?.fullName}</p>
                                    <p className="text-xs text-white/70">{userData?.email}</p>
                                </div>
                            </div>
                        </SheetHeader>
                        <div className="flex-1 p-4 space-y-2">
                             {navLinks.map(link => (
                                <Link href={link.href} key={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <link.icon className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{link.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                </Link>
                             ))}
                        </div>
                        <div className="p-4 mt-auto">
                            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 p-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <LogOut className="h-5 w-5"/>
                                <span className="font-semibold">Logout</span>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};
