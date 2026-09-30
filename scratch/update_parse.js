const fs = require('fs');

let route = fs.readFileSync('src/app/api/ai/parse/route.ts', 'utf-8');

const target = `    const { text, wallets } = await request.json();`;
const replacement = `    const { text, wallets, categories } = await request.json();`;
route = route.replace(target, replacement);

const target2 = `    const walletsList = wallets?.map((w: any) => \`- "\${w.name}" (ID: \${w.id})\`).join('\\n') || 'Không có ví nào';`;
const replacement2 = `    const walletsList = wallets?.map((w: any) => \`- "\${w.name}" (ID: \${w.id})\`).join('\\n') || 'Không có ví nào';
    const categoriesList = categories?.map((c: any) => \`- "\${c.name}" (ID: \${c.id}) (Type: \${c.type})\`).join('\\n') || 'Không có danh mục nào';`;
route = route.replace(target2, replacement2);

const promptTarget = `3. wallet_id: ID của ví/tài khoản thanh toán. Chọn ID phù hợp nhất từ danh sách ví sau (nếu không khớp hoặc không nhắc đến, trả về rỗng ""):
\${walletsList}`;
const promptReplacement = `3. wallet_id: ID của ví/tài khoản thanh toán. Chọn ID phù hợp nhất từ danh sách ví sau (nếu không thấy, trả về rỗng ""):
\${walletsList}
4. category_id: ID của danh mục chi tiêu/thu nhập. Dựa vào nội dung giao dịch, hãy chọn ID phù hợp nhất từ danh mục sau:
\${categoriesList}
5. type: Là "expense" (chi tiêu/trừ tiền) hay "income" (thu nhập/được cộng tiền). Ví dụ: "lương", "nhận", "ai đó trả" -> income. Còn lại mua sắm ăn uống là expense.`;
route = route.replace(promptTarget, promptReplacement);

const jsonTarget = `{
  "amount": 50000,
  "note": "Ăn sáng phở",
  "wallet_id": "c1a2-3b4c..."
}`;
const jsonReplacement = `{
  "amount": 50000,
  "note": "Ăn sáng phở",
  "wallet_id": "c1a2-3b4c...",
  "category_id": "d4e5-6f7g...",
  "type": "expense"
}`;
route = route.replace(jsonTarget, jsonReplacement);

fs.writeFileSync('src/app/api/ai/parse/route.ts', route, 'utf-8');
console.log('route.ts updated for income/expense');
