const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf-8');

const regex = /export const metadata: Metadata = \{/;
const replacement = `export const metadata: Metadata = {
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceAI",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",`;

if (!code.includes('manifest: "/manifest.json"')) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/app/layout.tsx', code, 'utf-8');
}
console.log('Linked manifest in layout');
