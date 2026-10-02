'use client';
import { Moon, Sun, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import NotificationBell from '@/components/NotificationBell';

export default function MobileHeader({ profile = null }: { profile?: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);



  return (
    <div className="md:hidden sticky top-0 z-40 ios-glass border-b-0 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-lg object-cover shadow-md" />
        ) : (
          <div className="w-8 h-8 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-bold shadow-md">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'F'}
          </div>
        )}
        <h1 className="font-extrabold tracking-tight text-gray-900 dark:text-white truncate max-w-[150px]">
          {profile?.full_name ? profile.full_name.trim().split(' ').pop() : 'MoneyFlow'}
        </h1>
      </div>
      <div className="flex items-center gap-5">
        {mounted && (
          <>
            <NotificationBell />
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </>
        )}
        <Link href="/utilities" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
          <Wrench className="w-5 h-5" />
        </Link>
        <Link href="/settings" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
