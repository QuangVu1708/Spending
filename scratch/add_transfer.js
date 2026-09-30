const fs = require('fs');
let content = fs.readFileSync('src/app/wallets/WalletsClient.tsx', 'utf-8');

// 1. Thêm State
const stateTarget = `const [showAddModal, setShowAddModal] = useState(false);`;
const stateReplacement = `const [showAddModal, setShowAddModal] = useState(false);
  
  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);`;

content = content.replace(stateTarget, stateReplacement);

// 2. Thêm function handleTransfer
const funcTarget = `const handleAddWallet = async (e: React.FormEvent) => {`;
const funcReplacement = `const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert('Ví nguồn và ví đích không được trùng nhau');
      return;
    }
    const amount = parseInt(transferAmount);
    if (!amount || amount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    setIsTransferring(true);
    
    // Find wallets
    const fromW = wallets.find(w => w.id === transferFrom);
    const toW = wallets.find(w => w.id === transferTo);
    
    if (!fromW || !toW) {
      setIsTransferring(false);
      return;
    }

    // Update balances
    const { error: err1 } = await supabase.from('wallets').update({ balance: fromW.balance - amount }).eq('id', fromW.id);
    const { error: err2 } = await supabase.from('wallets').update({ balance: toW.balance + amount }).eq('id', toW.id);

    // Save transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: fromW.id,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: \`Chuyển tiền sang \${toW.name}\`
    });
    
    await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: toW.id,
      amount: amount, // Positive to denote incoming or keep it generic? Usually income is positive, expense is negative. We'll just leave it generic.
      converted_amount: amount,
      currency: 'VND',
      note: \`Nhận tiền từ \${fromW.name}\`
    });

    setIsTransferring(false);
    
    if (err1 || err2) {
      alert('Lỗi chuyển tiền');
    } else {
      alert('Chuyển tiền thành công!');
      setShowTransferModal(false);
      setTransferAmount('');
      window.location.reload();
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {`;

content = content.replace(funcTarget, funcReplacement);

// 3. Thêm Nút Chuyển Tiền cạnh nút Thêm Ví Mới
const btnTarget = `<Plus className="w-5 h-5" /> ThAm VA- m>i
          </button>`;
// Because of encoding issues with 'Thêm Ví mới', let's use regex
const btnRegex = /<Plus className="w-5 h-5" \/> .*?\n\s*<\/button>/;
const btnReplacementMatch = content.match(btnRegex);
if (btnReplacementMatch) {
  const btnReplacement = btnReplacementMatch[0] + `
          <button 
            onClick={() => {
               if (wallets.length >= 2) {
                 setTransferFrom(wallets[0].id);
                 setTransferTo(wallets[1].id);
                 setShowTransferModal(true);
               } else {
                 alert('Bạn cần ít nhất 2 ví để chuyển tiền');
               }
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-md ml-3"
          >
            <ArrowRightLeft className="w-5 h-5" /> Chuyển tiền
          </button>`;
  content = content.replace(btnRegex, btnReplacement);
}

// 4. Thêm Modal
const modalTarget = `{/* Modal ThAm VA- */}`;
const modalRegex = /\{\/\* Modal Th.*? VA- \*\/\}/;
const modalMatch = content.match(modalRegex);
if (modalMatch) {
  const modalReplacement = `{mounted && showTransferModal && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="ios-glass p-8 rounded-[32px] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><ArrowRightLeft className="text-indigo-500" /> Chuyển tiền</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Từ Ví</label>
                <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] rounded-xl outline-none font-medium">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Đến Ví</label>
                <select value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] rounded-xl outline-none font-medium">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Dư: {Number(w.balance).toLocaleString()}đ)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số tiền chuyển</label>
                <input type="number" required value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="Vd: 500000" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] rounded-xl outline-none font-medium" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-[#27272a] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">Hủy</button>
                <button type="submit" disabled={isTransferring} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors flex justify-center items-center gap-2">
                  {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Chuyển ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      ` + modalMatch[0];
  content = content.replace(modalRegex, modalReplacement);
}

fs.writeFileSync('src/app/wallets/WalletsClient.tsx', content, 'utf-8');
console.log('Transfer feature added!');
