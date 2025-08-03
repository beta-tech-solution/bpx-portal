
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowRightLeft, DollarSign, Landmark, ExternalLink } from 'lucide-react';
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
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    
                    return (
                        <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center gap-1 w-full h-full">
                           <div className={cn("p-2 rounded-full transition-colors", isActive ? "bg-primary/10" : "")}>
                             <item.icon className={cn("w-6 h-6 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')} />
                           </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
};
