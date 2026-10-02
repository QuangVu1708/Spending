import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InstallPwaButton from '@/components/InstallPwaButton';

export default async function UtilitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tiện ích</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Các công cụ mở rộng giúp trải nghiệm tốt hơn</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {/* PWA Install Section */}
        <InstallPwaButton />
        
        {/* Placeholder for future features */}
        <div className="ios-glass p-6 rounded-3xl opacity-50 flex flex-col md:flex-row items-center justify-between gap-4 border border-dashed border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
              <div className="w-6 h-6 border-2 border-current rounded-full opacity-50"></div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Tính năng sắp tới...</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đang được phát triển</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
