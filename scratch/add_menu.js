const fs = require('fs');

function addMenuItem(file, isMobile) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Need to import Wrench icon
  if (!code.includes('Wrench')) {
    code = code.replace(/Settings,/g, 'Settings, Wrench,');
  }

  // Sidebar specific replacement
  if (!isMobile) {
    const target = `<Link href="/settings" className={cn(`;
    const replacement = `<Link href="/utilities" className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium",
              pathname === '/utilities' 
                ? "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white" 
                : "text-slate-500 hover:text-slate-900 hover:bg-white/20 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
            )}>
              <Wrench className="w-5 h-5" />
              <span>Tiện ích</span>
            </Link>
            <Link href="/settings" className={cn(`;
    
    if (!code.includes('href="/utilities"')) {
      code = code.replace(target, replacement);
    }
  } else {
    // MobileNav specific replacement
    const target = `<Link href="/settings" className={cn(`;
    const replacement = `<Link href="/utilities" className={cn(
          "flex flex-col items-center p-2 rounded-xl transition-all duration-300 relative",
          pathname === '/utilities' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
        )}>
          {pathname === '/utilities' && (
            <span className="absolute -top-1 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full"></span>
          )}
          <Wrench className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">Tiện ích</span>
        </Link>
        <Link href="/settings" className={cn(`;
    
    if (!code.includes('href="/utilities"')) {
      code = code.replace(target, replacement);
    }
  }

  fs.writeFileSync(file, code, 'utf-8');
}

addMenuItem('src/components/layout/Sidebar.tsx', false);
addMenuItem('src/components/layout/MobileNav.tsx', true);
console.log('Added Utilities menu');
