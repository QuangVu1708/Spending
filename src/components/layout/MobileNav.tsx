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
      <nav className="flex items-center justify-around p-2">
        {menuItems.filter(i => isAdmin ? true : i.path !== '/admin').map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all min-w-[4rem]",
                isActive 
                  ? "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white px-3" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent px-3"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white px-3")} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

