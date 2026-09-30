const fs = require('fs');

let route = fs.readFileSync('src/app/api/ai/parse-image/route.ts', 'utf-8');

const target = `    const { imageBase64, mimeType, wallets } = await request.json();`;
const replacement = `    const { imageBase64, mimeType, wallets, categories } = await request.json();`;
route = route.replace(target, replacement);

const target2 = `    const walletsList = wallets?.map((w: any) => \`- "\${w.name}" (ID: \${w.id})\`).join('\\n') || 'Không có ví nào';`;
const replacement2 = `    const walletsList = wallets?.map((w: any) => \`- "\${w.name}" (ID: \${w.id})\`).join('\\n') || 'Không có ví nào';
    const categoriesList = categories?.map((c: any) => \`- "\${c.name}" (ID: \${c.id}) (Type: \${c.type})\`).join('\\n') || 'Không có danh mục nào';`;
route = route.replace(target2, replacement2);

const promptTarget = `3. wallet_id: ID ví thanh toán (Nếu trong ảnh có gợi ý phương thức thanh toán như Momo, Vietcombank... thì chọn ID phù hợp từ danh sách sau, nếu không thấy thì bỏ trống ""):
\${walletsList}`;
const promptReplacement = `3. wallet_id: ID ví thanh toán (Nếu trong ảnh có gợi ý phương thức thanh toán như Momo, Vietcombank... thì chọn ID phù hợp từ danh sách sau, nếu không thấy thì bỏ trống ""):
\${walletsList}
4. category_id: Phân loại khoản chi này. Chọn ID danh mục phù hợp nhất từ danh sách sau:
\${categoriesList}
5. type: Là "expense" (chi tiêu/trừ tiền) hay "income" (thu nhập/được cộng tiền). Hầu hết hóa đơn là "expense".`;
route = route.replace(promptTarget, promptReplacement);

const jsonTarget = `{
  "amount": 50000,
  "note": "Hóa đơn siêu thị",
  "wallet_id": "c1a2-3b4c..."
}`;
const jsonReplacement = `{
  "amount": 50000,
  "note": "Hóa đơn siêu thị",
  "wallet_id": "c1a2-3b4c...",
  "category_id": "d4e5-6f7g...",
  "type": "expense"
}`;
route = route.replace(jsonTarget, jsonReplacement);

fs.writeFileSync('src/app/api/ai/parse-image/route.ts', route, 'utf-8');
console.log('parse-image route.ts updated');
