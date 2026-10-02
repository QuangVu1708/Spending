const fs = require('fs');
let code = fs.readFileSync('src/components/smart-input/UnifiedSmartInput.tsx', 'utf-8');

// Instead of {!showEditForm ? ... : ... }, make them both render if showEditForm is true, but separate.
// Wait, the easiest way is to find `{!showEditForm ? (` and change to `{true && (`
// And `) : (` to `)} \n {showEditForm && (`

code = code.replace('{!showEditForm ? (', '{true && (');
code = code.replace(
  `          </div>
        </>
      ) : (
        <div className="ios-glass p-8 rounded-[32px] max-w-3xl mx-auto shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">`,
  `          </div>
        </>
      )}
      
      {showEditForm && (
        <div className="mt-8 ios-glass p-5 sm:p-8 rounded-[32px] max-w-3xl mx-auto shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">`
);

fs.writeFileSync('src/components/smart-input/UnifiedSmartInput.tsx', code, 'utf-8');
console.log('Fixed UI replacement issue');
