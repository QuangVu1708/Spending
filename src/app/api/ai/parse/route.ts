import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, wallets, categories } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const walletsList = wallets?.map((w: any) => `- "${w.name}" (ID: ${w.id})`).join('\n') || 'Không có ví nào';
    const categoriesList = categories?.map((c: any) => `- "${c.name}" (ID: ${c.id}) (Type: ${c.type})`).join('\n') || 'Không có danh mục nào';

    const prompt = `Bạn là một trợ lý tài chính thông minh. Người dùng sẽ nhập một câu mô tả giao dịch chi tiêu.
Nhiệm vụ của bạn là trích xuất các thông tin sau:
1. amount: Số tiền (kiểu số nguyên). Nếu người dùng viết "50k", "50 cành" thì hiểu là 50000. Nếu "1 củ" là 1000000. Nếu có chữ "thu", "nhận" thì là thu nhập nhưng vẫn trả về số dương.
2. note: Ghi chú ngắn gọn. Ví dụ: "Ăn phở", "Đổ xăng", "Lương tháng 10".
3. wallet_id: ID của ví/tài khoản thanh toán. Chọn ID phù hợp nhất từ danh sách ví sau (nếu không thấy, trả về rỗng ""):
${walletsList}
4. category_id: ID của danh mục chi tiêu/thu nhập. Dựa vào nội dung giao dịch, hãy chọn ID phù hợp nhất từ danh mục sau:
${categoriesList}
5. type: Là "expense" (chi tiêu/trừ tiền) hay "income" (thu nhập/được cộng tiền). Ví dụ: "lương", "nhận", "ai đó trả" -> income. Còn lại mua sắm ăn uống là expense.

Định dạng bắt buộc trả về là JSON (không có markdown). Mẫu:
{
  "amount": 50000,
  "note": "Ăn sáng phở",
  "wallet_id": "c1a2-3b4c...",
  "category_id": "d4e5-6f7g...",
  "type": "expense"
}

Câu của người dùng: "${text}"`;

    let res;
    let retries = 3;
    let delay = 1000;
    // Fallback models if one runs out of quota
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];
    let currentModelIndex = 0;
    
    while (retries > 0 && currentModelIndex < modelsToTry.length) {
      const currentModel = modelsToTry[currentModelIndex];
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
      });

      if (res.status === 429 || res.status === 404 || res.status === 403) {
        // Quota exceeded, model not found, or forbidden -> Try the next fallback model!
        currentModelIndex++;
        continue;
      }
      
      if (res.status !== 503) break; // Thoát vòng lặp nếu thành công hoặc lỗi khác
      
      retries--;
      if (retries === 0) break;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // Exponential backoff
    }

    if (!res) throw new Error('Fetch failed');
    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API Error from fetch:", data);
      throw new Error(data.error?.message || 'Lỗi kết nối Gemini API');
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error('AI returned empty response');
    }

    const result = JSON.parse(resultText);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
