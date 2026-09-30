'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, CreditCard, Settings, LogOut, Moon, Sun, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import NotificationBell from '@/components/NotificationBell';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Quản trị (Admin)', icon: Shield, path: '/admin' },
  { name: 'Giao dịch', icon: ArrowRightLeft, path: '/transactions' },
  { name: 'Ví & Hũ', icon: Wallet, path: '/wallets' },
  { name: 'Vay mượn & Nợ', icon: CreditCard, path: '/debts' },
];

export default function Sidebar({ isAdmin = false, profile = null }: { isAdmin?: boolean, profile?: any }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen ios-glass border-r-0 flex flex-col p-6 hidden md:flex transition-colors duration-300">
      <div className="flex items-center justify-between mb-10 pl-2 pr-2">
        <div className="flex items-center gap-3">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-indigo-500/30" />
        ) : (
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg border border-indigo-500/30">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'M'}
          </div>
        )}
        <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white truncate">
          {profile?.full_name ? profile.full_name.trim().split(' ').pop() : 'MoneyFlow'}
        </h1>
        </div>
        <NotificationBell align="left" />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.filter(i => isAdmin ? true : i.path !== '/admin').map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium",
                isActive 
                  ? "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/20 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 mt-6 space-y-2">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-between px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/5 rounded-2xl w-full transition-all font-medium border border-transparent"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>Giao diện</span>
            </div>
            <span className="text-xs font-bold uppercase">{theme === 'dark' ? 'Tối' : 'Sáng'}</span>
          </button>
        )}
        <Link href="/settings" className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium",
            pathname === '/settings' 
              ? "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white" 
              : "text-slate-500 hover:text-slate-900 hover:bg-white/20 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
          )}>
            <Settings className="w-5 h-5" />
            <span>Cài đặt</span>
          </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl w-full transition-all font-medium border border-transparent"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
