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
      setPasswordMessage('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±.');
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage(`Lá»—i: ${error.message}`);
    } else {
      setPasswordMessage('Äá»•i máº­t kháº©u thÃ nh cÃ´ng!');
      setNewPassword('');
    }
    setIsChangingPassword(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      avatar_url: avatarUrl
    }).eq('id', user.id);

    if (error) {
      setMessage(`Lá»—i: ${error.message}`);
    } else {
      setMessage('Cáº­p nháº­t thÃ´ng tin thÃ nh cÃ´ng!');
      router.refresh();
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setIsUploading(true);
      setMessage('');

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      
      // Auto save the new avatar url to profile
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      
      setMessage('Táº£i áº£nh Ä‘áº¡i diá»‡n thÃ nh cÃ´ng!');
      router.refresh();
    } catch (error: any) {
      setMessage(`Lá»—i táº£i áº£nh: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-page-transition w-full h-full max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
          CÃ i Äáº·t TÃ i Khoáº£n
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n vÃ  áº£nh Ä‘áº¡i diá»‡n cá»§a báº¡n.
        </p>
      </div>

      <div className="ios-glass p-8 rounded-[32px] shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-[#111] border-4 border-white dark:border-[#222] shadow-xl overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">áº¢nh Ä‘áº¡i diá»‡n</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Äá»‹nh dáº¡ng JPG, PNG hoáº·c GIF. Tá»‘i Ä‘a 2MB.</p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#27272a]" />

          {/* User Info Section */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Äá»‹a chá»‰ Email (Chá»‰ xem)</label>
              <input 
                type="text" 
                disabled 
                value={user.email} 
                className="w-full px-4 py-3 bg-gray-100 dark:bg-[#111] text-gray-500 border border-gray-200 dark:border-[#333] rounded-xl outline-none font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Há» vÃ  TÃªn</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nháº­p tÃªn cá»§a báº¡n..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${message.includes('Lá»—i') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              LÆ°u Thay Äá»•i
            </button>
          </div>
        
          {/* Password Change Section */}
          <hr className="border-gray-100 dark:border-[#27272a] my-8" />
          
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Äá»•i máº­t kháº©u</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Máº­t kháº©u má»›i</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nháº­p máº­t kháº©u má»›i (Ã­t nháº¥t 6 kÃ½ tá»±)..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl outline-none focus:border-indigo-500 font-medium text-gray-900 dark:text-white transition-colors"
                />
              </div>
              <button 
                type="button"
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword}
                className="w-full sm:w-auto bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white dark:text-black text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 h-[50px] flex items-center justify-center gap-2"
              >
                {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                Cáº­p nháº­t
              </button>
            </div>
            
            {passwordMessage && (
              <div className={`p-3 rounded-xl text-sm font-bold ${passwordMessage.includes('Lá»—i') || passwordMessage.includes('Ã­t nháº¥t') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Đăng xuất kh?i tài khoản trên thiết bị này.</p>
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

