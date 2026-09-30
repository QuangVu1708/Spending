import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hàm nhận diện ngân hàng quen thuộc để tô màu và icon
export function getBankBrand(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('momo')) {
    return { name: 'MoMo', bg: 'bg-pink-600', text: 'text-pink-600', short: 'MM' };
  }
  if (lowerName.includes('zalo')) {
    return { name: 'ZaloPay', bg: 'bg-blue-500', text: 'text-blue-500', short: 'ZP' };
  }
  if (lowerName.includes('vietcombank') || lowerName.includes('vcb')) {
    return { name: 'Vietcombank', bg: 'bg-green-600', text: 'text-green-600', short: 'VCB' };
  }
  if (lowerName.includes('techcombank') || lowerName.includes('tcb')) {
    return { name: 'Techcombank', bg: 'bg-red-600', text: 'text-red-600', short: 'TCB' };
  }
  if (lowerName.includes('tpbank') || lowerName.includes('tpb')) {
    return { name: 'TPBank', bg: 'bg-purple-700', text: 'text-purple-700', short: 'TPB' };
  }
  if (lowerName.includes('mbbank') || lowerName.includes(' mb ')) {
    return { name: 'MBBank', bg: 'bg-blue-800', text: 'text-blue-800', short: 'MB' };
  }
  if (lowerName.includes('vietinbank') || lowerName.includes('ctg')) {
    return { name: 'VietinBank', bg: 'bg-blue-600', text: 'text-blue-600', short: 'VTB' };
  }
  if (lowerName.includes('bidv')) {
    return { name: 'BIDV', bg: 'bg-teal-600', text: 'text-teal-600', short: 'BIDV' };
  }
  if (lowerName.includes('tiền mặt') || lowerName.includes('cash') || lowerName.includes('ví')) {
    return { name: 'Tiền mặt', bg: 'bg-orange-500', text: 'text-orange-500', short: '💵' };
  }
  // Mặc định
  return { name: 'Tài khoản', bg: 'bg-gray-800 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-200', short: '💳' };
}
