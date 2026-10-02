'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, CreditCard, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Tổng quan', icon: LayoutDashboard, path: '/' },
  { name: 'Giao dịch', icon: ArrowRightLeft, path: '/transactions' },
  { name: 'Ví & Hũ', icon: Wallet, path: '/wallets' },
  { name: 'Vay mượn', icon: CreditCard, path: '/debts' }, 
  { name: 'Admin', icon: Shield, path: '/admin' },
];

export default function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 ios-glass border-t-0 pb-[env(safe-area-inset-bottom)]" style={{ background: 'var(--mobile-nav-bg)' }}>
      <nav className="flex items-center justify-around px-1 py-2 w-full gap-1">
        {menuItems.filter(i => isAdmin ? true : i.path !== '/admin').map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-xl transition-all flex-1 min-w-0",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis px-0.5 w-full text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

