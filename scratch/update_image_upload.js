const fs = require('fs');

// 1. Update page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');
page = page.replace(
  `<ImageUpload wallets={wallets || []} userId={user.id} />`,
  `<ImageUpload wallets={wallets || []} categories={categories || []} userId={user.id} />`
);
fs.writeFileSync('src/app/page.tsx', page, 'utf-8');

// 2. Update ImageUpload.tsx
let img = fs.readFileSync('src/components/smart-input/ImageUpload.tsx', 'utf-8');
img = img.replace(
  `export default function ImageUpload({ wallets, userId }: { wallets?: any[], userId?: string }) {`,
  `export default function ImageUpload({ wallets, categories, userId }: { wallets?: any[], categories?: any[], userId?: string }) {`
);

img = img.replace(
  `wallets \n        })`,
  `wallets, categories \n        })`
);

const saveTarget = `    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet_id,
      amount: amount,
      converted_amount: amount,
      currency: 'VND',
      note: note,
    });

    setIsSaving(false);`;

const saveReplacement = `    const finalType = result.type || 'expense';
    const finalCategoryId = result.category_id || null;

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
      const targetWallet = wallets?.find(w => w.id === wallet_id);
      if (targetWallet) {
        const newBalance = finalType === 'income' 
          ? targetWallet.balance + amount 
          : targetWallet.balance - amount;
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet_id);
      }
    }

    setIsSaving(false);`;
img = img.replace(saveTarget, saveReplacement);

fs.writeFileSync('src/components/smart-input/ImageUpload.tsx', img, 'utf-8');
console.log('ImageUpload updated with balance logic');
