const fs = require('fs');
let content = fs.readFileSync('src/components/smart-input/SmartTextInput.tsx', 'utf-8');

// 1. Pass categories to fetch API
content = content.replace(
  `body: JSON.stringify({ text: input, wallets })`,
  `body: JSON.stringify({ text: input, wallets, categories })`
);

// 2. Add type and category_id to result state
content = content.replace(
  `wallet_id: data.wallet_id || undefined`,
  `wallet_id: data.wallet_id || undefined,
          category_id: data.category_id || undefined,
          type: data.type || 'expense'`
);

// 3. Save logic to insert category_id and update wallet balance
const saveTarget = `    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet_id,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: note,
    });

    setIsSaving(false);`;

const saveReplacement = `    const finalType = result?.type || 'expense';
    const finalCategoryId = result?.category_id || manualCategory || null;

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet_id,
      category_id: finalCategoryId,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: note,
    });

    if (!error) {
      // Cập nhật số dư ví
      const targetWallet = wallets?.find(w => w.id === wallet_id);
      if (targetWallet) {
        const newBalance = finalType === 'income' 
          ? targetWallet.balance + amount 
          : targetWallet.balance - amount;
          
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet_id);
      }
    }

    setIsSaving(false);`;
content = content.replace(saveTarget, saveReplacement);

fs.writeFileSync('src/components/smart-input/SmartTextInput.tsx', content, 'utf-8');
console.log('SmartTextInput updated with balance logic');
