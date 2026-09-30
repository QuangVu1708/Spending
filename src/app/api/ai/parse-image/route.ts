import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow more time for image processing

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, wallets } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

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

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: imageBase64 } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API Image Error from fetch:", data);
      throw new Error(data.error?.message || 'Lỗi kết nối Gemini API Ảnh');
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error('AI returned empty response for image');
    }

    const result = JSON.parse(resultText);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
