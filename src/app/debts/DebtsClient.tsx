'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, ArrowDownRight, ArrowUpRight, Clock, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DebtsClient({ initialDebts, wallets, userId }: { initialDebts: any[], wallets: any[], userId: string }) {
  const [debts, setDebts] = useState(initialDebts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // Form states
  const [debtType, setDebtType] = useState('borrow_external');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Repayment Modal States
  const [repayingDebt, setRepayingDebt] = useState<any>(null);
  const [repayWalletId, setRepayWalletId] = useState(wallets[0]?.id || '');
  const [isRepaying, setIsRepaying] = useState(false);

  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalInternalBorrow = debts.filter(d => d.debt_type === 'internal_borrow' && d.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalBorrowExternal = debts.filter(d => d.debt_type === 'borrow_external' && d.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalLendExternal = debts.filter(d => d.debt_type === 'lend_external' && d.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !note || !walletId) return;
    if (debtType === 'internal_borrow' && !toWalletId) {
      alert("Vui lòng chọn nguồn rút và đích đến.");
      return;
    }
    setIsAdding(true);

    const amountNum = parseInt(amount);

    const { data, error } = await supabase.from('debts').insert({
      user_id: userId,
      debt_type: debtType,
      amount: amountNum,
      note: note,
      status: 'pending',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      to_wallet_id: debtType === 'borrow_external' ? parseInt(walletId) : debtType === 'internal_borrow' ? parseInt(toWalletId) : null,
      from_wallet_id: debtType === 'lend_external' ? parseInt(walletId) : debtType === 'internal_borrow' ? parseInt(walletId) : null,
    }).select().single();

    if (!error && data) {
      // ẢNH HƯỞNG THỰC TẾ LÊN VÍ:
      if (debtType === 'internal_borrow') {
        const fromW = wallets.find(w => w.id === parseInt(walletId));
        const toW = wallets.find(w => w.id === parseInt(toWalletId));
        if (fromW) await supabase.from('wallets').update({ balance: fromW.balance - amountNum }).eq('id', fromW.id);
        if (toW) await supabase.from('wallets').update({ balance: toW.balance + amountNum }).eq('id', toW.id);
      } else if (debtType === 'lend_external') {
        const fromW = wallets.find(w => w.id === parseInt(walletId));
        if (fromW) await supabase.from('wallets').update({ balance: fromW.balance - amountNum }).eq('id', fromW.id);
      } else if (debtType === 'borrow_external') {
        const toW = wallets.find(w => w.id === parseInt(walletId));
        if (toW) await supabase.from('wallets').update({ balance: toW.balance + amountNum }).eq('id', toW.id);
      }

      setDebts([data, ...debts]);
      setShowAddModal(false);
      setAmount('');
      setNote('');
      setDueDate('');
      router.refresh();
    }
    setIsAdding(false);
  };

  const executeRepayment = async (debt: any, selectedWalletId: number) => {
    setIsRepaying(true);
    const amountNum = Number(debt.amount);

    // 1. Đổi status thành 'paid'
    await supabase.from('debts').update({ status: 'paid' }).eq('id', debt.id);

    // 2. Hoàn lại tiền vào ví
    if (debt.debt_type === 'internal_borrow') {
      // Nợ bản thân: Tiền phải lấy từ ví đích (nơi đang chứa) trả về ví nguồn (nơi đã rút ra)
      const toW = wallets.find(w => w.id === debt.to_wallet_id); // Ví đang mượn
      const fromW = wallets.find(w => w.id === debt.from_wallet_id); // Ví tiết kiệm
      if (toW) await supabase.from('wallets').update({ balance: Number(toW.balance) - amountNum }).eq('id', toW.id);
      if (fromW) await supabase.from('wallets').update({ balance: Number(fromW.balance) + amountNum }).eq('id', fromW.id);
    } else if (debt.debt_type === 'lend_external') {
      // Cho người khác mượn (nay đòi được): Tiền cộng lại vào ví đã chọn
      const targetW = wallets.find(w => w.id === selectedWalletId);
      if (targetW) await supabase.from('wallets').update({ balance: Number(targetW.balance) + amountNum }).eq('id', targetW.id);
    } else if (debt.debt_type === 'borrow_external') {
      // Mình đi mượn (nay đem trả): Rút tiền từ ví đã chọn để trả nợ
      const targetW = wallets.find(w => w.id === selectedWalletId);
      if (targetW) await supabase.from('wallets').update({ balance: Number(targetW.balance) - amountNum }).eq('id', targetW.id);
    }

    setDebts(debts.map(d => d.id === debt.id ? { ...d, status: 'paid' } : d));
    setRepayingDebt(null);
    setIsRepaying(false);
    router.refresh();
  };

  const handleRepayClick = (debt: any) => {
    if (debt.debt_type === 'internal_borrow') {
      if (confirm(`Hoàn tất nợ bản thân? Hệ thống sẽ tự động rút ${Number(debt.amount).toLocaleString('vi-VN')}đ từ ví đang mượn để trả lại cho ví gốc.`)) {
        executeRepayment(debt, 0);
      }
    } else {
      setRepayingDebt(debt);
    }
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const due = new Date(dateString);
    const now = new Date();
    // Bỏ qua giờ phút giây
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now;
  };

  return (
    <div className="animate-page-transition w-full h-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
            Vay mượn & Nợ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Theo dõi các khoản tiền đang cho mượn hoặc đi vay.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Ghi chép mới
        </button>
      </div>

      {/* Tóm tắt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="ios-glass p-6 rounded-[24px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-500 dark:text-gray-400">Đang đi vay</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4">{totalBorrowExternal.toLocaleString('vi-VN')} đ</h2>
        </div>
        
        <div className="ios-glass p-6 rounded-[24px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-500 dark:text-gray-400">Đang cho mượn</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4">{totalLendExternal.toLocaleString('vi-VN')} đ</h2>
        </div>

        <div className="ios-glass p-6 rounded-[24px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-500 dark:text-gray-400">Nợ bản thân</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4">{totalInternalBorrow.toLocaleString('vi-VN')} đ</h2>
        </div>
      </div>

      {/* Danh sách */}
      <div className="ios-glass rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-[#27272a]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết các khoản vay & nợ</h2>
        </div>
        
        {debts.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium flex flex-col items-center">
            <CreditCard className="w-12 h-12 mb-3 opacity-20" />
            Chưa có ghi chép nào.
          </div>
        )}

        {debts.map((debt, idx) => {
          const color = debt.debt_type === 'internal_borrow' ? 'bg-orange-500' : debt.debt_type === 'borrow_external' ? 'bg-red-500' : 'bg-green-500';
          const overdue = debt.status === 'pending' && isOverdue(debt.due_date);

          return (
            <div key={debt.id} className={cn(
              "p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-[#222] transition-colors gap-4",
              idx !== debts.length - 1 ? "border-b border-gray-100 dark:border-[#27272a]" : "",
              overdue ? "bg-red-50/50 dark:bg-red-500/5" : ""
            )}>
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm mt-1 sm:mt-0 flex-shrink-0", color, overdue && "animate-pulse")}>
                  {debt.debt_type === 'lend_external' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{debt.note}</h4>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0",
                      debt.debt_type === 'internal_borrow' ? "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-500" : 
                      debt.debt_type === 'borrow_external' ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500" : "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500"
                    )}>
                      {debt.debt_type === 'internal_borrow' ? 'Nợ bản thân' : debt.debt_type === 'borrow_external' ? 'Mình đi vay' : 'Cho mượn'}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" /> {new Date(debt.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {debt.due_date && (
                    <div className={cn("mt-1.5 flex items-center gap-1.5 text-xs font-bold", overdue ? "text-red-600 dark:text-red-400 animate-pulse" : "text-gray-500")}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Hạn trả: {new Date(debt.due_date).toLocaleDateString('vi-VN')}
                      {overdue && " (Quá hạn!)"}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 dark:border-[#27272a] pt-3 sm:pt-0">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {Number(debt.amount).toLocaleString('vi-VN')} đ
                </span>
                
                {debt.status === 'paid' ? (
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Đã trả xong
                  </div>
                ) : (
                  <button 
                    onClick={() => handleRepayClick(debt)}
                    className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Đánh dấu đã trả
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Chọn ví hoàn tiền / trả tiền */}
      {mounted && repayingDebt && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="ios-glass p-8 rounded-[32px] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xác nhận thanh toán</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
              {repayingDebt.debt_type === 'lend_external' 
                ? `Bạn vừa thu hồi được ${Number(repayingDebt.amount).toLocaleString('vi-VN')}đ. Hãy chọn ví để cất tiền vào:` 
                : `Bạn sắp trả khoản nợ ${Number(repayingDebt.amount).toLocaleString('vi-VN')}đ. Hãy chọn ví để lấy tiền ra trả:`}
            </p>

            <select 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white mb-6"
              value={repayWalletId}
              onChange={(e) => setRepayWalletId(e.target.value)}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button 
                onClick={() => setRepayingDebt(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-[#27272a] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => executeRepayment(repayingDebt, Number(repayWalletId))}
                disabled={isRepaying}
                className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {isRepaying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Debt Modal */}
      {mounted && showAddModal && createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            
          <div className="ios-glass p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Thêm Khoản Vay / Nợ</h2>
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Loại giao dịch</label>
                <select 
                  value={debtType}
                  onChange={(e) => setDebtType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                >
                  <option value="borrow_external">Mình đi mượn tiền người khác</option>
                  <option value="lend_external">Cho người khác mượn tiền</option>
                  <option value="internal_borrow">Nợ bản thân (Mượn từ tài khoản khác của mình)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số tiền</label>
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Vd: 500000"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {debtType === 'internal_borrow' ? 'Ghi chú / Lý do mượn' : 'Tên người / Ghi chú'}
                </label>
                <input 
                  type="text"
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={debtType === 'internal_borrow' ? 'Vd: Mượn tiền tiết kiệm để mua đt' : 'Vd: Mượn anh Tài đóng tiền nhà'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              {debtType !== 'internal_borrow' ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {debtType === 'borrow_external' ? 'Tiền mượn được chuyển vào đâu?' : 'Lấy tiền từ ví nào để cho mượn?'}
                  </label>
                  <select 
                    required
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                  >
                    {wallets.length === 0 && <option value="">Bạn chưa có ví nào</option>}
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-red-500">Rút tiền từ đâu?</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                      onChange={(e) => setWalletId(e.target.value)}
                    >
                      <option value="">-- Chọn nguồn --</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-green-500">Chuyển vào đâu?</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                      value={toWalletId}
                      onChange={(e) => setToWalletId(e.target.value)}
                    >
                      <option value="">-- Chọn đích đến --</option>
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hạn trả (Không bắt buộc)</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-[#27272a] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Ghi Chép'}
                </button>
              </div>
            </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
