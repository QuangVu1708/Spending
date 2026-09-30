import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { text, wallets } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const walletsList = wallets?.map((w: any) => `- "${w.name}" (ID: ${w.id})`).join('\n') || 'Không có ví nào';

    const prompt = `Bạn là một trợ lý tài chính thông minh. Người dùng sẽ nhập một câu mô tả giao dịch chi tiêu.
Nhiệm vụ của bạn là trích xuất các thông tin sau:
1. amount: Số tiền (kiểu số nguyên). Nếu người dùng viết "50k", "50 cành" thì hiểu là 50000. Nếu "1 củ" là 1000000. Nếu có chữ "thu", "nhận" thì là thu nhập nhưng vẫn trả về số dương.
2. note: Ghi chú ngắn gọn. Ví dụ: "Ăn phở", "Đổ xăng", "Lương tháng 10".
3. wallet_id: ID của ví/tài khoản thanh toán. Chọn ID phù hợp nhất từ danh sách ví sau (nếu không khớp hoặc không nhắc đến, trả về rỗng ""):
${walletsList}

Định dạng bắt buộc trả về là JSON (không có markdown). Mẫu:
{
  "amount": 50000,
  "note": "Ăn sáng phở",
  "wallet_id": "c1a2-3b4c..."
}

Câu của người dùng: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('AI returned empty response');
    }

    const result = JSON.parse(response.text);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Xử lý lỗi 503 Overloaded hoặc các lỗi Google trả về
    const errorString = String(error.message || error);
    let friendlyMessage = 'Lỗi kết nối đến máy chủ AI.';
    
    if (errorString.includes('503') || errorString.includes('experiencing high demand') || errorString.includes('UNAVAILABLE')) {
      friendlyMessage = 'Hệ thống AI của Google hiện đang quá tải do có quá nhiều người sử dụng. Vui lòng thử lại sau giây lát hoặc sử dụng nút Nhập thủ công nhé!';
    } else if (errorString.includes('404') || errorString.includes('not found')) {
      friendlyMessage = 'Phiên bản AI này hiện không khả dụng. Vui lòng kiểm tra lại cấu hình phiên bản Gemini.';
    } else if (errorString.includes('API_KEY')) {
      friendlyMessage = 'Vui lòng kiểm tra lại GEMINI_API_KEY của bạn.';
    }

    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
