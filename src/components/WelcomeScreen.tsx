'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, User, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WelcomeScreen({ user, profile }: { user: any, profile: any }) {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMessage('Lỗi: Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setLoading(true);
    setMessage('');

    // Update password and metadata
    const { error: authError } = await supabase.auth.updateUser({ 
      password: password,
      data: { is_onboarded: true, full_name: fullName }
    });

    if (authError) {
      setMessage(`Lỗi: ${authError.message}`);
      setLoading(false);
      return;
    }

    // Also update profile name if they changed it
    if (fullName !== profile?.full_name) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    }

    // Refresh layout to remove welcome screen
    router.refresh();
  };

  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden">
        
        {/* Decorative background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center mb-6 mt-4">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-3xl font-bold">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
            Chào mừng bạn mới! 👋
          </h1>
          <p className="text-gray-500 mb-8 font-medium text-center text-sm">
            Tài khoản Google <span className="font-bold text-gray-700">{user.email}</span> đã được liên kết. Vui lòng thiết lập mật khẩu để bảo vệ tài khoản và hoàn tất hồ sơ.
          </p>
          
          <form onSubmit={handleComplete} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên hiển thị</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-900 bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tạo mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu (ít nhất 6 ký tự)..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-gray-900 bg-gray-50"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Vào Ứng Dụng Ngay
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 w-full p-3 rounded-xl text-sm font-bold text-center ${message.includes('Lỗi') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
