'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// from 'react';
import { Wallet, AlertTriangle, ArrowRightLeft, Plus, Loader2, Building2, Trash2 } from 'lucide-react';
import { cn, getBankBrand } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function WalletsClient({ initialWallets, userId }: { initialWallets: any[], userId: string }) {
  const [wallets, setWallets] = useState(initialWallets);
  const [showDeficitModal, setShowDeficitModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [testAmount, setTestAmount] = useState('');
  
  // Add Wallet State
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('spending');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletLimit, setNewWalletLimit] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  
  const spendingWallet = wallets.find(w => w.type === 'spending') || wallets[0];

  const handleSimulateTransaction = () => {
    const amount = parseInt(testAmount);
    if (!amount || isNaN(amount)) return;

    if (spendingWallet && amount > spendingWallet.balance) {
      setShowDeficitModal(true);
    } else {
      alert('Giao dịch thành công (Còn đủ tiền trong ví)');
    }
  };

  const handleInternalBorrow = async (fromWalletId: number) => {
    if (!spendingWallet) return;
    const amountToBorrow = parseInt(testAmount) - spendingWallet.balance;
    
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    if (!fromWallet) return;

    // Deduct from source
    await supabase.from('wallets').update({ balance: fromWallet.balance - amountToBorrow }).eq('id', fromWalletId);
    // Add to target
    await supabase.from('wallets').update({ balance: spendingWallet.balance + amountToBorrow }).eq('id', spendingWallet.id);

    await supabase.from('debts').insert({
      user_id: userId,
      debt_type: 'internal_borrow',
      from_wallet_id: fromWalletId,
      to_wallet_id: spendingWallet.id,
      amount: amountToBorrow,
      note: `Vay từ ${fromWallet.name} bù chi tiêu cho ${spendingWallet.name}`
    });

    alert(`Đã tự động mượn ${amountToBorrow.toLocaleString()}đ và chuyển vào ${spendingWallet.name}.`);
    setShowDeficitModal(false);
    setTestAmount('');
    router.refresh();
    window.location.reload();
  };

  
  const handleDeleteWallet = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ví này? Ví sẽ bị ẩn đi nhưng lịch sử giao dịch vẫn được giữ lại.')) return;
    
    const { error } = await supabase.from('wallets').update({ is_deleted: true }).eq('id', id);
    if (error) {
      alert('Không thể xóa ví: ' + error.message);
    } else {
      router.refresh();
      window.location.reload();
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert('Ví nguồn và ví đích không được trùng nhau');
      return;
    }
    const amount = parseInt(transferAmount);
    if (!amount || amount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    setIsTransferring(true);
    
    // Find wallets
    const fromW = wallets.find(w => w.id === transferFrom);
    const toW = wallets.find(w => w.id === transferTo);
    
    if (!fromW || !toW) {
      setIsTransferring(false);
      return;
    }

    // Update balances
    const { error: err1 } = await supabase.from('wallets').update({ balance: fromW.balance - amount }).eq('id', fromW.id);
    const { error: err2 } = await supabase.from('wallets').update({ balance: toW.balance + amount }).eq('id', toW.id);

    // Save transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: fromW.id,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: `Chuyển tiền sang ${toW.name}`
    });
    
    await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: toW.id,
      amount: amount, // Positive to denote incoming or keep it generic? Usually income is positive, expense is negative. We'll just leave it generic.
      converted_amount: amount,
      currency: 'VND',
      note: `Nhận tiền từ ${fromW.name}`
    });

    setIsTransferring(false);
    
    if (err1 || err2) {
      alert('Lỗi chuyển tiền');
    } else {
      alert('Chuyển tiền thành công!');
      setShowTransferModal(false);
      setTransferAmount('');
      window.location.reload();
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    setIsAdding(true);

    const { data, error } = await supabase.from('wallets').insert({
      user_id: userId,
      name: newWalletName,
      type: newWalletType,
      balance: newWalletBalance ? parseInt(newWalletBalance) : 0,
      limit_amount: newWalletLimit ? parseInt(newWalletLimit) : 0,
    }).select().single();

    if (!error && data) {
      setWallets([...wallets, data]);
      setShowAddModal(false);
      setNewWalletName('');
      setNewWalletBalance('');
      setNewWalletLimit('');
      router.refresh();
    } else {
      alert('Lỗi tạo ví: ' + error?.message);
    }
    setIsAdding(false);
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Quản lý Tài Khoản / Ví</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Ngân hàng, Momo, Tiền mặt...</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" /> Thêm Ví mới
        </button>
          <button 
            onClick={() => {
               if (wallets.length >= 2) {
                 setTransferFrom(wallets[0].id);
                 setTransferTo(wallets[1].id);
                 setShowTransferModal(true);
               } else {
                 alert('Bạn cần ít nhất 2 ví để chuyển tiền');
               }
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-md ml-3"
          >
            <ArrowRightLeft className="w-5 h-5" /> Chuyển tiền
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {wallets.length === 0 && <div className="text-slate-500 col-span-3">Bạn chưa có tài khoản nào. Hãy bấm Thêm Ví mới.</div>}
        
        {wallets.map(wallet => {
          const brand = getBankBrand(wallet.name);
          return (
            <div key={wallet.id} className="ios-glass p-6 rounded-[32px] relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                <button onClick={() => handleDeleteWallet(wallet.id)} className="absolute top-6 right-6 z-20 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform duration-700 group-hover:scale-110", brand.bg)}></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg font-black text-sm", brand.bg)}>
                  {brand.short.length <= 4 ? brand.short : <Wallet className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{wallet.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {wallet.type === 'spending' ? 'Ví chi tiêu' : wallet.type === 'savings' ? 'Tiết kiệm' : 'Khẩn cấp'}
                  </span>
                </div>
              </div>
              
              <div className="mb-2 relative z-10">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-widest">Số dư</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{Number(wallet.balance).toLocaleString('vi-VN')} ₫</p>
              </div>

              {wallet.limit_amount > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-white/10 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
                    <span>Hạn mức: {(Number(wallet.limit_amount)/1000000).toFixed(1)}M</span>
                    <span className={wallet.balance < wallet.limit_amount * 0.2 ? 'text-rose-500' : ''}>
                      Còn lại {Math.round((wallet.balance / wallet.limit_amount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", wallet.balance < wallet.limit_amount * 0.2 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-cyan-400 to-indigo-500')}
                      style={{ width: `${Math.min((wallet.balance / wallet.limit_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      

      {/* Modal Cảnh báo Thâm hụt */}
      {showDeficitModal && spendingWallet && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="ios-glass p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Cảnh báo thâm hụt!</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-8">
              Tài khoản {spendingWallet.name} không đủ tiền. Bạn đang thiếu <span className="font-bold text-red-600 dark:text-red-500">{(parseInt(testAmount) - spendingWallet.balance).toLocaleString('vi-VN')} ₫</span>.
            </p>

            <div className="space-y-3 mb-8">
              <p className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Đề xuất "Vay mượn" nội bộ từ tài khoản khác của bạn:</p>
              
              {wallets.filter(w => w.id !== spendingWallet.id).map(wallet => {
                const brand = getBankBrand(wallet.name);
                return (
                  <button 
                    key={wallet.id}
                    onClick={() => handleInternalBorrow(wallet.id)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-[#27272a] rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold", brand.bg)}>
                        {brand.short.length <= 4 ? brand.short : <Wallet className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{wallet.name}</h4>
                        <p className="text-sm font-medium text-gray-500">Số dư: {Number(wallet.balance).toLocaleString('vi-VN')} ₫</p>
                      </div>
                    </div>
                    <ArrowRightLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </button>
                )
              })}
            </div>

            <button 
              onClick={() => setShowDeficitModal(false)}
              className="w-full py-3.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-[#27272a] rounded-xl transition-colors"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}

      {/* Modal Thêm Ví */}
      {mounted && showAddModal && createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            
          <div className="ios-glass p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Thêm Tài khoản / Ví</h2>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tên (Vd: Momo, Vietcombank...)</label>
                <input 
                  type="text"
                  required
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Vd: Momo, Vietcombank..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Tiền mặt', 'MoMo', 'ZaloPay', 'Vietcombank', 'Techcombank', 'TPBank', 'MBBank', 'BIDV', 'VietinBank'].map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setNewWalletName(name)}
                      className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-[#222] dark:hover:bg-indigo-500/20 text-gray-600 dark:text-gray-300 rounded-lg transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số dư hiện tại đang có</label>
                <input 
                  type="number"
                  required
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  placeholder="Vd: 5000000"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mục đích sử dụng</label>
                <select 
                  value={newWalletType}
                  onChange={(e) => setNewWalletType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="spending">Để chi tiêu (Daily Spending)</option>
                  <option value="savings">Để tiết kiệm (Savings)</option>
                  <option value="emergency">Dự phòng khẩn cấp (Emergency)</option>
                </select>
              </div>
              {newWalletType === 'spending' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hạn mức tiêu tối đa / tháng</label>
                  <input 
                    type="number"
                    value={newWalletLimit}
                    onChange={(e) => setNewWalletLimit(e.target.value)}
                    placeholder="Không bắt buộc"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}
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
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Tài Khoản'}
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
