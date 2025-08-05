
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Landmark, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/deposit', label: 'Deposit', icon: DollarSign },
    { href: '/dashboard/withdraw', label: 'Withdraw', icon: Landmark },
    { href: '/dashboard/bpexch-login', label: 'BPExch Login', icon: ExternalLink },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-top z-40">
            {/* Mobile Nav */}
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto md:hidden">
                {navItems.map((item) => {
                    const isActive = (item.href === '/dashboard' && pathname === '/dashboard') || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            href={item.href}
                            key={item.href}
                            className="flex flex-col items-center justify-center gap-1 w-full h-full"
                        >
                            <div className={cn(
                                "p-2 rounded-full transition-colors",
                                isActive ? "bg-primary/10" : ""
                            )}>
                                <item.icon className={cn(
                                    "w-6 h-6 transition-colors",
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors",
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Desktop Nav */}
             <div className="hidden md:flex justify-around items-center h-20 w-full">
                {navItems.map((item) => {
                     const isActive = (item.href === '/dashboard' && pathname === '/dashboard') || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            href={item.href}
                            key={item.href}
                            className="flex flex-col items-center justify-center gap-1.5 group"
                        >
                            <div className={cn(
                                "p-3 rounded-full transition-colors",
                                isActive ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"
                            )}>
                                <item.icon className={cn(
                                    "w-6 h-6 transition-colors",
                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                )} />
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors",
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
