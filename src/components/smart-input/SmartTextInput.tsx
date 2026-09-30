'use client';
import { useState } from 'react';
import { Sparkles, ArrowUp, Loader2, Edit3, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SmartTextInput({ wallets, categories, userId }: { wallets?: any[], categories?: any[], userId?: string }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // State for manual input form
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualWallet, setManualWallet] = useState(wallets?.[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      setResult({
        amount: parseInt(input.replace(/[^0-9]/g, '')) || 50000,
        currency: 'VND',
        converted_amount: parseInt(input.replace(/[^0-9]/g, '')) || 50000,
        category: 'Ăn uống',
        is_fixed: false,
        note: input,
      });
      setIsLoading(false);
      setInput('');
    }, 1500);
  };

  const openManualEditor = () => {
    setIsManualMode(true);
    if (result) {
      setManualAmount(result.converted_amount.toString());
      setManualNote(result.note);
      setManualCategory('');
    }
  };

  const saveTransaction = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    const amount = parseInt(manualAmount) || result?.converted_amount || 0;
    const note = manualNote || result?.note || 'Giao dịch';
    const wallet_id = manualWallet || wallets?.[0]?.id;

    if (!wallet_id) {
      alert("Lỗi: Không tìm thấy ví thanh toán");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet_id,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: note,
    });

    setIsSaving(false);

    if (!error) {
      alert('Đã lưu giao dịch vào CSDL!');
      setResult(null);
      setIsManualMode(false);
      setManualAmount('');
      setManualNote('');
      router.refresh();
    } else {
      alert('Lỗi khi lưu giao dịch: ' + error.message);
    }
  };

  return (
    <div className="w-full relative z-20">
      {!isManualMode ? (
        <>
          <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
            {/* Thêm rainbow-border vào đây, nó sẽ chỉ kẻ viền 2px nhờ CSS Mask */}
            <div className="ios-glass rounded-full flex items-center w-full rainbow-border">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full pl-16 pr-36 py-5 bg-transparent rounded-full text-lg md:text-xl outline-none font-medium text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all z-10"
                placeholder="Vd: Đóng tiền mạng tháng này 250k..."
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-2 z-10">
                <button 
                  type="button"
                  onClick={() => setIsManualMode(true)}
                  className="hidden md:flex px-4 py-2 bg-white/40 dark:bg-black/40 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-full text-sm font-bold transition-colors"
                >
                  Nhập tay
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 w-12 h-12 flex items-center justify-center rounded-full transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </form>

          {/* Hiển thị kết quả bóc tách từ AI */}
          {result && (
            <div className="mt-4 max-w-3xl mx-auto ios-glass p-6 rounded-[32px] animate-in slide-in-from-top-4 fade-in duration-500">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-center">AI đã nhận diện</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/5">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Số tiền</p>
                  <p className="font-bold text-slate-900 dark:text-white">{result.converted_amount.toLocaleString()} ₫</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/5">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Loại</p>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{result.is_fixed ? 'Cố định' : 'Thường'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/5">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Phân loại</p>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{result.category}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/5">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Ghi chú</p>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{result.note}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={saveTransaction} disabled={isSaving} className="flex-1 flex justify-center items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-2xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận & Lưu'}
                </button>
                <button onClick={openManualEditor} className="px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 ring-1 ring-slate-900/10 dark:ring-white/10 rounded-2xl transition-colors flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Sửa thủ công
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Manual Input Form */
        <div className="max-w-3xl mx-auto ios-glass rounded-[32px] p-8 animate-in fade-in zoom-in-95 duration-300 relative rainbow-border">
          <button 
            onClick={() => setIsManualMode(false)}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-indigo-500" /> Nhập / Chỉnh sửa Giao dịch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số tiền</label>
              <input 
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="Vd: 50000"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phân loại (Category)</label>
              <select 
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
              >
                <option value="">-- Chọn danh mục --</option>
                <optgroup label="Thức ăn & Đồ uống">
                  <option value="Ăn sáng">Ăn sáng</option>
                  <option value="Ăn trưa">Ăn trưa</option>
                  <option value="Ăn tối">Ăn tối</option>
                  <option value="Cà phê / Trà sữa">Cà phê / Trà sữa</option>
                  <option value="Đi chợ / Siêu thị">Đi chợ / Siêu thị</option>
                  <option value="Ăn vặt">Ăn vặt</option>
                </optgroup>
                <optgroup label="Di chuyển">
                  <option value="Đổ xăng">Đổ xăng</option>
                  <option value="Taxi / Grab">Taxi / Grab</option>
                  <option value="Gửi xe">Gửi xe</option>
                  <option value="Sửa xe / Bảo dưỡng">Sửa xe / Bảo dưỡng</option>
                </optgroup>
                <optgroup label="Hóa đơn & Tiện ích">
                  <option value="Tiền điện">Tiền điện</option>
                  <option value="Tiền nước">Tiền nước</option>
                  <option value="Internet / Cáp">Internet / Cáp</option>
                  <option value="Điện thoại / 3G">Điện thoại / 3G</option>
                  <option value="Tiền thuê nhà">Tiền thuê nhà</option>
                </optgroup>
                <optgroup label="Cá nhân & Giải trí">
                  <option value="Mua sắm quần áo">Mua sắm quần áo</option>
                  <option value="Mỹ phẩm / Spa">Mỹ phẩm / Spa</option>
                  <option value="Xem phim / Giải trí">Xem phim / Giải trí</option>
                  <option value="Du lịch">Du lịch</option>
                  <option value="Spotify / Netflix">Dịch vụ số (Netflix, Spotify...)</option>
                </optgroup>
                <optgroup label="Sức khỏe">
                  <option value="Khám chữa bệnh">Khám chữa bệnh</option>
                  <option value="Mua thuốc">Mua thuốc</option>
                  <option value="Thể thao / Gym">Thể thao / Gym</option>
                </optgroup>
                <optgroup label="Khác">
                  <option value="Chuyển khoản nợ">Trả nợ</option>
                  <option value="Giao lưu / Cưới hỏi">Giao lưu / Cưới hỏi</option>
                  <option value="Khác">Chi phí khác</option>
                </optgroup>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ghi chú chi tiết</label>
              <input 
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Vd: Ăn trưa với anh bạn đồng nghiệp"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nguồn tiền (Trừ từ ví nào?)</label>
              <select 
                value={manualWallet}
                onChange={(e) => setManualWallet(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
              >
                {wallets?.length === 0 && <option value="">Bạn chưa có ví nào</option>}
                {wallets?.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={saveTransaction} 
            disabled={isSaving}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 relative z-10"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Giao Dịch'}
          </button>
        </div>
      )}
    </div>
  );
}
