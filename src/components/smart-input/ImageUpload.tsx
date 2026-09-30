'use client';
import { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    // Mock OCR API call
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 bg-white",
          isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-gray-200 hover:border-gray-300",
          file ? "pb-6" : ""
        )}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tải ảnh hóa đơn / Bill</h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">Kéo thả ảnh vào đây hoặc click để chọn file. AI sẽ tự động quét số tiền.</p>
            <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-800 transition-colors shadow-md">
              Chọn ảnh
              <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
            </label>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl w-full max-w-md border border-gray-100">
              <ImageIcon className="w-8 h-8 text-indigo-500" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">
                Xóa
              </button>
            </div>

            {isAnalyzing ? (
              <div className="mt-6 flex items-center gap-3 text-indigo-600 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang dùng AI OCR quét hóa đơn...
              </div>
            ) : (
              <div className="mt-6 w-full animate-in fade-in duration-500 bg-green-50 border border-green-100 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-green-800 uppercase tracking-wider">Kết quả Quét AI</span>
                </div>
                <div className="flex justify-between items-end border-b border-green-200 pb-4 mb-4">
                  <div>
                    <p className="text-green-700 text-sm font-medium mb-1">Số tiền thanh toán</p>
                    <p className="text-3xl font-bold text-green-900">450.000 ₫</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-700 text-sm font-medium mb-1">Đề xuất phân loại</p>
                    <p className="font-semibold text-green-900">Ăn uống / Nhà hàng</p>
                  </div>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors">
                  Lưu Giao Dịch
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
