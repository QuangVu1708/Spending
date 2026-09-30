import { ArrowRightLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false });

  return (
    <div className="pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Lịch sử giao dịch</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Chi tiết dòng tiền của bạn</p>
      </div>

      <div className="ios-glass rounded-[32px] overflow-hidden">
        {(!transactions || transactions.length === 0) && (
          <div className="p-6 text-gray-500 dark:text-gray-400 text-center font-medium">Chưa có giao dịch nào.</div>
        )}
        {transactions?.map((tx, idx) => (
          <div key={tx.id} className={cn(
            "p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#222] transition-colors",
            idx !== transactions.length - 1 ? "border-b border-gray-100 dark:border-[#27272a]" : ""
          )}>
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                tx.categories?.type === 'income' ? 'bg-green-500' : 'bg-gray-900 dark:bg-white dark:text-black'
              )}>
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{tx.note || 'Giao dịch'}</h4>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{new Date(tx.transaction_date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-xl font-extrabold",
                tx.categories?.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'
              )}>
                {tx.categories?.type === 'income' ? '+' : '-'}{Number(tx.converted_amount).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
