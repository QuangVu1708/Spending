'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, User, Camera, Save, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsClient({ user, initialProfile }: { user: any, initialProfile: any }) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage(`Lỗi: ${error.message}`);
    } else {
      setPasswordMessage('Đổi mật khẩu thành công!');
      setNewPassword('');
    }
    setIsChangingPassword(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(`Lỗi: ${error.message}`);
    } else {
      setMessage('Lưu hồ sơ thành công!');
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage('');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      setMessage(`Lỗi tải ảnh: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl);
    
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
    });

    setIsUploading(false);
    setMessage('Cập nhật ảnh đại diện thành công!');
    router.refresh();
  };

  return (
    <div className="pb-20 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cài đặt</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Quản lý hồ sơ và bảo mật tài khoản</p>
      </div>

      <div className="ios-glass p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mr-32 -mt-32"></div>
        
        <form onSubmit={handleSave} className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-indigo-500/50" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors hover:scale-105 active:scale-95"
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-black/40 rounded-xl outline-none transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                  placeholder="Nhập tên của bạn"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email (Không thể thay đổi)</label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-800/50 border border-transparent rounded-xl outline-none font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Lưu thay đổi
            </button>
            {message && (
              <span className={`text-sm font-bold ${message.includes('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="ios-glass p-8 rounded-3xl mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-500" /> Đổi mật khẩu
        </h2>
        <form onSubmit={handlePasswordChange}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-black/40 rounded-xl outline-none transition-all font-medium text-gray-900 dark:text-white"
                placeholder="Nhập ít nhất 6 ký tự"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isChangingPassword || !newPassword}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                Cập nhật mật khẩu
              </button>
            </div>
            
            {passwordMessage && (
              <div className={`p-3 rounded-xl text-sm font-bold ${passwordMessage.includes('Lỗi') || passwordMessage.includes('ít nhất') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                {passwordMessage}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="ios-glass p-8 rounded-3xl mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <LogOut className="w-5 h-5 text-red-500" /> Đăng xuất
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Đăng xuất khỏi tài khoản trên thiết bị này.</p>
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-colors font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
