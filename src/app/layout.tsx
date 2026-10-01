import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNav from "@/components/layout/MobileNav";
import { createClient } from "@/utils/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "FinanceAI - Quản lý tài chính cá nhân",
  description: "Theo dõi chi tiêu và tự động hóa với AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;
    if (profile?.role === 'admin') {
      isAdmin = true;
    }
  }



  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} text-slate-900 dark:text-slate-100 flex antialiased min-h-screen transition-colors duration-500 md:flex-row flex-col selection:bg-indigo-500/30 relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Apple iOS Liquid Background */}
          <div className="liquid-bg-container">
            <div className="liquid-blob liquid-blob-1"></div>
            <div className="liquid-blob liquid-blob-2"></div>
            <div className="liquid-blob liquid-blob-3"></div>
          </div>

          
            {user && !user.user_metadata?.is_onboarded ? (
              <WelcomeScreen user={user} profile={userProfile} />
            ) : (
              <>
                {user && (
                  <>
                    <Sidebar isAdmin={isAdmin} profile={userProfile} />
                    <MobileHeader profile={userProfile} />
                  </>
                )}
                
                <main className={`flex-1 flex flex-col ${user ? 'h-[calc(100vh-60px)] md:h-screen' : 'h-screen'} overflow-hidden ${!user ? 'justify-center items-center' : ''} z-10`}>
                  <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-12 w-full custom-scrollbar">
                    <div className="max-w-6xl mx-auto w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                      {children}
                    </div>
                  </div>
                </main>
                
                {user && <MobileNav isAdmin={isAdmin} />}
              </>
            )}

        </ThemeProvider>
      </body>
    </html>
  );
}
