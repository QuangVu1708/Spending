const fs = require('fs');

function addRetry(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const target = `    const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${apiKey}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },`;
      
  const replacement = `    let res;
    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${apiKey}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },`;

  if (!content.includes(target)) {
    console.log("Target not found in", filePath);
    return;
  }
  
  content = content.replace(target, replacement);
  
  const endTarget = `    });

    const data = await res.json();`;
    
  const endReplacement = `      });

      if (res.status !== 503) break; // Thoát vòng lặp nếu không phải lỗi quá tải
      
      retries--;
      if (retries === 0) break;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // Exponential backoff
    }

    const data = await res.json();`;

  content = content.replace(endTarget, endReplacement);
  fs.writeFileSync(filePath, content, 'utf-8');
}

addRetry('src/app/api/ai/parse/route.ts');
addRetry('src/app/api/ai/parse-image/route.ts');
console.log('Added retry logic');
