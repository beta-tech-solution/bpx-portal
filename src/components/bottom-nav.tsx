
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Landmark, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home, external: false },
    { href: '/dashboard/deposit', label: 'Deposit', icon: DollarSign, external: false },
    { href: '/dashboard/withdraw', label: 'Withdraw', icon: Landmark, external: false },
    { href: 'https://bpexch.net/Users/Login', label: 'BPExch Login', icon: ExternalLink, external: true },
];

export const BottomNav = () => {
    const pathname = usePathname();

    const renderNavItem = (item: typeof navItems[0], isMobile: boolean) => {
        const isActive = !item.external && (item.href === '/dashboard' && pathname === '/dashboard') || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        
        const linkContent = (
            <>
                <div className={cn(
                    "p-2 rounded-full transition-colors",
                    isMobile ? (isActive ? "bg-primary/10" : "") : (isActive ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"),
                    isMobile ? "" : "p-3"
                )}>
                    <item.icon className={cn(
                        "w-6 h-6 transition-colors",
                        isActive ? 'text-primary' : (isMobile ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-primary')
                    )} />
                </div>
                <span className={cn(
                    "font-medium transition-colors",
                    isMobile ? "text-[10px]" : "text-xs",
                    isActive ? 'text-primary' : (isMobile ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-primary')
                )}>
                    {item.label}
                </span>
            </>
        );

        const className = cn("flex flex-col items-center justify-center gap-1 w-full h-full", isMobile ? "" : "group gap-1.5");

        if (item.external) {
            return (
                <a href={item.href} key={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {linkContent}
                </a>
            );
        }

        return (
            <Link href={item.href} key={item.href} className={className}>
                {linkContent}
            </Link>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-top z-40">
            {/* Mobile Nav */}
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto md:hidden">
                {navItems.map(item => renderNavItem(item, true))}
            </div>

            {/* Desktop Nav */}
             <div className="hidden md:flex justify-around items-center h-20 w-full">
                {navItems.map(item => renderNavItem(item, false))}
            </div>
        </nav>
    );
};
