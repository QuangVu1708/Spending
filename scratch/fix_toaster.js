const fs = require('fs');

let layout = fs.readFileSync('src/app/layout.tsx', 'utf-8');

const target = `{/* Apple iOS Liquid Background */}`;
const replacement = `{/* Apple iOS Liquid Background */}
          <Toaster 
            position="top-center" 
            toastOptions={{ 
              duration: 4000, 
              style: { background: '#27272a', color: '#fff', borderRadius: '16px', fontWeight: 'bold' } 
            }} 
          />`;

if (layout.includes(target) && !layout.includes('<Toaster position="top-center"')) {
  layout = layout.replace(target, replacement);
  fs.writeFileSync('src/app/layout.tsx', layout, 'utf-8');
  console.log('Toaster added correctly!');
} else {
  console.log('Toaster already there or target not found');
}
