const fs = require('fs');

function addModelFallback(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace the single model string with an array of models
  const target = `    let res;
    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${apiKey}\`, {`;

  const replacement = `    let res;
    let retries = 3;
    let delay = 1000;
    // Fallback models if one runs out of quota
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];
    let currentModelIndex = 0;
    
    while (retries > 0 && currentModelIndex < modelsToTry.length) {
      const currentModel = modelsToTry[currentModelIndex];
      res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${currentModel}:generateContent?key=\${apiKey}\`, {`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    
    // Also need to handle the quota error condition to switch model
    const breakTarget = `      if (res.status !== 503) break; // Thoát vòng lặp nếu không phải lỗi quá tải
      
      retries--;`;
      
    const breakReplacement = `      if (res.status === 429 || res.status === 404 || res.status === 403) {
        // Quota exceeded, model not found, or forbidden -> Try the next fallback model!
        currentModelIndex++;
        continue;
      }
      
      if (res.status !== 503) break; // Thoát vòng lặp nếu thành công hoặc lỗi khác
      
      retries--;`;
      
    content = content.replace(breakTarget, breakReplacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Added model fallback to', filePath);
  } else {
    console.log('Target not found in', filePath);
  }
}

addModelFallback('src/app/api/ai/parse/route.ts');
addModelFallback('src/app/api/ai/parse-image/route.ts');
