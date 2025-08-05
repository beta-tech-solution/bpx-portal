
"use client"

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Wallet, ChevronRight, User, History, Copy, Eye, EyeOff, KeyRound, Phone, Mail } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AppLogo } from './app-logo';

const navLinks = [
    { href: "/dashboard/settings", label: "My Profile", icon: User },
    { href: "/dashboard/deposit/history", label: "Deposit History", icon: History },
    { href: "/dashboard/withdraw/history", label: "Withdrawal History", icon: History },
];

const InfoRow = ({ label, value, icon: Icon, isPassword = false }: { label: string, value: string | undefined, icon: React.ElementType, isPassword?: boolean }) => {
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(!isPassword);

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            toast({ title: "Copied!", description: `${label} has been copied.` });
        }
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                    <span className="text-sm font-semibold">{label}</span>
                    <p className="text-xs text-muted-foreground">{isVisible ? value : '••••••••'}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {isPassword && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                )}
                {value && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

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
        if (pathname === '/dashboard/deposit/history') {
            return 'Deposit History';
        }
        if (pathname === '/dashboard/withdraw/history') {
            return 'Withdrawal History';
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
                {/* Mobile View */}
                <div className="flex items-center gap-3 md:hidden flex-1">
                     <div>
                        <h1 className="text-xl font-bold">{getPageTitle()}</h1>
                        {pathname === '/dashboard' && <p className="text-base font-semibold">{userData?.fullName}</p>}
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:flex flex-1">
                     <div>
                        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
                        {pathname === '/dashboard' && <p className="text-base font-semibold">{userData?.fullName}</p>}
                    </div>
                </div>

                <div className="flex justify-center flex-shrink-0 mx-4">
                    <Link href="/dashboard">
                        <AppLogo className="h-10 md:h-[60px] w-auto" />
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-end">
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
                            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {navLinks.map(link => (
                                   <Link href={link.href} key={link.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                       <div className="flex items-center gap-3">
                                           <link.icon className="h-5 w-5 text-primary" />
                                           <span className="font-semibold">{link.label}</span>
                                       </div>
                                       <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                   </Link>
                                ))}
                                 <div className="pt-4 mt-4 border-t">
                                    <h3 className="px-3 py-2 font-headline text-muted-foreground text-sm">Your Information</h3>
                                    <InfoRow label="Full Name" value={userData?.fullName} icon={User} />
                                    <InfoRow label="Email" value={userData?.email} icon={Mail} />
                                    <InfoRow label="Phone" value={userData?.phone} icon={Phone} />
                                    <InfoRow label="BPExch Username" value={userData?.bpexchUsername} icon={User} />
                                    <InfoRow label="BPExch Password" value={userData?.bpexchPassword} icon={KeyRound} isPassword={true} />
                                </div>
                            </div>
                            <div className="p-4 mt-auto">
                                <Button variant="destructive" onClick={handleLogout} className="w-full justify-center gap-3 p-3 text-base shadow-lg hover:shadow-xl transition-shadow drop-shadow-md hover:drop-shadow-lg">
                                    <LogOut className="h-5 w-5"/>
                                    <span className="font-semibold">Logout</span>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
