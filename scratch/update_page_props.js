const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `<ImageUpload />`;
const replacement = `<ImageUpload wallets={wallets || []} userId={user.id} />`;

if (page.includes(target)) {
  page = page.replace(target, replacement);
  fs.writeFileSync('src/app/page.tsx', page, 'utf-8');
  console.log('Passed props to ImageUpload');
} else {
  console.log('Target not found in page.tsx');
}
