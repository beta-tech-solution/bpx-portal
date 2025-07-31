
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Users, Phone, HelpCircle, UserPlus, LogIn, LayoutDashboard, DollarSign, Landmark, ExternalLink, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot } from "firebase/firestore";
import React from "react";

const navLinks = [
    { href: "/", name: "Home", icon: Home },
    { href: "/about-us", name: "About Us", icon: Users },
    { href: "/contact-us", name: "Contact", icon: Phone },
    { href: "/#faq", name: "FAQs", icon: HelpCircle },
];

const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/deposit", label: "Deposit", icon: DollarSign },
    { href: "/dashboard/withdraw", label: "Withdrawal", icon: Landmark },
    { href: "/dashboard/bpexch-login", label: "BPExch Login", icon: ExternalLink },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const SiteHeader = () => {
    const pathname = usePathname();
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [userData, setUserData] = React.useState<{ fullName?: string; photoURL?: string } | null>(null);

    React.useEffect(() => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data() as { fullName?: string; photoURL?: string });
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    const activeLink = navLinks.find(link => link.href === pathname) || navLinks.find(link => pathname.startsWith(link.href) && link.href !== "/") || null;

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
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
        } catch (error) {
            toast({ title: "Logout Failed", description: "Could not log out.", variant: "destructive" });
        }
    }

    return (
        <header className="absolute top-0 left-0 w-full z-50 animate-fade-in">
            <div className="h-[20px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 animate-shine" />
            <div className="bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between h-20 px-[5%]">
                    <Link href="/" aria-label="Back to homepage">
                        <AppLogo className="h-10 w-auto" />
                    </Link>

                    <nav className="hidden md:flex items-center h-full">
                        <ul className="flex items-center h-full gap-8">
                            {navLinks.map((link) => {
                                const isActive = activeLink?.href === link.href;
                                return (
                                    <li key={link.name} className="h-full">
                                        <Link href={link.href} className="group relative flex flex-col items-center justify-center h-full px-2 text-sm font-medium transition-colors text-white/70 hover:text-white">
                                            <div className="relative flex flex-col items-center justify-center gap-1.5 pb-2">
                                                {isActive && (
                                                    <div
                                                        className="absolute -top-7 w-20 h-16 bg-primary"
                                                        style={{
                                                            clipPath: 'path("M0 0 H80 V40 C60 65, 20 65, 0 40Z")'
                                                        }}
                                                    />
                                                )}
                                                <div className="relative z-10">
                                                    <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/70 group-hover:text-white")} />
                                                </div>
                                                <span className={cn("relative z-10", { "text-white": isActive })}>{link.name}</span>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                     
                    <div className="hidden md:flex items-center gap-2">
                         {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                        <div className="relative h-10 w-10 rounded-full animate-circular-shine p-0.5">
                                            <Avatar className="h-full w-full">
                                                <AvatarImage src={userData?.photoURL} alt={userData?.fullName} />
                                                <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64" align="end" forceMount>
                                    <div className="p-2 overflow-hidden">
                                        <div className="relative p-4 rounded-md flex flex-col items-center justify-center text-center bg-primary text-primary-foreground overflow-hidden">
                                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 animate-shine -z-10" />
                                            <DropdownMenuLabel className="text-base font-bold p-0 text-white">{userData?.fullName}</DropdownMenuLabel>
                                            <p className="text-xs text-white/80">Welcome Back!</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className="p-1">
                                    {dashboardLinks.map(link => (
                                         <DropdownMenuItem key={link.href} asChild>
                                            <Link href={link.href} className="cursor-pointer">
                                                <link.icon className="mr-2 h-4 w-4" />
                                                <span>{link.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         ) : (
                             <>
                                <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-colors border border-white hover:border-transparent hover:bg-gradient-to-r from-primary to-blue-400">
                                   <LogIn className="h-4 w-4" /> Login
                                </Link>
                                <Link href="/signup" className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                   <UserPlus className="h-4 w-4" /> Register
                                </Link>
                             </>
                         )}
                    </div>

                    <div className="md:hidden">
                       <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors">
                           Login
                       </Link>
                   </div>
                </div>
            </div>
        </header>
    );
};
