
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowRightLeft, DollarSign, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/transfer', label: 'Transfer', icon: ArrowRightLeft },
    { href: '/dashboard/deposit', label: 'Deposit', icon: DollarSign },
    { href: '/dashboard/withdraw', label: 'Withdraw', icon: Landmark },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-top z-40 md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    // Special case for deposit/withdraw history pages
                    const isActive = (pathname === item.href) || 
                                     (item.href === '/dashboard/deposit' && pathname.startsWith('/dashboard/deposit')) ||
                                     (item.href === '/dashboard/withdraw' && pathname.startsWith('/dashboard/withdraw'));
                                     
                    if(item.href === '/dashboard/transfer') return null; // Remove transfer page for now

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
