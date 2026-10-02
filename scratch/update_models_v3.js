const fs = require('fs');

function updateModels(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /const modelsToTry = \[.*?\];/,
    `const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-pro'];`
  );
  fs.writeFileSync(filePath, content, 'utf-8');
}

updateModels('src/app/api/ai/parse/route.ts');
updateModels('src/app/api/ai/parse-image/route.ts');
console.log('Updated models to match the user screenshot');
