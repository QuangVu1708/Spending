import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, Users, Database } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  
  if (!user) {
    redirect('/login');
  }

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentProfile?.role !== 'admin') {
    redirect('/'); // Go to home if not admin
  }


  // Fetch profiles (Requires appropriate RLS policies for admin)
  const { data: profiles } = await supabase.from('profiles').select('*');

  return (
    <div className="animate-page-transition w-full h-full">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Trang Quản Trị
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Quản lý người dùng và tài khoản hệ thống.
        </p>
      </div>

      <div className="ios-glass p-8 rounded-[32px]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Danh sách người dùng
          </h2>
        </div>

        <div className="space-y-4">
          {profiles && profiles.length > 0 ? (
            profiles.map((profile: any) => (
              <div 
                key={profile.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-[#27272a] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-white/50 dark:hover:bg-indigo-500/5 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-[#111] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 rounded-xl flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {profile.full_name || 'Người dùng ẩn danh'}
                    </h3>
                    <p className="font-medium text-gray-500 dark:text-gray-400 text-sm">
                      {profile.email || 'Không có email'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-[#27272a]">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ID</p>
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
                      {profile.id.substring(0, 8)}...
                    </p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trạng thái</p>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-200 dark:border-green-500/20">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-[#111]/50 rounded-2xl border border-dashed border-gray-200 dark:border-[#27272a]">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="font-medium">Không có dữ liệu hoặc bạn không có quyền xem.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
