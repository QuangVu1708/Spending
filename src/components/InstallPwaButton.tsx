"use client";

import { useState, useEffect } from 'react';
import { Download, MonitorSmartphone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast('Trình duyệt của bạn không hỗ trợ cài đặt tự động, hoặc bạn đang dùng iPhone (Hãy bấm nút Chia sẻ -> Thêm vào màn hình chính nhé).', { icon: 'ℹ️' });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Đã cài đặt Ứng dụng thành công!');
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="ios-glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <MonitorSmartphone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cài đặt Ứng dụng (App)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thêm trang web này ra màn hình chính điện thoại</p>
        </div>
      </div>
      
      {isStandalone ? (
        <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl w-full md:w-auto justify-center cursor-default">
          <CheckCircle2 className="w-5 h-5" />
          Đã cài đặt
        </div>
      ) : (
        <button 
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30 w-full md:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          Cài đặt ngay
        </button>
      )}
    </div>
  );
}
