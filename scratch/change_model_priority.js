const fs = require('fs');

function prioritize8b(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    `const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];`,
    `const modelsToTry = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'];`
  );
  fs.writeFileSync(filePath, content, 'utf-8');
}

prioritize8b('src/app/api/ai/parse/route.ts');
prioritize8b('src/app/api/ai/parse-image/route.ts');
console.log('Model priority changed to 1.5-flash-8b');
