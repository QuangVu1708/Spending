const fs = require('fs');
let content = fs.readFileSync('src/components/smart-input/SmartTextInput.tsx', 'utf-8');

const target = `</form>

          {/* Hiển thị kết quả bóc tách từ AI */}`;

const replacement = `</form>

          {!result && (
            <div className="flex justify-center mt-6">
              <button 
                type="button" 
                onClick={() => setIsManualMode(true)}
                className="text-sm text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 font-bold flex items-center gap-1.5 transition-colors bg-white/50 dark:bg-[#111] px-5 py-2 rounded-full ring-1 ring-slate-200 dark:ring-white/10"
              >
                <Edit3 className="w-4 h-4" /> Hoặc nhập thủ công (truyền thống)
              </button>
            </div>
          )}

          {/* Hiển thị kết quả bóc tách từ AI */}`;

// In case the vietnamese character breaks target matching, let's use regex again.
const regex = /<\/form>\s*\{\/\* H.*? AI \*\/\}/;
if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/smart-input/SmartTextInput.tsx', content, 'utf-8');
  console.log('Added manual button!');
} else {
  console.log('Still not found');
}
