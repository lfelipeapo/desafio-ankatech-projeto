import './globals.css';
import Link from 'next/link';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/toaster';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import React from 'react';
import GlobalSearch from '@/components/GlobalSearch';
import UserMenu from '@/components/UserMenu';
import { Bell } from 'lucide-react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = cookies().get('theme')?.value;
  const isDark = theme ? theme === 'dark' : false;
  
  return (
    <html lang="pt-BR" suppressHydrationWarning className={isDark ? 'dark' : ''}>
      <body className="bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="container flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">I</span>
              </div>
              InvestDash
            </Link>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              <GlobalSearch />
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </button>
              
              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tema</span>
                <ThemeToggle defaultDark={isDark} />
              </div>
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </nav>
        </header>

        <Providers>
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="container py-6">
                {children}
              </div>
            </main>
          </div>
        </Providers>
        
        <Toaster />
      </body>
    </html>
  );
}