const fs = require('fs');

let code = fs.readFileSync('src/app/transactions/page.tsx', 'utf-8');

// 1. Add import
code = code.replace(
  `import { cn } from '@/lib/utils';`,
  `import { cn } from '@/lib/utils';\nimport TransactionFilters from '@/components/TransactionFilters';`
);

// 2. Add searchParams to props
code = code.replace(
  `export default async function TransactionsPage() {`,
  `export default async function TransactionsPage({ searchParams }: { searchParams: { from?: string, to?: string } }) {`
);

// 3. Update query logic
const queryTarget = `  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false });`;

const queryReplacement = `  let query = supabase
    .from('transactions')
    .select('*, categories(type)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false });

  if (searchParams.from) {
    query = query.gte('transaction_date', searchParams.from);
  }
  if (searchParams.to) {
    query = query.lte('transaction_date', searchParams.to + 'T23:59:59.999Z');
  }

  const { data: transactions } = await query;`;

code = code.replace(queryTarget, queryReplacement);

// 4. Inject component into JSX
code = code.replace(
  `<div className="mb-10">`,
  `<TransactionFilters />\n\n      <div className="mb-6">`
);

fs.writeFileSync('src/app/transactions/page.tsx', code, 'utf-8');
console.log('Transactions page updated');
