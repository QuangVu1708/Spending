const fs = require('fs');

function fixTypescript(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace `const data = await res.json();` with a null check
  const target = `    const data = await res.json();`;
  const replacement = `    if (!res) throw new Error('Fetch failed');
    const data = await res.json();`;
    
  if (content.includes(target) && !content.includes(replacement)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed TS error in', filePath);
  } else {
    console.log('Already fixed or target not found in', filePath);
  }
}

fixTypescript('src/app/api/ai/parse/route.ts');
fixTypescript('src/app/api/ai/parse-image/route.ts');
