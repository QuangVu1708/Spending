const fs = require('fs');

function updateModel(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/gemini-1\.5-flash/g, 'gemini-3.8-flash');
  fs.writeFileSync(filePath, content, 'utf-8');
}

updateModel('src/app/api/ai/parse/route.ts');
updateModel('src/app/api/ai/parse-image/route.ts');
console.log('Restored to gemini-3.8-flash');
