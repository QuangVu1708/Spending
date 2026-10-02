"use client";

import { useState, useRef } from 'react';
import { Send, Loader2, Sparkles, Image as ImageIcon, Edit3 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// HÀM ÉP CÂN ẢNH (Nén ảnh tại trình duyệt để tiết kiệm quota và tăng tốc AI x10 lần)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export to JPEG with 0.7 quality (very small file size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl.split(',')[1]); // Trả về phần base64 core
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};


export default function UnifiedSmartInput({ wallets, categories, userId }: { wallets?: any[], categories?: any[], userId?: string }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Form State
  const [showEditForm, setShowEditForm] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualType, setManualType] = useState('expense');
  const [manualWallet, setManualWallet] = useState(wallets?.[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, wallets, categories })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Populate form
      setManualAmount(data.converted_amount?.toString() || data.amount?.toString() || '');
      setManualNote(data.note || '');
      setManualCategory(data.category_id || '');
      setManualType(data.type || 'expense');
      if (data.wallet_id) setManualWallet(data.wallet_id);
      
      setShowEditForm(true);
      setInput('');
      toast.success('AI đã phân tích xong! Vui lòng kiểm tra lại.');
    } catch (error: any) {
      if (error.message.includes('exceeded your current quota')) {
        toast.error('AI đã hết giới hạn (Quota) hôm nay! Vui lòng tự nhập tay.');
        setShowEditForm(true);
      } else {
        toast.error('Lỗi AI: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // 1. Ép cân ảnh trước khi gửi đi!
      const compressedBase64 = await compressImage(file);
      
      // 2. Gửi ảnh siêu nhẹ lên máy chủ (Tốc độ Upload cực nhanh)
      const res = await fetch('/api/ai/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          mimeType: 'image/jpeg', // Luôn là JPEG vì đã qua nén
          wallets,
          categories
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Populate form
      setManualAmount(data.converted_amount?.toString() || data.amount?.toString() || '');
      setManualNote(data.note || '');
      setManualCategory(data.category_id || '');
      setManualType(data.type || 'expense');
      if (data.wallet_id) setManualWallet(data.wallet_id);
      
      setShowEditForm(true);
      toast.success('AI siêu tốc đã quét xong! Kiểm tra lại nhé.');
    } catch (error: any) {
      if (error.message.includes('exceeded your current quota')) {
        toast.error('AI đã hết giới hạn (Quota) quét ảnh hôm nay!');
        setShowEditForm(true);
      } else {
        toast.error('Lỗi quét ảnh: ' + error.message);
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveTransaction = async () => {
    if (!userId) return;
    if (!manualAmount || !manualWallet) {
      toast.error('Vui lòng nhập số tiền và chọn ví!');
      return;
    }

    setIsSaving(true);
    const amount = parseInt(manualAmount) || 0;

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: manualWallet,
      category_id: manualCategory || null,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: manualNote || 'Giao dịch',
    });

    if (!error) {
      // Cập nhật số dư ví
      const targetWallet = wallets?.find(w => w.id === manualWallet);
      if (targetWallet) {
        const newBalance = manualType === 'income' 
          ? targetWallet.balance + amount 
          : targetWallet.balance - amount;
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', manualWallet);
      }
      toast.success('Đã lưu giao dịch và cập nhật số dư ví thành công!');
      setShowEditForm(false);
      setManualAmount('');
      setManualNote('');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error('Lỗi khi lưu giao dịch: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full relative z-20">
      {!showEditForm ? (
        <>
          <form onSubmit={handleTextSubmit} className="relative group max-w-3xl mx-auto">
            <div className="ios-glass rounded-[2rem] flex items-center w-full rainbow-border pl-6 pr-2 py-2">
              <div className="flex items-center pointer-events-none z-10 mr-3">
                <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: Lương tháng 10 20 củ, đổ xăng 50k..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium text-lg min-w-0"
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-2 z-10 ml-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-3 text-slate-400 hover:text-indigo-500 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/20 rounded-xl transition-all"
                  title="Tải lên hóa đơn (Quét AI)"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />

                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </form>

          <div className="flex justify-center mt-6">
            <button 
              type="button" 
              onClick={() => setShowEditForm(true)}
              className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold flex items-center gap-1.5 transition-colors bg-white/50 dark:bg-[#111] px-5 py-2.5 rounded-full ring-1 ring-slate-200 dark:ring-white/10 shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Bỏ qua AI, Nhập thủ công
            </button>
          </div>
        </>
      ) : (
        <div className="ios-glass p-8 rounded-[32px] max-w-3xl mx-auto shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-6 h-6" />
              </div>
              Xác nhận & Lưu Giao dịch
            </h2>
            <button 
              type="button"
              onClick={() => setShowEditForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
            >
              Quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Loại giao dịch */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Loại giao dịch</label>
              <div className="flex bg-slate-100/50 dark:bg-[#1a1a1c] p-1.5 rounded-2xl w-full sm:w-fit ring-1 ring-slate-200 dark:ring-white/5">
                <button 
                  type="button" 
                  onClick={() => setManualType('expense')}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all ${manualType === 'expense' ? 'bg-white dark:bg-slate-800 text-red-500 shadow-md ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >Khoản Chi (-)</button>
                <button 
                  type="button" 
                  onClick={() => setManualType('income')}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold transition-all ${manualType === 'income' ? 'bg-white dark:bg-slate-800 text-green-500 shadow-md ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >Khoản Thu (+)</button>
              </div>
            </div>

            {/* Số tiền */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số tiền (VNĐ)</label>
              <input 
                type="number" 
                required
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="Vd: 500000"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-900 dark:text-white"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ghi chú chi tiết</label>
              <input 
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Vd: Ăn trưa với anh bạn đồng nghiệp"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Tài khoản / Ví */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tài khoản thanh toán</label>
              <select 
                value={manualWallet}
                onChange={(e) => setManualWallet(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white appearance-none"
              >
                {wallets?.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>
                ))}
              </select>
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Danh mục</label>
              <select 
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-900/5 dark:ring-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white appearance-none"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button 
              type="button" 
              onClick={saveTransaction}
              disabled={isSaving}
              className="md:col-span-2 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Lưu Giao Dịch & Cập Nhật Ví'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
