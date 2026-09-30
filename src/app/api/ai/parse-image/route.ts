import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Allow more time for image processing

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, wallets } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const walletsList = wallets?.map((w: any) => `- "${w.name}" (ID: ${w.id})`).join('\n') || 'Không có ví nào';

    const prompt = `Bạn là chuyên gia kế toán. Tôi có một bức ảnh chụp hóa đơn/biên lai/chuyển khoản.
Hãy phân tích bức ảnh này và trích xuất thông tin để ghi chép chi tiêu:
1. amount: TỔNG SỐ TIỀN thanh toán cuối cùng (kiểu số nguyên). 
2. note: Ghi chú tóm tắt (Ví dụ: "Hóa đơn siêu thị Coopmart", "Tiền cà phê Highland", "Biên lai chuyển khoản...").
3. wallet_id: ID ví thanh toán (Nếu trong ảnh có gợi ý phương thức thanh toán như Momo, Vietcombank... thì chọn ID phù hợp từ danh sách sau, nếu không thấy thì bỏ trống ""):
${walletsList}

Định dạng trả về duy nhất là JSON (không có markdown):
{
  "amount": 50000,
  "note": "Hóa đơn siêu thị",
  "wallet_id": "c1a2-3b4c..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          }
        }
      ],
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
    const errorString = String(error.message || error);
    let friendlyMessage = 'Lỗi kết nối đến máy chủ AI.';
    if (errorString.includes('503') || errorString.includes('experiencing high demand') || errorString.includes('UNAVAILABLE')) {
      friendlyMessage = 'Hệ thống AI đang quá tải do quá nhiều người sử dụng. Vui lòng đợi 1 phút và thử lại!';
    } else if (errorString.includes('404')) {
      friendlyMessage = 'Phiên bản AI này hiện không khả dụng. Vui lòng kiểm tra lại.';
    }
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}
