const fs = require('fs');

let code = fs.readFileSync('src/app/settings/SettingsClient.tsx', 'utf-8');

// Add LogOut icon
code = code.replace(
  `import { Loader2, User, Camera, Save, Lock } from 'lucide-react';`,
  `import { Loader2, User, Camera, Save, Lock, LogOut } from 'lucide-react';`
);

// Add logout function
const logoutFn = `
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
`;

code = code.replace(
  `  const handlePasswordChange = async (e: React.FormEvent) => {`,
  logoutFn + `\n  const handlePasswordChange = async (e: React.FormEvent) => {`
);

// Add logout button at the bottom
const buttonCode = `
      <div className="ios-glass p-8 rounded-3xl mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <LogOut className="w-5 h-5 text-red-500" /> ?ng xut
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">?ng xut kh?i tAi khon trAn thit b< nAy.</p>
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-colors font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          ?ng xut
        </button>
      </div>
    </div>
  );
}
`;

code = code.replace(
  `    </div>
  );
}`,
  buttonCode
);

fs.writeFileSync('src/app/settings/SettingsClient.tsx', code, 'utf-8');
console.log('Added logout button to settings');
