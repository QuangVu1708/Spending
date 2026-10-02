const fs = require('fs');

let code = fs.readFileSync('src/components/layout/MobileNav.tsx', 'utf-8');

// The replacement logic:
const navTarget = `<nav className="flex items-center justify-around p-2">
        {menuItems.filter(i => isAdmin ? true : i.path !== '/admin').map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all min-w-[4rem]",
                isActive 
                  ? "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white px-3" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent px-3"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "bg-white/40 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/10 text-slate-900 dark:text-white px-3")} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>`;

const navReplacement = `<nav className="flex items-center justify-around px-1 py-2 w-full gap-1">
        {menuItems.filter(i => isAdmin ? true : i.path !== '/admin').map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-xl transition-all flex-1 min-w-0",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis px-0.5 w-full text-center">{item.name}</span>
            </Link>
          );
        })}
      </nav>`;

if (code.includes('justify-around p-2')) {
  code = code.replace(navTarget, navReplacement);
} else {
  console.log("Nav replacement failed, target not found exactly");
}

fs.writeFileSync('src/components/layout/MobileNav.tsx', code, 'utf-8');
console.log('Fixed MobileNav');
