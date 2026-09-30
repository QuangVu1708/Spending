const fs = require('fs');

function updateModel(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/model: 'gemini-3\.8-flash'/g, "model: 'gemini-1.5-flash'");
  fs.writeFileSync(filePath, content, 'utf-8');
}

updateModel('src/app/api/ai/parse/route.ts');
updateModel('src/app/api/ai/parse-image/route.ts');
console.log('Downgraded to 1.5-flash');
