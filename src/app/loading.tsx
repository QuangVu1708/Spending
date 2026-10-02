import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh]">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );
}
