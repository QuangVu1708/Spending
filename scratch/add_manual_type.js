const fs = require('fs');

let content = fs.readFileSync('src/components/smart-input/SmartTextInput.tsx', 'utf-8');

const stateTarget = `const [manualCategory, setManualCategory] = useState('');`;
const stateReplacement = `const [manualCategory, setManualCategory] = useState('');
  const [manualType, setManualType] = useState('expense');`;
content = content.replace(stateTarget, stateReplacement);

const saveTarget = `const finalType = result?.type || 'expense';`;
const saveReplacement = `const finalType = isManualMode ? manualType : (result?.type || 'expense');`;
content = content.replace(saveTarget, saveReplacement);

const openEditorTarget = `setIsManualMode(true);
    if (result) {
      setManualAmount(result.converted_amount?.toString() || result.amount?.toString() || '');
      setManualNote(result.note);
      setManualCategory('');
    }`;
const openEditorReplacement = `setIsManualMode(true);
    if (result) {
      setManualAmount(result.converted_amount?.toString() || result.amount?.toString() || '');
      setManualNote(result.note || '');
      setManualCategory(result.category_id || '');
      setManualType(result.type || 'expense');
      if (result.wallet_id) setManualWallet(result.wallet_id);
    }`;
// Need to handle regex for `if (result)`
content = content.replace(/setIsManualMode\(true\);\s*if \(result\) \{[\s\S]*?\}/, openEditorReplacement);

const formTarget = `<div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số tiền</label>`;
const formReplacement = `<div className="md:col-span-2 mb-2">
              <div className="flex bg-slate-100 dark:bg-[#27272a] p-1 rounded-2xl w-fit">
                <button 
                  type="button" 
                  onClick={() => setManualType('expense')}
                  className={\`px-6 py-2.5 rounded-xl font-bold transition-all \${manualType === 'expense' ? 'bg-white dark:bg-slate-800 text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                >Khoản Chi (-)</button>
                <button 
                  type="button" 
                  onClick={() => setManualType('income')}
                  className={\`px-6 py-2.5 rounded-xl font-bold transition-all \${manualType === 'income' ? 'bg-white dark:bg-slate-800 text-green-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                >Khoản Thu (+)</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số tiền</label>`;
content = content.replace(formTarget, formReplacement);

fs.writeFileSync('src/components/smart-input/SmartTextInput.tsx', content, 'utf-8');
console.log('Added manual type toggle');
