const fs = require('fs');

let inputCode = fs.readFileSync('src/components/smart-input/UnifiedSmartInput.tsx', 'utf-8');

// 1. Add compressImage function inside the component or outside
const compressFunc = `
// HÀM ÉP CÂN ẢNH (Nén ảnh tại trình duyệt để tiết kiệm quota và tăng tốc AI x10 lần)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export to JPEG with 0.7 quality (very small file size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl.split(',')[1]); // Trả về phần base64 core
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
`;

const importTarget = `import toast from 'react-hot-toast';`;
inputCode = inputCode.replace(importTarget, importTarget + '\n' + compressFunc);

const handleSelectTarget = `const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (!base64Data) throw new Error("Không thể đọc ảnh");`;

const handleSelectReplacement = `// Bóp ảnh xuống 100KB trước khi gửi đi!
      const compressedBase64 = await compressImage(file);
      
      try { // Keep inner try structure clean
        const base64Data = compressedBase64;`;

// Wait, I need to properly replace the whole block since I am changing the logic flow
const blockTarget = `    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (!base64Data) throw new Error("Không thể đọc ảnh");

        const res = await fetch('/api/ai/parse-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            wallets,
            categories
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Populate form
        setManualAmount(data.converted_amount?.toString() || data.amount?.toString() || '');
        setManualNote(data.note || '');
        setManualCategory(data.category_id || '');
        setManualType(data.type || 'expense');
        if (data.wallet_id) setManualWallet(data.wallet_id);
        
        setShowEditForm(true);
        toast.success('AI đã quét hóa đơn xong! Vui lòng kiểm tra lại.');
      };
      reader.readAsDataURL(file);
    } catch (error: any) {`;

const blockReplacement = `    try {
      // 1. Ép cân ảnh trước khi gửi đi!
      const compressedBase64 = await compressImage(file);
      
      // 2. Gửi ảnh siêu nhẹ lên máy chủ (Tốc độ Upload cực nhanh)
      const res = await fetch('/api/ai/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          mimeType: 'image/jpeg', // Luôn là JPEG vì đã qua nén
          wallets,
          categories
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Populate form
      setManualAmount(data.converted_amount?.toString() || data.amount?.toString() || '');
      setManualNote(data.note || '');
      setManualCategory(data.category_id || '');
      setManualType(data.type || 'expense');
      if (data.wallet_id) setManualWallet(data.wallet_id);
      
      setShowEditForm(true);
      toast.success('AI siêu tốc đã quét xong! Kiểm tra lại nhé.');
    } catch (error: any) {`;

inputCode = inputCode.replace(blockTarget, blockReplacement);
fs.writeFileSync('src/components/smart-input/UnifiedSmartInput.tsx', inputCode, 'utf-8');
console.log('Image Compression added to UnifiedSmartInput');
