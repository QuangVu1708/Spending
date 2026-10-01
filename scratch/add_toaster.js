const fs = require('fs');
let layout = fs.readFileSync('src/app/layout.tsx', 'utf-8');

const targetImport = `import WelcomeScreen from "@/components/WelcomeScreen";`;
const replacementImport = `import WelcomeScreen from "@/components/WelcomeScreen";\nimport { Toaster } from 'react-hot-toast';`;

const targetBody = `<ThemeProvider>`;
const replacementBody = `<ThemeProvider>\n        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', borderRadius: '16px' } }} />`;

if (layout.includes(targetImport) && !layout.includes('react-hot-toast')) {
  layout = layout.replace(targetImport, replacementImport);
  layout = layout.replace(targetBody, replacementBody);
  fs.writeFileSync('src/app/layout.tsx', layout, 'utf-8');
  console.log('Toaster added to layout');
} else {
  console.log('Toaster already added or target not found');
}
