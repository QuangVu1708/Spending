'use client';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      }
    });
    setLoadingGoogle(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setMessage('');
    
    if (isSignUp) {
      // Đăng ký (Sign Up)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { is_onboarded: true },
          emailRedirectTo: `${location.origin}/auth/callback`,
        }
      });
      if (error) {
        setMessage(`Lỗi: ${error.message}`);
      } else {
        setMessage('Đăng ký thành công! Hãy kiểm tra hộp thư email của bạn để xác nhận (nếu Supabase yêu cầu).');
      }
    } else {
      // Đăng nhập (Sign In)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Lỗi: ${error.message}`);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoadingEmail(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-gray-100">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto mb-6 shadow-lg">
          M
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
          {isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập MoneyFlow'}
        </h1>
        <p className="text-gray-500 mb-8 font-medium text-center">Quản lý chi tiêu thông minh với AI</p>
        
        {/* Nút Đăng nhập bằng Google */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loadingEmail}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 py-3.5 rounded-xl font-bold shadow-sm transition-all mb-4"
        >
          {loadingGoogle ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
            </svg>
          )}
          Tiếp tục với Google
        </button>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Hoặc</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Form Đăng nhập / Đăng ký bằng Email + Pass */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm font-medium text-gray-900"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm font-medium text-gray-900"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loadingEmail || loadingGoogle}
            className="w-full bg-black text-white hover:bg-gray-800 py-3.5 rounded-xl font-bold shadow-md transition-all flex justify-center items-center gap-2"
          >
            {loadingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isSignUp ? 'Tạo tài khoản' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-gray-600">
          {isSignUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-black font-bold hover:underline"
          >
            {isSignUp ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${message.includes('Lỗi') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
