const fs = require('fs');
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

page = page.replace(
  /<SmartTextInput[\s\S]*?<ImageUpload[\s\S]*?\/>/g,
  `<UnifiedSmartInput wallets={wallets || []} categories={categories || []} userId={user.id} />`
);

fs.writeFileSync('src/app/page.tsx', page, 'utf-8');
console.log('Fixed page.tsx');
