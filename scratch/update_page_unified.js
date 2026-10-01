const fs = require('fs');
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace imports
page = page.replace(
  `import SmartTextInput from '@/components/smart-input/SmartTextInput';\nimport ImageUpload from '@/components/smart-input/ImageUpload';`,
  `import UnifiedSmartInput from '@/components/smart-input/UnifiedSmartInput';`
);

// Replace component tags
const oldTags = `<SmartTextInput wallets={wallets || []} categories={categories || []} userId={user.id} />
          <ImageUpload wallets={wallets || []} categories={categories || []} userId={user.id} />`;
const newTag = `<UnifiedSmartInput wallets={wallets || []} categories={categories || []} userId={user.id} />`;
page = page.replace(oldTags, newTag);

fs.writeFileSync('src/app/page.tsx', page, 'utf-8');
console.log('Replaced with UnifiedSmartInput');
