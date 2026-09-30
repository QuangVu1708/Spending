const fs = require('fs');
let content = fs.readFileSync('src/components/smart-input/SmartTextInput.tsx', 'utf-8');

const target = `            </button>
          </form>`;

const replacement = `            </button>
          </form>

          {!result && (
            <div className="flex justify-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsManualMode(true)}
                className="text-sm text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 font-bold flex items-center gap-1.5 transition-colors bg-white/50 dark:bg-black/20 px-4 py-1.5 rounded-full"
              >
                <Edit3 className="w-4 h-4" /> Hoặc nhập thủ công (truyền thống)
              </button>
            </div>
          )}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/smart-input/SmartTextInput.tsx', content, 'utf-8');
  console.log('Added manual mode button!');
} else {
  console.log('Target not found');
}
