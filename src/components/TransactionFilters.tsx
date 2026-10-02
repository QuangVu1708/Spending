"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (from) params.set('from', from);
    else params.delete('from');
    
    if (to) params.set('to', to);
    else params.delete('to');

    router.push(`/transactions?${params.toString()}`);
  };

  const clearFilter = () => {
    setFrom('');
    setTo('');
    router.push('/transactions');
  };

  return (
    <form onSubmit={handleFilter} className="ios-glass p-4 rounded-3xl mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-slate-500 mb-1">Từ ngày</label>
        <input 
          type="date" 
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl outline-none font-medium"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-slate-500 mb-1">Đến ngày</label>
        <input 
          type="date" 
          value={to}
          onChange={e => setTo(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 rounded-xl outline-none font-medium"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          type="button" 
          onClick={clearFilter}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl flex-1 sm:flex-none"
        >
          Xóa
        </button>
        <button 
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 flex-1 sm:flex-none hover:bg-indigo-500 transition-colors"
        >
          <Search className="w-4 h-4" /> Lọc
        </button>
      </div>
    </form>
  );
}
