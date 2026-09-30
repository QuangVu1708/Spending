const fs = require('fs');

let content = fs.readFileSync('src/components/smart-input/SmartTextInput.tsx', 'utf-8');

const target = `    setTimeout(() => {
      setResult({
        amount: parseInt(input.replace(/[^0-9]/g, '')) || 50000,
        currency: 'VND',
        converted_amount: parseInt(input.replace(/[^0-9]/g, '')) || 50000,
        category: 'Ăn uống',
        is_fixed: false,
        note: input,
      });
      setIsLoading(false);
      setInput('');
    }, 1500);`;

const replacement = `    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, wallets })
      });
      const data = await res.json();
      
      if (res.ok) {
        setResult({
          amount: data.amount || 0,
          currency: 'VND',
          converted_amount: data.amount || 0,
          category: data.category || 'Khác',
          is_fixed: false,
          note: data.note || input,
          wallet_id: data.wallet_id || undefined
        });
        
        // Auto select the wallet if AI detected it
        if (data.wallet_id) {
          setManualWallet(data.wallet_id);
        }
        
        setInput('');
      } else {
        alert('Lỗi AI: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Không thể kết nối đến AI');
    } finally {
      setIsLoading(false);
    }`;

// Notice the encoding issue with 'Ăn uống' in the original file might make exact string replacement fail.
// So I will use regex.
const regex = /setTimeout\(\(\) => \{[\s\S]*?\}, 1500\);/;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/smart-input/SmartTextInput.tsx', content, 'utf-8');
  console.log('SmartTextInput updated to use AI!');
} else {
  console.log('Regex did not match');
}
