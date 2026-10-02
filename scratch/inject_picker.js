const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const regex = /<div className="flex items-center gap-2 ios-glass px-4 py-2 rounded-2xl">[\s\S]*?<\/div>/;
code = code.replace(regex, '<DashboardMonthPicker />');

fs.writeFileSync('src/app/page.tsx', code, 'utf-8');
console.log('Fixed header');
