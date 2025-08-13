"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  DollarSign, 
  Receipt, 
  Settings, 
  HelpCircle,
  Home,
  Users
} from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/net-new-money', label: 'Net New Money', icon: TrendingUp },
  { href: '/custodia', label: 'Custódia', icon: Wallet },
  { href: '/receitas', label: 'Receitas', icon: DollarSign },
  { href: '/comissoes', label: 'Comissões', icon: Receipt },
];

export default function Sidebar(){
  const pathname = usePathname();
  
  return (
    <aside className="w-64 shrink-0 p-4">
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        {/* Logo/Brand */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">InvestDash</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {items.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t" />

        {/* Settings Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
            Configurações
          </p>
          
          <Link 
            href="/settings" 
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
          
          <Link 
            href="/help" 
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <HelpCircle className="w-5 h-5" />
            Ajuda
          </Link>
        </div>

        {/* User Info */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/50">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-foreground">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Usuário</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


