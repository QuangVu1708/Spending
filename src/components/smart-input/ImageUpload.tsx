'use client';
import { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ImageUpload({ wallets, categories, userId }: { wallets?: any[], categories?: any[], userId?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Xóa phần đầu "data:image/jpeg;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const base64 = await fileToBase64(selectedFile);
      
      const res = await fetch('/api/ai/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: base64, 
          mimeType: selectedFile.type,
          wallets, categories 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        alert('Lỗi AI: ' + (data.error || 'Unknown error'));
        setFile(null);
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ AI');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveTransaction = async () => {
    if (!userId || !result) return;
    setIsSaving(true);
    
    const amount = result.amount || 0;
    const note = result.note || 'Quét từ hóa đơn';
    // Mặc định lấy ví mà AI chọn, nếu không thì lấy ví đầu tiên
    const wallet_id = result.wallet_id || wallets?.[0]?.id;

    if (!wallet_id) {
      alert("Lỗi: Không tìm thấy ví thanh toán");
      setIsSaving(false);
      return;
    }

    const finalType = result.type || 'expense';
    const finalCategoryId = result.category_id || null;

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet_id,
      category_id: finalCategoryId,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: note,
    });

    if (!error) {
      const targetWallet = wallets?.find(w => w.id === wallet_id);
      if (targetWallet) {
        const newBalance = finalType === 'income' 
          ? targetWallet.balance + amount 
          : targetWallet.balance - amount;
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet_id);
      }
    }

    setIsSaving(false);

    if (!error) {
      alert('Đã lưu giao dịch vào cơ sở dữ liệu!');
      setResult(null);
      setFile(null);
      router.refresh();
    } else {
      alert('Lỗi khi lưu giao dịch: ' + error.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 relative z-10">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 ios-glass dark:border-white/10",
          isDragging ? "border-indigo-500 bg-indigo-50/10" : "border-slate-300 dark:border-slate-700 hover:border-slate-400",
          file ? "pb-6" : ""
        )}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Tải ảnh hóa đơn / Bill</h3>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">Kéo thả ảnh vào đây hoặc click để chọn file. AI sẽ tự động đọc tổng số tiền thanh toán.</p>
            <label className="cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-slate-900/20">
              Chọn Ảnh
              <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
            </label>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl w-full max-w-md ring-1 ring-slate-900/5 dark:ring-white/5">
              <ImageIcon className="w-8 h-8 text-indigo-500" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => { setFile(null); setResult(null); }} className="text-slate-400 hover:text-red-500 text-sm font-bold transition-colors">
                Xóa
              </button>
            </div>

            {isAnalyzing ? (
              <div className="mt-8 flex flex-col items-center gap-3 text-indigo-500 font-bold">
                <Loader2 className="w-8 h-8 animate-spin" />
                Đang dùng AI OCR siêu tốc để đọc hóa đơn...
              </div>
            ) : result ? (
              <div className="mt-6 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-3xl ring-1 ring-indigo-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> KẾT QUẢ TỪ AI
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs font-bold mb-1">Tổng tiền</p>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{Number(result.amount).toLocaleString()} đ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs font-bold mb-1">Ghi chú</p>
                      <p className="font-bold text-indigo-900 dark:text-indigo-100">{result.note}</p>
                    </div>
                  </div>

                  <button 
                    onClick={saveTransaction} 
                    disabled={isSaving}
                    className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-500/25 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Giao Dịch Vào Sổ'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
