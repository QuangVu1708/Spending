const fs = require('fs');

let code = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf-8');

// Replace LogOut with Settings and Utilities icons
code = code.replace(
  `import { Moon, Sun, LogOut } from 'lucide-react';`,
  `import { Moon, Sun, Settings, Wrench } from 'lucide-react';\nimport Link from 'next/link';`
);

// Remove handleLogout since it's no longer used here
code = code.replace(
  `  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };`,
  ``
);

const targetDiv = `<button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>`;

const replacementDiv = `<Link href="/utilities" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
          <Wrench className="w-5 h-5" />
        </Link>
        <Link href="/settings" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">
          <Settings className="w-5 h-5" />
        </Link>`;

code = code.replace(targetDiv, replacementDiv);
fs.writeFileSync('src/components/layout/MobileHeader.tsx', code, 'utf-8');
console.log('Fixed MobileHeader');
