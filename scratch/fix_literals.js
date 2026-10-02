const fs = require('fs');

function unescapeLiterals(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(filePath, content, 'utf-8');
}

unescapeLiterals('src/components/DashboardMonthPicker.tsx');
unescapeLiterals('src/components/TransactionFilters.tsx');
console.log('Fixed literals');
