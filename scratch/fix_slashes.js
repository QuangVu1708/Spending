const fs = require('fs');
let content = fs.readFileSync('src/components/smart-input/UnifiedSmartInput.tsx', 'utf-8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/smart-input/UnifiedSmartInput.tsx', content, 'utf-8');
console.log('Fixed backslashes');
