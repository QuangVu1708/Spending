"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function DashboardMonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', e.target.value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10">
      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
        <Calendar className="w-5 h-5" />
      </div>
      <input 
        type="month" 
        value={currentMonth}
        onChange={handleMonthChange}
        className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold cursor-pointer"
      />
    </div>
  );
}
