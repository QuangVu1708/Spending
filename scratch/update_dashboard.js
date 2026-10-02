const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Add import
code = code.replace(
  `import UnifiedSmartInput from '@/components/smart-input/UnifiedSmartInput';`,
  `import UnifiedSmartInput from '@/components/smart-input/UnifiedSmartInput';\nimport DashboardMonthPicker from '@/components/DashboardMonthPicker';`
);

// Add searchParams to Home component
code = code.replace(
  `export default async function Home() {`,
  `export default async function Home({ searchParams }: { searchParams: { month?: string } }) {`
);

// Update query logic
const targetDateLogic = `  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .lte('transaction_date', endOfMonth.toISOString())
    .gte('transaction_date', startOfMonth.toISOString());`;

const replaceDateLogic = `  const targetMonth = searchParams.month ? new Date(searchParams.month) : new Date();
  const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .lte('transaction_date', endOfMonth.toISOString())
    .gte('transaction_date', startOfMonth.toISOString());`;

code = code.replace(targetDateLogic, replaceDateLogic);

// Add MonthPicker to UI
code = code.replace(
  `          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tng quan</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">BAo cAo tAi chA-nh thAng {now.getMonth() + 1}/{now.getFullYear()}</p>
          </div>`,
  `          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tổng quan</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Báo cáo tài chính</p>
            </div>
            <DashboardMonthPicker />
          </div>`
);

// Need regex because of weird encoding characters in 'BAo cAo tAi chA-nh thAng'
const regexTarget = /<div>\s*<h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">.*?<\/h1>\s*<p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">.*?<\/p>\s*<\/div>/s;

const regexReplacement = `<div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">T\\u1ed5ng quan</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">B\\u00e1o c\\u00e1o t\\u00e0i ch\\u00ednh</p>
            </div>
            <DashboardMonthPicker />
          </div>`;

// Check if regex matches
if (code.match(regexTarget)) {
  code = code.replace(regexTarget, regexReplacement);
} else {
  // Try another replacement if regex fails
  console.log("Could not find the header to replace, maybe already replaced or different text");
}

fs.writeFileSync('src/app/page.tsx', code, 'utf-8');
console.log('Dashboard updated with month picker');
