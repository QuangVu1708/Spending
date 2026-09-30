'use client';
import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function NotificationBell({ align = 'right' }: { align?: 'left' | 'right' }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const notifs: any[] = [];

    // 1. Quét Nợ quá hạn
    const { data: debts } = await supabase.from('debts').select('*').eq('user_id', user.id).eq('status', 'pending');
    if (debts) {
      debts.forEach(debt => {
        if (debt.due_date && new Date(debt.due_date) < new Date(new Date().setHours(0,0,0,0))) {
          notifs.push({
            id: `debt-${debt.id}`,
            title: 'Nợ quá hạn!',
            message: `Khoản "${debt.note}" trị giá ${Number(debt.amount).toLocaleString('vi-VN')}đ đã quá hạn trả.`,
            icon: <Clock className="w-5 h-5 text-red-500" />,
            color: 'bg-red-50 dark:bg-red-500/10',
            link: '/debts'
          });
        }
      });
    }

    // 2. Quét Ví/Hũ sắp cạn tiền
    const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', user.id).eq('is_deleted', false);
    if (wallets) {
      wallets.forEach(w => {
        if (w.limit_amount > 0 && w.balance < w.limit_amount * 0.2) {
          notifs.push({
            id: `wallet-${w.id}`,
            title: 'Cảnh báo cạn ví!',
            message: `Hũ "${w.name}" chỉ còn dưới 20% hạn mức (${Number(w.balance).toLocaleString('vi-VN')}đ).`,
            icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
            color: 'bg-orange-50 dark:bg-orange-500/10',
            link: '/wallets'
          });
        }
      });
    }

    setNotifications(notifs);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors outline-none"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#111] animate-pulse"></span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          
          <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-80 bg-white dark:bg-[#222] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#333] z-50 overflow-hidden animate-in fade-in zoom-in-95`}>
            <div className="p-4 border-b border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#111] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Thông báo ({notifications.length})</h3>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Tuyệt vời! Bạn không có cảnh báo nào.
                </div>
              ) : (
                notifications.map(n => (
                  <Link key={n.id} href={n.link} onClick={() => setShowDropdown(false)} className="flex items-start gap-3 p-4 border-b border-gray-50 dark:border-[#27272a] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.color}`}>
                      {n.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
