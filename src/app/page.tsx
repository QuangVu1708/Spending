import UnifiedSmartInput from '@/components/smart-input/UnifiedSmartInput';
import { ArrowDownRight, ArrowUpRight, Wallet, AlertCircle, Building2, TrendingUp, PieChart } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getBankBrand, cn } from '@/lib/utils';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', user.id).eq('is_deleted', false);
  const { data: categories } = await supabase.from('categories').select('*').eq('user_id', user.id);
  
  const totalBalance = wallets?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;
  const spendingWallet = wallets?.find(w => w.type === 'spending');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .gte('transaction_date', startOfMonth.toISOString());

  const incomeThisMonth = transactions?.filter(t => t.categories?.type === 'income').reduce((acc, curr) => acc + Number(curr.converted_amount), 0) || 0;
  const expenseThisMonth = transactions?.filter(t => t.categories?.type === 'expense').reduce((acc, curr) => acc + Number(curr.converted_amount), 0) || 0;

  const expenseTransactions = transactions?.filter(t => t.categories?.type === 'expense') || [];
  const breakdown: Record<string, number> = {};
  expenseTransactions.forEach(t => {
    const cat = t.note?.split(' ')[0] || 'Khác'; 
    breakdown[cat] = (breakdown[cat] || 0) + Number(t.converted_amount);
  });
  const sortedBreakdown = Object.entries(breakdown).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topExpenseAmount = sortedBreakdown[0]?.[1] || 1;

  return (
    <div className="pb-20 font-sans">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">
            Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">{profile?.full_name || user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 font-medium">Bức tranh tài chính của bạn hôm nay thế nào?</p>
        </div>
        <div className="flex items-center gap-2 ios-glass px-4 py-2 rounded-2xl">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
        </div>
      </header>

      {/* Smart & Manual Inputs */}
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <UnifiedSmartInput wallets={wallets || []} categories={categories || []} userId={user.id} />
      </div>
      
      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Total Balance - Large Bento */}
        <div className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white p-8 rounded-[32px] ring-1 ring-white/20 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute top-6 right-6 opacity-30 dark:opacity-20 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
            <Wallet className="w-24 h-24" />
          </div>
          <div>
            <p className="text-slate-300 font-medium mb-2 text-sm uppercase tracking-widest">Tổng tài sản</p>
            <h3 className="text-5xl font-black tracking-tighter mb-8">{totalBalance.toLocaleString('vi-VN')} ₫</h3>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md px-5 py-4 rounded-3xl border border-white/20 flex items-center justify-between">
            <div>
              <p className="text-slate-200 text-[10px] font-bold uppercase tracking-widest mb-1">Ví Chi Tiêu</p>
              <p className="font-bold text-lg">{spendingWallet ? Number(spendingWallet.balance).toLocaleString('vi-VN') : 0} ₫</p>
            </div>
            {spendingWallet && spendingWallet.limit_amount > 0 && (
              <div className="text-right">
                <p className="text-slate-200 text-[10px] font-bold uppercase tracking-widest mb-1">Hạn mức</p>
                <p className="font-bold text-lg">{(Number(spendingWallet.limit_amount)/1000000).toFixed(1)}M</p>
              </div>
            )}
          </div>
        </div>

        {/* Income & Expense - Stacked Bento */}
        <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-5">
          <div className="ios-glass p-6 rounded-[32px] flex-1 flex flex-col justify-center group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Thu nhập</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{incomeThisMonth.toLocaleString('vi-VN')} ₫</h3>
          </div>

          <div className="ios-glass p-6 rounded-[32px] flex-1 flex flex-col justify-center group relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500/20 blur-2xl rounded-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-500/30">
                  <ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Chi tiêu</p>
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{expenseThisMonth.toLocaleString('vi-VN')} ₫</h3>
            
            {spendingWallet && spendingWallet.limit_amount > 0 && (
              <div className="mt-4">
                <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      (expenseThisMonth / spendingWallet.limit_amount) > 0.8 ? "bg-rose-500" : "bg-slate-900 dark:bg-white"
                    )}
                    style={{ width: `${Math.min((expenseThisMonth / spendingWallet.limit_amount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown - Wide Bento */}
        <div className="md:col-span-6 lg:col-span-4 ios-glass p-6 rounded-[32px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-slate-500 dark:text-slate-300" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest">Phân tích</h3>
          </div>
          {sortedBreakdown.length > 0 ? (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {sortedBreakdown.map(([cat, amount], idx) => {
                const percentage = Math.min((amount / topExpenseAmount) * 100, 100);
                return (
                  <div key={cat} className="group">
                    <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      <span className="capitalize">{cat}</span>
                      <span>{amount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          idx === 0 ? "bg-indigo-500" : idx === 1 ? "bg-cyan-500" : idx === 2 ? "bg-emerald-500" : "bg-amber-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center mb-2">
                <PieChart className="w-5 h-5 opacity-50" />
              </div>
              <p className="font-medium text-xs uppercase tracking-widest">Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách tài khoản (Wallets List) */}
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-5 ml-1">Nguồn tiền của bạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {wallets?.map(w => {
          const brand = getBankBrand(w.name);
          return (
            <div key={w.id} className="ios-glass p-5 rounded-[28px] flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md ring-1 ring-white/30", brand.bg)}>
                {brand.short.length <= 4 ? brand.short : <Building2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider mb-0.5">{w.name}</h4>
                <p className={cn("text-lg font-black tracking-tighter", brand.text, "dark:text-white")}>
                  {Number(w.balance).toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          );
        })}
        {(!wallets || wallets.length === 0) && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white/20 dark:bg-black/20 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-white/20 rounded-[32px]">
            Chưa có ví nào. Hãy vào mục "Ví & Hũ" để thêm.
          </div>
        )}
      </div>
    </div>
  );
}
